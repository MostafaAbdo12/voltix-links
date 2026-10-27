import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/auth';
import { isMailerConfigured, sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`forgot:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'محاولات كثيرة، يرجى الانتظار دقيقة / Too many requests' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Secure response: do not leak whether an account exists
      return NextResponse.json({
        success: true,
        message:
          'إذا كان البريد مسجلاً، فقد تم إرسال تعليمات استعادة كلمة المرور / If registered, password reset instructions have been sent.',
      });
    }

    // Cryptographically secure 256-bit entropy token
    const secureRandom = crypto.randomBytes(32).toString('hex');
    const resetToken = `rst_${secureRandom}`;

    // Invalidate previous reset tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: resetToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour expiration
      },
    });

    const isDev = process.env.NODE_ENV !== 'production';
    const mailer = isMailerConfigured();

    if (mailer) {
      try {
        await sendPasswordResetEmail(normalizedEmail, resetToken);
      } catch (mailErr) {
        console.error('Password reset email failed:', mailErr);
        return NextResponse.json(
          { error: 'تعذر إرسال الإيميل، حاول مرة أخرى بعد قليل / Could not send the email, please try again shortly' },
          { status: 502 }
        );
      }
    } else if (!isDev) {
      console.error('Password reset requested but SMTP_USER/SMTP_PASS are not configured');
    }

    return NextResponse.json({
      success: true,
      message:
        'إذا كان البريد مسجلاً، فقد تم إرسال تعليمات استعادة كلمة المرور / If registered, password reset instructions have been sent.',
      // Only expose debug token in development environment without SMTP
      resetToken: isDev && !mailer ? resetToken : undefined,
      resetUrl: isDev && !mailer ? `/reset-password?token=${resetToken}` : undefined,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
