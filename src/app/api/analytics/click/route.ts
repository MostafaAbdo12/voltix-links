import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/auth';

function detectDevice(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectSource(ref: string): string {
  if (!ref) return 'Direct';
  const r = ref.toLowerCase();
  if (r.includes('instagram')) return 'Instagram';
  if (r.includes('tiktok')) return 'TikTok';
  if (r.includes('t.co') || r.includes('twitter') || r.includes('x.com')) return 'X';
  if (r.includes('youtube')) return 'YouTube';
  if (r.includes('google')) return 'Google';
  return 'Other';
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = checkRateLimit(`click:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ recorded: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { linkId, referrer = '' } = body;

    if (!linkId) {
      return NextResponse.json({ error: 'linkId required' }, { status: 400 });
    }

    const link = await prisma.link.findUnique({ where: { id: String(linkId) } });
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || body.country || 'SA';
    const dayKey = new Date().toISOString().slice(0, 10);
    const visitorHash = Buffer.from(`${ip}:${ua.slice(0, 32)}:${dayKey}`).toString('base64').slice(0, 24);

    const [updatedLink] = await prisma.$transaction([
      prisma.link.update({
        where: { id: link.id },
        data: { clicksCount: { increment: 1 } },
      }),
      prisma.linkClick.create({
        data: {
          linkId: link.id,
          userId: link.userId,
          visitorHash,
          country: String(country).slice(0, 8),
          deviceType: detectDevice(ua),
          referrer: String(referrer).slice(0, 200),
          source: detectSource(String(referrer)),
        },
      }),
    ]);

    return NextResponse.json({
      recorded: true,
      clicksCount: updatedLink.clicksCount,
    });
  } catch (err) {
    console.error('Analytics click error:', err);
    return NextResponse.json({ recorded: false }, { status: 500 });
  }
}
