import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sanitizeText, checkRateLimit, getClientIp } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`report:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many reports' }, { status: 429 });
    }

    const body = await req.json();
    const username = String(body.username || '').toLowerCase().trim();
    const reason = sanitizeText(body.reason || 'INAPPROPRIATE', 80);
    const reporterNote = sanitizeText(body.reporterNote || '', 400);
    const targetUrl = sanitizeText(body.targetUrl || '', 250);

    const reportedUser = await prisma.user.findUnique({ where: { username } });
    if (!reportedUser) {
      return NextResponse.json({ error: 'Reported profile not found' }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        reportedUserId: reportedUser.id,
        reason,
        reporterNote,
        targetUrl,
      },
    });

    return NextResponse.json({ success: true, reportId: report.id }, { status: 201 });
  } catch (err) {
    console.error('Report creation error:', err);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

