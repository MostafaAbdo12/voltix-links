import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthUser, checkRateLimit, getClientIp, sanitizeText } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const subscribeSchema = z.object({
  userId: z.string().min(1).max(64),
  email: z.string().trim().toLowerCase().email().max(254),
});

/** Public: a visitor subscribes to a profile owner's mailing list. */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`subscribe:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'محاولات كثيرة، حاول لاحقًا / Too many requests' }, { status: 429 });
    }

    const parsed = subscribeSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'بريد إلكتروني غير صالح / Invalid email' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, isSuspended: true, profileConfig: { select: { emailCaptureEnabled: true } } },
    });
    if (!owner || owner.isSuspended || !owner.profileConfig?.emailCaptureEnabled) {
      return NextResponse.json({ error: 'غير متاح / Not available' }, { status: 404 });
    }

    // Upsert so re-subscribing is silent and never reveals whether an email already exists
    await prisma.subscriber.upsert({
      where: { userId_email: { userId: owner.id, email: parsed.data.email } },
      update: {},
      create: {
        userId: owner.id,
        email: parsed.data.email,
        country: (req.headers.get('x-vercel-ip-country') || 'XX').slice(0, 8),
      },
    });

    return NextResponse.json({ subscribed: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'حدث خطأ / Failed to subscribe' }, { status: 500 });
  }
}

function toCsvCell(value: string) {
  // Prefix formula-like values so spreadsheets don't execute them (CSV injection)
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Owner: list subscribers and capture settings, or download them with ?format=csv. */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [subscribers, config] = await Promise.all([
    prisma.subscriber.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, country: true, createdAt: true },
    }),
    prisma.profileConfig.findUnique({
      where: { userId: user.id },
      select: { emailCaptureEnabled: true, emailCaptureTitle: true },
    }),
  ]);

  if (new URL(req.url).searchParams.get('format') === 'csv') {
    const rows = [
      'email,country,subscribed_at',
      ...subscribers.map((s) =>
        [toCsvCell(s.email), toCsvCell(s.country), toCsvCell(s.createdAt.toISOString())].join(',')
      ),
    ];
    return new NextResponse('﻿' + rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="voltix-subscribers-${user.username}.csv"`,
      },
    });
  }

  return NextResponse.json({
    subscribers,
    settings: {
      enabled: config?.emailCaptureEnabled ?? false,
      title: config?.emailCaptureTitle ?? '',
    },
  });
}

const settingsSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().max(120).optional(),
});

/** Owner: turn the subscribe form on/off and set its heading. */
export async function PUT(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = settingsSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const data: { emailCaptureEnabled?: boolean; emailCaptureTitle?: string } = {};
  if (parsed.data.enabled !== undefined) data.emailCaptureEnabled = parsed.data.enabled;
  if (parsed.data.title !== undefined) data.emailCaptureTitle = sanitizeText(parsed.data.title, 120);

  const config = await prisma.profileConfig.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
    select: { emailCaptureEnabled: true, emailCaptureTitle: true },
  });

  revalidatePath(`/u/${user.username}`);
  return NextResponse.json({ settings: { enabled: config.emailCaptureEnabled, title: config.emailCaptureTitle } });
}

/** Owner: remove one subscriber (?id=...). */
export async function DELETE(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // deleteMany scoped to the owner so one user can never delete another user's subscriber
  const { count } = await prisma.subscriber.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ deleted: count > 0 });
}
