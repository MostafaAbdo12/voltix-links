import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = Number(searchParams.get('days') || '30');
    const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [views, clicks, links] = await Promise.all([
      prisma.pageView.findMany({
        where: { userId: user.id, createdAt: { gte: sinceDate } },
        select: {
          visitorHash: true,
          country: true,
          deviceType: true,
          source: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.linkClick.findMany({
        where: { userId: user.id, createdAt: { gte: sinceDate } },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.link.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          url: true,
          clicksCount: true,
        },
        orderBy: { clicksCount: 'desc' },
      }),
    ]);

    const totalViews = views.length;
    const totalClicks = clicks.length;
    const uniqueVisitors = new Set(views.map((v) => v.visitorHash)).size;
    const ctr = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(1)) : 0;

    // Daily series
    const dailyMap = new Map<string, { date: string; views: number; clicks: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dailyMap.set(d, { date: d, views: 0, clicks: 0 });
    }
    views.forEach((v) => {
      const d = v.createdAt.toISOString().slice(0, 10);
      const item = dailyMap.get(d);
      if (item) item.views += 1;
    });
    clicks.forEach((c) => {
      const d = c.createdAt.toISOString().slice(0, 10);
      const item = dailyMap.get(d);
      if (item) item.clicks += 1;
    });

    // Breakdown by Country, Device, Source
    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};

    views.forEach((v) => {
      countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
      deviceCounts[v.deviceType] = (deviceCounts[v.deviceType] || 0) + 1;
      sourceCounts[v.source] = (sourceCounts[v.source] || 0) + 1;
    });

    return NextResponse.json({
      days,
      totalViews,
      totalClicks,
      uniqueVisitors,
      ctr,
      dailySeries: Array.from(dailyMap.values()),
      topLinks: links.slice(0, 8).map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        clicksCount: l.clicksCount,
      })),
      countries: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      devices: Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
      sources: Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    console.error('Analytics stats error:', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
