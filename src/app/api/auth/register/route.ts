import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  hashPassword,
  setSessionCookie,
  checkRateLimit,
  sanitizeText,
} from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح / Invalid email'),
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل / Username min 3 chars')
    .max(30, 'اسم المستخدم طويل جدًا / Username max 30 chars')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'اسم المستخدم يقبل الحروف الإنجليزية والأرقام والشرطة السفلية فقط / Letters, numbers, _ . - only'
    ),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل / Password must be at least 8 characters'),
  displayName: z.string().min(1).max(60).optional(),
  locale: z.enum(['ar', 'en']).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`register:${ip}`, 15, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح من المحاولات، يرجى الانتظار قليلاً / Too many requests' },
        { status: 429 }
      );
    }

    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (siteSettings && !siteSettings.allowRegistrations) {
      return NextResponse.json(
        { error: 'التسجيل مغلق حاليًا من قِبل الإدارة / Registrations are currently closed' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const username = parsed.data.username.toLowerCase().trim();
    const displayName = sanitizeText(parsed.data.displayName || username, 60);
    const locale = parsed.data.locale || 'ar';

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مسجل بالفعل / Email is already registered' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'اسم المستخدم محجوز بالفعل، اختر اسمًا آخر / Username is already taken' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const defaultThemeId = siteSettings?.defaultThemeId || 'obsidian-luxury';

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName,
        bio:
          locale === 'ar'
            ? 'مرحبًا بك في مساحتي الرقمية الخاصة عبر VoltiX LINKS ✨'
            : 'Welcome to my digital identity hub powered by VoltiX LINKS ✨',
        locale,
        profileConfig: {
          create: {
            themeId: defaultThemeId,
            layout: 'centered',
            entranceAnimation: 'cinematic-fade',
            moodPreset: 'luxury',
            seoTitle: `${displayName} (@${username}) | VoltiX LINKS`,
            seoDescription: `Explore all official links, projects, and social channels of ${displayName}.`,
          },
        },
        links: {
          create: [
            {
              title: locale === 'ar' ? 'موقعي الشخصي ومعرض أعمالي' : 'Official Portfolio & Website',
              url: 'https://voltix-link.vercel.app',
              description:
                locale === 'ar'
                  ? 'استكشف أحدث أعمالي ومشاريعي الرقمية'
                  : 'Explore my latest creative works & case studies',
              icon: 'Sparkles',
              cardType: 'spotlight',
              isFeatured: true,
              badgeText: locale === 'ar' ? 'مميز' : 'Featured',
              order: 0,
            },
            {
              title: locale === 'ar' ? 'تواصل معي للأعمال والتعاون' : 'Book a Strategy Consultation',
              url: 'https://voltix-link.vercel.app',
              description:
                locale === 'ar'
                  ? 'متاح للمشاريع الإبداعية والاستشارات'
                  : 'Direct booking for creative & tech collaborations',
              icon: 'Briefcase',
              cardType: 'glass',
              isFeatured: false,
              order: 1,
            },
          ],
        },
      },
      include: {
        profileConfig: true,
        links: true,
        socialLinks: true,
      },
    });

    // Create email verification token
    const verifyToken = `verify_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: verifyToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          locale: user.locale,
        },
        verificationTokenPreview: verifyToken,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب / Registration failed' },
      { status: 500 }
    );
  }
}

