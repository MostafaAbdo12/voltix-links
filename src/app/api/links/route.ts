import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getAuthUser, sanitizeText, validateSafeUrl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const links = await prisma.link.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const title = sanitizeText(body.title || '', 120);
    if (!title) {
      return NextResponse.json({ error: 'عنوان الرابط مطلوب / Link title is required' }, { status: 400 });
    }

    const urlCheck = validateSafeUrl(body.url || '');
    if (!urlCheck.valid) {
      return NextResponse.json(
        { error: urlCheck.error || 'الرابط غير صالح / Invalid URL' },
        { status: 400 }
      );
    }

    const count = await prisma.link.count({ where: { userId: user.id } });

    let targetCardType = body.cardType;
    if (!targetCardType) {
      const pc = await prisma.profileConfig.findUnique({ where: { userId: user.id } });
      if (pc?.customThemeJson) {
        try {
          const parsed = JSON.parse(pc.customThemeJson);
          if (parsed.defaultCardType) targetCardType = parsed.defaultCardType;
        } catch {}
      }
    }

    const created = await prisma.link.create({
      data: {
        userId: user.id,
        title,
        url: urlCheck.normalized,
        description: sanitizeText(body.description || '', 240),
        icon: sanitizeText(body.icon || 'Globe', 40),
        thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : '',
        groupName: sanitizeText(body.groupName || '', 60),
        cardType: sanitizeText(targetCardType || 'glass', 40),
        isFeatured: Boolean(body.isFeatured),
        isActive: body.isActive !== false,
        order: typeof body.order === 'number' ? body.order : count,
        badgeText: sanitizeText(body.badgeText || '', 30),
        customStyleJson:
          typeof body.customStyleJson === 'string'
            ? body.customStyleJson
            : JSON.stringify(body.customStyleJson || {}),
        scheduledStart: body.scheduledStart ? new Date(body.scheduledStart) : null,
        scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : null,
      },
    });

    try {
      revalidatePath(`/u/${user.username}`);
      revalidatePath(`/@${user.username}`);
    } catch {}

    return NextResponse.json({ link: created }, { status: 201 });
  } catch (err) {
    console.error('Create link error:', err);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

// Bulk reorder or apply global card type
export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Apply cardType to all links of this user
    if (body.applyCardTypeToAll && typeof body.cardType === 'string') {
      await prisma.link.updateMany({
        where: { userId: user.id },
        data: { cardType: body.cardType },
      });
      const updatedLinks = await prisma.link.findMany({
        where: { userId: user.id },
        orderBy: { order: 'asc' },
      });
      try {
        revalidatePath(`/u/${user.username}`);
        revalidatePath(`/@${user.username}`);
      } catch {}
      return NextResponse.json({ links: updatedLinks });
    }

    // Reorder links array: [{ id, order }]
    if (Array.isArray(body.orderedIds)) {
      const userLinks = await prisma.link.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      const ownedSet = new Set(userLinks.map((l) => l.id));

      for (const id of body.orderedIds) {
        if (!ownedSet.has(id)) {
          return NextResponse.json(
            { error: 'Forbidden: Cannot reorder links belonging to another user' },
            { status: 403 }
          );
        }
      }

      await prisma.$transaction(
        body.orderedIds.map((id: string, index: number) =>
          prisma.link.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      const updatedLinks = await prisma.link.findMany({
        where: { userId: user.id },
        orderBy: { order: 'asc' },
      });
      try {
        revalidatePath(`/u/${user.username}`);
        revalidatePath(`/@${user.username}`);
      } catch {}
      return NextResponse.json({ links: updatedLinks });
    }

    return NextResponse.json({ error: 'Invalid bulk operation' }, { status: 400 });
  } catch (err) {
    console.error('Bulk update links error:', err);
    return NextResponse.json({ error: 'Failed to update links' }, { status: 500 });
  }
}
