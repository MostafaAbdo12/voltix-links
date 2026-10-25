import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, sanitizeText, validateSafeUrl } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.link.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل رابط مستخدم آخر / Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (typeof body.title === 'string') {
      const t = sanitizeText(body.title, 120);
      if (!t) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      updateData.title = t;
    }
    if (typeof body.url === 'string') {
      const check = validateSafeUrl(body.url);
      if (!check.valid) {
        return NextResponse.json({ error: check.error || 'Invalid URL' }, { status: 400 });
      }
      updateData.url = check.normalized;
    }
    if (typeof body.description === 'string') updateData.description = sanitizeText(body.description, 240);
    if (typeof body.icon === 'string') updateData.icon = sanitizeText(body.icon, 40);
    if (typeof body.thumbnailUrl === 'string') updateData.thumbnailUrl = body.thumbnailUrl;
    if (typeof body.groupName === 'string') updateData.groupName = sanitizeText(body.groupName, 60);
    if (typeof body.cardType === 'string') updateData.cardType = sanitizeText(body.cardType, 40);
    if (typeof body.isFeatured === 'boolean') updateData.isFeatured = body.isFeatured;
    if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;
    if (typeof body.order === 'number') updateData.order = body.order;
    if (typeof body.badgeText === 'string') updateData.badgeText = sanitizeText(body.badgeText, 30);
    if (body.customStyleJson !== undefined) {
      updateData.customStyleJson =
        typeof body.customStyleJson === 'string'
          ? body.customStyleJson
          : JSON.stringify(body.customStyleJson);
    }
    if (body.scheduledStart !== undefined) {
      updateData.scheduledStart = body.scheduledStart ? new Date(body.scheduledStart) : null;
    }
    if (body.scheduledEnd !== undefined) {
      updateData.scheduledEnd = body.scheduledEnd ? new Date(body.scheduledEnd) : null;
    }

    const updated = await prisma.link.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ link: updated });
  } catch (err) {
    console.error('Update link error:', err);
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.link.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف رابط مستخدم آخر / Forbidden' },
        { status: 403 }
      );
    }

    await prisma.link.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete link error:', err);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}

