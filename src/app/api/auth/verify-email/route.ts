import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { getCurrentUser, checkRateLimit } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`verify:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { token, action } = body;

    if (action === 'request') {
      const user = await getCurrentUser(req);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const secureRandom = crypto.randomBytes(32).toString('hex');
      const verifyToken = `vfy_${secureRandom}`;

      await prisma.verificationToken.updateMany({
        where: { email: user.email, used: false },
        data: { used: true },
      });

      await prisma.verificationToken.create({
        data: {
          email: user.email,
          token: verifyToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      const isDev = process.env.NODE_ENV !== 'production';

      return NextResponse.json({
        success: true,
        verificationToken: isDev && !process.env.SMTP_HOST ? verifyToken : undefined,
        verifyUrl: isDev && !process.env.SMTP_HOST ? `/verify-email?token=${verifyToken}` : undefined,
      });
    }

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.used || new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صالح أو منتهي الصلاحية / Invalid or expired verification token' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح / Email verified successfully',
    });
  } catch (err) {
    console.error('Verify email error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
