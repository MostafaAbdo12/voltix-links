import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import {
  getCurrentUser,
  getAuthUser,
  sanitizeText,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  validateSafeUrl,
} from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { passwordHash: _ph, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Optional: Check if another user's ID was passed in body (authorization isolation check)
    if (body.targetUserId && body.targetUserId !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل بيانات مستخدم آخر / Forbidden: Cannot modify another user' },
        { status: 403 }
      );
    }

    // Handle password change if requested
    if (body.currentPassword && body.newPassword) {
      const valid = await verifyPassword(body.currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { error: 'كلمة المرور الحالية غير صحيحة / Incorrect current password' },
          { status: 400 }
        );
      }
      if (String(body.newPassword).length < 8) {
        return NextResponse.json(
          { error: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل / Min 8 chars required' },
          { status: 400 }
        );
      }
      const newHash = await hashPassword(body.newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      return NextResponse.json({ success: true, message: 'Password updated' });
    }

    // Check username uniqueness if username changed
    let nextUsername = user.username;
    if (body.username && typeof body.username === 'string') {
      const candidate = body.username.toLowerCase().trim();
      if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(candidate)) {
        return NextResponse.json(
          { error: 'اسم المستخدم غير صالح (3-30 حرفًا إنجليزيًا أو رقمًا) / Invalid username format' },
          { status: 400 }
        );
      }
      if (candidate !== user.username) {
        const taken = await prisma.user.findUnique({ where: { username: candidate } });
        if (taken) {
          return NextResponse.json(
            { error: 'اسم المستخدم محجوز بالفعل / Username is already taken' },
            { status: 409 }
          );
        }
        nextUsername = candidate;
      }
    }

    // Update User base fields only if provided
    const userUpdateData: Record<string, unknown> = {};
    if (nextUsername !== user.username) {
      userUpdateData.username = nextUsername;
    }
    if (typeof body.displayName === 'string') {
      userUpdateData.displayName = sanitizeText(body.displayName, 80);
    }
    if (typeof body.bio === 'string') {
      userUpdateData.bio = sanitizeText(body.bio, 400);
    }
    if (typeof body.avatarUrl === 'string') {
      userUpdateData.avatarUrl = body.avatarUrl;
    }
    if (body.avatarPosition) {
      userUpdateData.avatarPosition =
        typeof body.avatarPosition === 'string'
          ? body.avatarPosition
          : JSON.stringify(body.avatarPosition);
    }
    if (typeof body.coverUrl === 'string') {
      userUpdateData.coverUrl = body.coverUrl;
    }
    if (body.coverPosition) {
      userUpdateData.coverPosition =
        typeof body.coverPosition === 'string'
          ? body.coverPosition
          : JSON.stringify(body.coverPosition);
    }
    if (body.locale === 'ar' || body.locale === 'en') {
      userUpdateData.locale = body.locale;
    }

    // Prepare batched operations for ultra-fast single transaction execution
    const txOps: any[] = [];

    if (Object.keys(userUpdateData).length > 0) {
      txOps.push(
        prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        })
      );
    }

    // Update ProfileConfig if provided
    if (body.profileConfig && typeof body.profileConfig === 'object') {
      const pc = body.profileConfig;
      const configUpdate: Record<string, unknown> = {};

      if (typeof pc.themeId === 'string') configUpdate.themeId = pc.themeId;
      if (typeof pc.layout === 'string') configUpdate.layout = pc.layout;
      if (typeof pc.entranceAnimation === 'string') configUpdate.entranceAnimation = pc.entranceAnimation;
      if (typeof pc.moodPreset === 'string') configUpdate.moodPreset = pc.moodPreset;
      if (pc.customThemeJson !== undefined) {
        configUpdate.customThemeJson =
          typeof pc.customThemeJson === 'string'
            ? pc.customThemeJson
            : JSON.stringify(pc.customThemeJson);
      }
      if (pc.effectsConfigJson !== undefined) {
        configUpdate.effectsConfigJson =
          typeof pc.effectsConfigJson === 'string'
            ? pc.effectsConfigJson
            : JSON.stringify(pc.effectsConfigJson);
      }
      if (pc.sectionsOrderJson !== undefined) {
        configUpdate.sectionsOrderJson =
          typeof pc.sectionsOrderJson === 'string'
            ? pc.sectionsOrderJson
            : JSON.stringify(pc.sectionsOrderJson);
      }
      if (pc.mediaEmbedJson !== undefined) {
        configUpdate.mediaEmbedJson =
          typeof pc.mediaEmbedJson === 'string'
            ? pc.mediaEmbedJson
            : JSON.stringify(pc.mediaEmbedJson);
      }
      if (pc.qrConfigJson !== undefined) {
        configUpdate.qrConfigJson =
          typeof pc.qrConfigJson === 'string'
            ? pc.qrConfigJson
            : JSON.stringify(pc.qrConfigJson);
      }
      if (typeof pc.seoTitle === 'string') configUpdate.seoTitle = sanitizeText(pc.seoTitle, 120);
      if (typeof pc.seoDescription === 'string') configUpdate.seoDescription = sanitizeText(pc.seoDescription, 300);
      if (typeof pc.ogImageUrl === 'string') configUpdate.ogImageUrl = pc.ogImageUrl;
      if (typeof pc.canonicalUrl === 'string') configUpdate.canonicalUrl = pc.canonicalUrl;
      if (typeof pc.robotsIndex === 'boolean') configUpdate.robotsIndex = pc.robotsIndex;

      txOps.push(
        prisma.profileConfig.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...configUpdate,
          },
          update: configUpdate,
        })
      );
    }

    // Update SocialLinks if provided
    if (Array.isArray(body.socialLinks)) {
      txOps.push(prisma.socialLink.deleteMany({ where: { userId: user.id } }));
      const validSocials = body.socialLinks
        .filter((s: { platform?: string; url?: string }) => s.platform && s.url && s.url.trim() !== '')
        .map((s: { platform: string; url: string; isActive?: boolean }, idx: number) => {
          const checked = validateSafeUrl(s.url);
          return {
            userId: user.id,
            platform: s.platform.toLowerCase(),
            url: checked.valid ? checked.normalized : s.url,
            order: idx,
            isActive: s.isActive !== false,
          };
        });

      if (validSocials.length > 0) {
        txOps.push(prisma.socialLink.createMany({ data: validSocials }));
      }
    }

    // Execute all updates in a single round trip
    if (txOps.length > 0) {
      await prisma.$transaction(txOps);
    }

    if (nextUsername !== user.username) {
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        username: nextUsername,
        role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
      });
    }

    try {
      revalidatePath(`/u/${user.username}`);
      revalidatePath(`/@${user.username}`);
      if (nextUsername !== user.username) {
        revalidatePath(`/u/${nextUsername}`);
        revalidatePath(`/@${nextUsername}`);
      }
    } catch {}

    return NextResponse.json({ success: true, message: 'Profile saved successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
