import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdminUser, sanitizeText } from '@/lib/auth';
import { PREMIUM_PLANS, type PremiumPlanKind } from '@/lib/theme-store';

export const dynamic = 'force-dynamic';

/** Admin: payment requests (pending first) and the payment instructions shown to buyers. */
export async function GET(req: Request) {
  const check = await requireAdminUser(req);
  if (!check.admin) return NextResponse.json({ error: check.error }, { status: check.status });

  const [requests, settings] = await Promise.all([
    prisma.paymentRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 100,
      include: { user: { select: { username: true, email: true, premiumUntil: true } } },
    }),
    prisma.siteSettings.findUnique({ where: { id: 'default' }, select: { paymentInstructions: true } }),
  ]);

  // status 'asc' happens to sort APPROVED < PENDING < REJECTED, so put PENDING first explicitly
  requests.sort((a, b) => Number(b.status === 'PENDING') - Number(a.status === 'PENDING'));

  return NextResponse.json({ requests, paymentInstructions: settings?.paymentInstructions || '' });
}

const reviewSchema = z.object({
  id: z.string().min(1),
  action: z.enum(['approve', 'reject']),
});

/** Admin: approve (grants the theme / extends Premium) or reject a payment request. */
export async function POST(req: Request) {
  const check = await requireAdminUser(req);
  if (!check.admin) return NextResponse.json({ error: check.error }, { status: check.status });
  const admin = check.admin;

  const parsed = reviewSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const request = await prisma.paymentRequest.findUnique({
    where: { id: parsed.data.id },
    include: { user: { select: { id: true, username: true, premiumUntil: true } } },
  });
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (request.status !== 'PENDING') {
    return NextResponse.json({ error: 'تمت مراجعة هذا الطلب بالفعل / Already reviewed' }, { status: 409 });
  }

  const approve = parsed.data.action === 'approve';
  const ops = [];

  // Guard against double-processing: only flip it if it's still PENDING
  ops.push(
    prisma.paymentRequest.updateMany({
      where: { id: request.id, status: 'PENDING' },
      data: { status: approve ? 'APPROVED' : 'REJECTED', reviewedBy: admin.email },
    })
  );

  if (approve) {
    if (request.kind === 'THEME' && request.themeId) {
      ops.push(
        prisma.themePurchase.upsert({
          where: { userId_themeId: { userId: request.userId, themeId: request.themeId } },
          update: {},
          create: { userId: request.userId, themeId: request.themeId },
        })
      );
    } else if (request.kind in PREMIUM_PLANS) {
      // Extend from the later of now or the current expiry, so renewals stack
      const now = Date.now();
      const current = request.user.premiumUntil?.getTime() ?? 0;
      const days = PREMIUM_PLANS[request.kind as PremiumPlanKind].days;
      ops.push(
        prisma.user.update({
          where: { id: request.userId },
          data: { premiumUntil: new Date(Math.max(now, current) + days * 86_400_000) },
        })
      );
    }
  }

  ops.push(
    prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: approve ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT',
        targetType: 'PAYMENT',
        targetId: request.id,
        details: `@${request.user.username} ${request.kind}${request.themeId ? ` ${request.themeId}` : ''} ${request.amount} EGP via ${request.method} (${request.reference})`,
      },
    })
  );

  await prisma.$transaction(ops);
  try {
    revalidatePath(`/u/${request.user.username}`);
  } catch {}

  return NextResponse.json({ ok: true, status: approve ? 'APPROVED' : 'REJECTED' });
}

/** Admin: set the payment instructions (wallet numbers, InstaPay handle…) shown at checkout. */
export async function PUT(req: Request) {
  const check = await requireAdminUser(req);
  if (!check.admin) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => ({}));
  const text = sanitizeText(String(body.paymentInstructions ?? ''), 1000);

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: { paymentInstructions: text },
    create: { id: 'default', paymentInstructions: text },
  });
  return NextResponse.json({ paymentInstructions: text });
}
