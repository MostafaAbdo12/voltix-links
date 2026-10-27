import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, checkRateLimit, getClientIp } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`reset:${ip}`, 8, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'محاولات كثيرة، يرجى الانتظار دقيقة / Too many reset attempts' },
        { status: 429 }
      );
    }

    const { token, newPassword } = await req.json();
    if (!token || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'الرمز وكلمة المرور الجديدة (8 أحرف على الأقل) مطلوبان / Valid token and min 8-char password required' },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.used || new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: 'رمز الاستعادة غير صالح أو منتهي الصلاحية / Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح / Password has been reset successfully',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
