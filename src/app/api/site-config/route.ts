import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminUser } from '@/lib/auth';
import {
  DEFAULT_SITE_CONFIG,
  parseExtendedSiteConfig,
  serializeExtendedSiteConfig,
  getCachedSiteConfig,
  setCachedSiteConfig,
  invalidateSiteConfigCache,
} from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fast path: In-memory cache hit (0ms latency, zero database overhead)
    const cached = getCachedSiteConfig();
    if (cached) {
      return NextResponse.json(
        { siteConfig: cached },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-Cache': 'HIT',
          },
        }
      );
    }

    // 2. Slow path: Fetch from PostgreSQL and populate cache
    const row = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    const siteConfig = parseExtendedSiteConfig(row);
    setCachedSiteConfig(siteConfig, 60_000);

    return NextResponse.json(
      { siteConfig },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'MISS',
        },
      }
    );
  } catch (err) {
    console.error('GET /api/site-config error:', err);
    return NextResponse.json({ siteConfig: DEFAULT_SITE_CONFIG });
  }
}

export async function PUT(req: Request) {
  // Sovereign Security Check: Enforce administrator credentials
  const check = await requireAdminUser(req);
  if (!check.admin) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = await req.json();

    if (body.action === 'reset_defaults') {
      const payload = serializeExtendedSiteConfig(DEFAULT_SITE_CONFIG);
      const updated = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...payload },
        update: payload,
      });

      // Purge cache immediately so all visitors see default settings instantly
      invalidateSiteConfigCache();

      return NextResponse.json({
        success: true,
        siteConfig: parseExtendedSiteConfig(updated),
      });
    }

    const incoming = body.siteConfig || body.settings || body || {};
    const payload = serializeExtendedSiteConfig(incoming);

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...payload,
      },
      update: payload,
    });

    // Invalidate in-memory cache to ensure instant live update
    invalidateSiteConfigCache();

    return NextResponse.json({
      success: true,
      siteConfig: parseExtendedSiteConfig(updated),
    });
  } catch (err) {
    console.error('PUT /api/site-config error:', err);
    return NextResponse.json(
      { error: 'Failed to save main website configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
