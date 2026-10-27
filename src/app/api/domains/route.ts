import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getAuthUser, checkRateLimit } from '@/lib/auth';
import {
  DOMAIN_REGEX,
  isPlatformHost,
  isVercelDomainsConfigured,
  addDomainToProject,
  removeDomainFromProject,
  getDomainStatus,
} from '@/lib/vercel-domains';

export const dynamic = 'force-dynamic';

function normalizeDomain(input: unknown) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

/** Owner: current custom domain and its DNS status. */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { customDomain: true } });
  const domain = record?.customDomain || null;
  const configured = isVercelDomainsConfigured();

  if (!domain || !configured) {
    return NextResponse.json({ configured, domain, status: null });
  }
  return NextResponse.json({ configured, domain, status: await getDomainStatus(domain) });
}

/** Owner: connect a custom domain (replaces any existing one). */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isVercelDomainsConfigured()) {
    return NextResponse.json({ error: 'الدومينات الخاصة غير مفعّلة على المنصة / Custom domains are not configured' }, { status: 503 });
  }

  const rl = checkRateLimit(`domains:${user.id}`, 10, 60 * 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'محاولات كثيرة / Too many requests' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const domain = normalizeDomain(body.domain);

  if (!DOMAIN_REGEX.test(domain) || isPlatformHost(domain)) {
    return NextResponse.json({ error: 'اسم دومين غير صالح / Invalid domain name' }, { status: 400 });
  }

  const taken = await prisma.user.findFirst({ where: { customDomain: domain, NOT: { id: user.id } } });
  if (taken) {
    return NextResponse.json({ error: 'هذا الدومين مستخدم بالفعل / Domain already in use' }, { status: 409 });
  }

  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { customDomain: true } });

  const added = await addDomainToProject(domain);
  // 409 from Vercel means it's already on this project (e.g. a retry), which is fine
  if (!added.ok && added.status !== 409) {
    const msg = added.data?.error?.message || 'Vercel rejected the domain';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (current?.customDomain && current.customDomain !== domain) {
    await removeDomainFromProject(current.customDomain);
  }

  await prisma.user.update({ where: { id: user.id }, data: { customDomain: domain } });
  revalidatePath(`/d/${domain}`);

  return NextResponse.json({ domain, status: await getDomainStatus(domain) });
}

/** Owner: disconnect the custom domain. */
export async function DELETE(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { customDomain: true } });
  if (record?.customDomain) {
    if (isVercelDomainsConfigured()) await removeDomainFromProject(record.customDomain);
    await prisma.user.update({ where: { id: user.id }, data: { customDomain: null } });
  }
  return NextResponse.json({ domain: null });
}
