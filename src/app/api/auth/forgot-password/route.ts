import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`forgot:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Return generic success for security, without leaking email existence
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد مسجلاً، فقد تم إنشاء رابط استعادة كلمة المرور / If registered, a reset link has been generated.',
      });
    }

    const resetToken = `reset_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: resetToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء رمز استعادة كلمة المرور بنجاح / Password reset token generated.',
      // Returned when SMTP is not configured so the user/tester can complete the reset flow immediately:
      resetToken: !process.env.SMTP_HOST ? resetToken : undefined,
      resetUrl: !process.env.SMTP_HOST ? `/reset-password?token=${resetToken}` : undefined,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

