import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminUser, sanitizeText } from '@/lib/auth';
import { invalidateSiteConfigCache } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const check = await requireAdminUser(req);
  if (!check.admin) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const [
    totalUsers,
    activeUsers,
    totalProfiles,
    totalViews,
    totalClicks,
    users,
    reports,
    siteSettings,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isSuspended: false } }),
    prisma.profileConfig.count(),
    prisma.pageView.count(),
    prisma.linkClick.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        _count: {
          select: { links: true, pageViews: true, linkClicks: true },
        },
      },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reportedUser: {
          select: { id: true, username: true, email: true, displayName: true },
        },
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: 'default' } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    metrics: {
      totalUsers,
      activeUsers,
      totalProfiles,
      totalViews,
      totalClicks,
    },
    users,
    reports,
    siteSettings: siteSettings || {
      id: 'default',
      siteName: 'VoltiX',
      siteTaglineAr: 'هويتك الرقمية الفاخرة في رابط واحد',
      siteTaglineEn: 'Your Ultra-Luxury Digital Identity in One Link',
      logoText: 'VoltiX',
      defaultThemeId: 'obsidian-luxury',
      allowRegistrations: true,
      maintenanceMode: false,
      globalSeoTitle: 'VoltiX — Ultra-Premium Spatial Link-in-Bio Platform',
      globalSeoDescription:
        'Create an unforgettable luxury link-in-bio page with 20+ cinematic themes, liquid glass UI, interactive 3D effects, and real-time analytics.',
      disabledThemesJson: '[]',
    },
    auditLogs,
  });
}

export async function POST(req: Request) {
  const check = await requireAdminUser(req);
  if (!check.admin) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }
  const admin = check.admin;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'toggle_verify_user') {
      const target = await prisma.user.findUnique({ where: { id: body.userId } });
      if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const updated = await prisma.user.update({
        where: { id: target.id },
        data: { isVerified: !target.isVerified },
      });
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: updated.isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER',
          targetType: 'USER',
          targetId: target.id,
          details: `@${target.username} verification set to ${updated.isVerified}`,
        },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'toggle_suspend_user') {
      const target = await prisma.user.findUnique({ where: { id: body.userId } });
      if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      if (target.id === admin.id) {
        return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400 });
      }
      const updated = await prisma.user.update({
        where: { id: target.id },
        data: { isSuspended: !target.isSuspended },
      });
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: updated.isSuspended ? 'SUSPEND_USER' : 'ACTIVATE_USER',
          targetType: 'USER',
          targetId: target.id,
          details: `@${target.username} suspended=${updated.isSuspended}`,
        },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'change_role') {
      const newRole = body.role === 'ADMIN' ? 'ADMIN' : 'USER';
      const updated = await prisma.user.update({
        where: { id: body.userId },
        data: { role: newRole },
      });
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'CHANGE_USER_ROLE',
          targetType: 'USER',
          targetId: updated.id,
          details: `@${updated.username} role changed to ${newRole}`,
        },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'delete_user') {
      if (body.userId === admin.id) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
      }
      const target = await prisma.user.findUnique({ where: { id: body.userId } });
      if (target) {
        await prisma.user.delete({ where: { id: target.id } });
        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'DELETE_USER',
            targetType: 'USER',
            targetId: target.id,
            details: `Deleted @${target.username} (${target.email})`,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'resolve_report') {
      const status = body.status === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED';
      const report = await prisma.report.update({
        where: { id: body.reportId },
        data: { status, resolvedBy: admin.email },
      });
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: `REPORT_${status}`,
          targetType: 'REPORT',
          targetId: report.id,
          details: `Report ${report.id} marked as ${status}`,
        },
      });
      return NextResponse.json({ success: true, report });
    }

    if (action === 'update_site_settings') {
      const s = body.settings || {};
      const updated = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          siteName: sanitizeText(s.siteName || 'AURA LINKS', 60),
          siteTaglineAr: sanitizeText(s.siteTaglineAr || '', 160),
          siteTaglineEn: sanitizeText(s.siteTaglineEn || '', 160),
          logoText: sanitizeText(s.logoText || 'AURA', 24),
          defaultThemeId: sanitizeText(s.defaultThemeId || 'obsidian-luxury', 60),
          allowRegistrations: s.allowRegistrations !== false,
          maintenanceMode: Boolean(s.maintenanceMode),
          globalSeoTitle: sanitizeText(s.globalSeoTitle || '', 140),
          globalSeoDescription: sanitizeText(s.globalSeoDescription || '', 300),
          disabledThemesJson:
            typeof s.disabledThemesJson === 'string'
              ? s.disabledThemesJson
              : JSON.stringify(s.disabledThemesJson || []),
        },
        update: {
          siteName: sanitizeText(s.siteName || 'AURA LINKS', 60),
          siteTaglineAr: sanitizeText(s.siteTaglineAr || '', 160),
          siteTaglineEn: sanitizeText(s.siteTaglineEn || '', 160),
          logoText: sanitizeText(s.logoText || 'AURA', 24),
          defaultThemeId: sanitizeText(s.defaultThemeId || 'obsidian-luxury', 60),
          allowRegistrations: s.allowRegistrations !== false,
          maintenanceMode: Boolean(s.maintenanceMode),
          globalSeoTitle: sanitizeText(s.globalSeoTitle || '', 140),
          globalSeoDescription: sanitizeText(s.globalSeoDescription || '', 300),
          disabledThemesJson:
            typeof s.disabledThemesJson === 'string'
              ? s.disabledThemesJson
              : JSON.stringify(s.disabledThemesJson || []),
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'UPDATE_SITE_SETTINGS',
          targetType: 'SITE_SETTINGS',
          targetId: 'default',
          details: `Updated siteName="${updated.siteName}", defaultTheme="${updated.defaultThemeId}"`,
        },
      });

      invalidateSiteConfigCache();

      return NextResponse.json({ success: true, siteSettings: updated });
    }

    return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
  } catch (err) {
    console.error('Admin action error:', err);
    return NextResponse.json({ error: 'Admin action failed' }, { status: 500 });
  }
}
