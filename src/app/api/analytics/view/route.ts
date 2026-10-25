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
  if (r.includes('linkedin')) return 'LinkedIn';
  if (r.includes('snapchat')) return 'Snapchat';
  return 'Other';
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = checkRateLimit(`view:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ recorded: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { userId, username, referrer = '' } = body;

    let targetUserId = userId;
    if (!targetUserId && username) {
      const u = await prisma.user.findUnique({
        where: { username: String(username).toLowerCase() },
        select: { id: true },
      });
      targetUserId = u?.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || body.country || 'SA';
    const dayKey = new Date().toISOString().slice(0, 10);
    // Anonymized daily hash (no raw IP stored)
    const visitorHash = Buffer.from(`${ip}:${ua.slice(0, 32)}:${dayKey}`).toString('base64').slice(0, 24);

    await prisma.pageView.create({
      data: {
        userId: targetUserId,
        visitorHash,
        country: String(country).slice(0, 8),
        deviceType: detectDevice(ua),
        referrer: String(referrer).slice(0, 200),
        source: detectSource(String(referrer)),
      },
    });

    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error('Analytics view error:', err);
    return NextResponse.json({ recorded: false }, { status: 500 });
  }
}
