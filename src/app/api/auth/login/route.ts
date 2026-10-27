import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  verifyPassword,
  setSessionCookie,
  checkRateLimit, getClientIp,
} from '@/lib/auth';

const loginSchema = z.object({
  identifier: z.string().min(1, 'البريد الإلكتروني أو اسم المستخدم مطلوب / Email or username required'),
  password: z.string().min(1, 'كلمة المرور مطلوبة / Password required'),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`login:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'محاولات كثيرة جدًا، يرجى الانتظار دقيقة / Too many login attempts' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid credentials' },
        { status: 400 }
      );
    }

    const identifier = parsed.data.identifier.toLowerCase().trim();

    // Per-account limit so distributed attempts against one account are throttled too
    const accountRl = checkRateLimit(`login-account:${identifier}`, 10, 15 * 60_000);
    if (!accountRl.allowed) {
      return NextResponse.json(
        { error: 'محاولات كثيرة على هذا الحساب، حاول بعد 15 دقيقة / Too many attempts for this account, try again in 15 minutes' },
        { status: 429 }
      );
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة / Invalid email/username or password' },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'تم تعليق هذا الحساب من قِبل الإدارة / This account has been suspended' },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة / Invalid email/username or password' },
        { status: 401 }
      );
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        locale: user.locale,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول / Login failed' },
      { status: 500 }
    );
  }
}

