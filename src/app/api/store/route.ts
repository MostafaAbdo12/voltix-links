import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthUser, checkRateLimit, sanitizeText } from '@/lib/auth';
import { getThemeEntitlements } from '@/lib/entitlements';
import {
  PREMIUM_PLANS,
  PREMIUM_THEME_PRICES,
  NEW_THEME_IDS,
  FREE_THEME_IDS,
  getThemePrice,
  hasActivePremium,
} from '@/lib/theme-store';

export const dynamic = 'force-dynamic';

/** Owner: catalog prices, what they own, their payment requests and how to pay. */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [entitlements, requests, settings] = await Promise.all([
    getThemeEntitlements(user.id),
    prisma.paymentRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, kind: true, themeId: true, amount: true, status: true, createdAt: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: 'default' }, select: { paymentInstructions: true } }),
  ]);

  return NextResponse.json({
    freeThemeIds: FREE_THEME_IDS,
    premiumThemes: Object.entries(PREMIUM_THEME_PRICES).map(([themeId, price]) => ({
      themeId,
      price,
      isNew: NEW_THEME_IDS.has(themeId),
    })),
    plans: Object.entries(PREMIUM_PLANS).map(([kind, p]) => ({ kind, ...p })),
    ownedThemeIds: entitlements.ownedThemeIds,
    premiumUntil: entitlements.premiumUntil,
    premiumActive: hasActivePremium(entitlements),
    requests,
    paymentInstructions: settings?.paymentInstructions || '',
  });
}

const requestSchema = z.object({
  kind: z.enum(['THEME', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY']),
  themeId: z.string().max(60).optional(),
  method: z.enum(['vodafone_cash', 'instapay', 'other']),
  reference: z.string().trim().min(3).max(80),
  note: z.string().max(300).optional(),
});

/** Owner: "I paid, please activate" — creates a request an admin reviews. */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`store:${user.id}`, 6, 60 * 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'طلبات كثيرة، حاول لاحقًا / Too many requests' }, { status: 429 });

  const parsed = requestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات الدفع غير مكتملة / Incomplete payment details' }, { status: 400 });
  }
  const { kind, themeId, method, reference, note } = parsed.data;

  let amount: number;
  if (kind === 'THEME') {
    const price = themeId ? getThemePrice(themeId) : null;
    if (!themeId || price === null) {
      return NextResponse.json({ error: 'ثيم غير صالح / Invalid theme' }, { status: 400 });
    }
    const entitlements = await getThemeEntitlements(user.id);
    if (entitlements.ownedThemeIds.includes(themeId) || hasActivePremium(entitlements)) {
      return NextResponse.json({ error: 'الثيم متاح لك بالفعل / You already have this theme' }, { status: 409 });
    }
    amount = price;
  } else {
    amount = PREMIUM_PLANS[kind].price;
  }

  const duplicate = await prisma.paymentRequest.findFirst({
    where: { userId: user.id, kind, themeId: kind === 'THEME' ? themeId : null, status: 'PENDING' },
  });
  if (duplicate) {
    return NextResponse.json({ error: 'لديك طلب قيد المراجعة بالفعل / A request is already pending' }, { status: 409 });
  }

  const request = await prisma.paymentRequest.create({
    data: {
      userId: user.id,
      kind,
      themeId: kind === 'THEME' ? themeId : null,
      amount,
      method,
      reference: sanitizeText(reference, 80),
      note: sanitizeText(note || '', 300),
    },
    select: { id: true, kind: true, themeId: true, amount: true, status: true, createdAt: true },
  });

  return NextResponse.json({ request }, { status: 201 });
}
