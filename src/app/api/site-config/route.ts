import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  DEFAULT_SITE_CONFIG,
  parseExtendedSiteConfig,
  serializeExtendedSiteConfig,
} from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    const siteConfig = parseExtendedSiteConfig(row);
    return NextResponse.json({ siteConfig });
  } catch (err) {
    console.error('GET /api/site-config error:', err);
    return NextResponse.json({ siteConfig: DEFAULT_SITE_CONFIG });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'reset_defaults') {
      const payload = serializeExtendedSiteConfig(DEFAULT_SITE_CONFIG);
      const updated = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...payload },
        update: payload,
      });
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
