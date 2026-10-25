import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, sanitizeText } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customThemes = await prisma.customTheme.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ customThemes });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const name = sanitizeText(body.name || 'My Custom Theme', 60);
    const baseThemeId = sanitizeText(body.baseThemeId || 'obsidian-luxury', 60);
    const configJson =
      typeof body.configJson === 'string'
        ? body.configJson
        : JSON.stringify(body.configJson || {});

    const created = await prisma.customTheme.create({
      data: {
        userId: user.id,
        name,
        baseThemeId,
        configJson,
      },
    });

    return NextResponse.json({ customTheme: created }, { status: 201 });
  } catch (err) {
    console.error('Create custom theme error:', err);
    return NextResponse.json({ error: 'Failed to save custom theme' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const existing = await prisma.customTheme.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.customTheme.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete custom theme error:', err);
    return NextResponse.json({ error: 'Failed to delete custom theme' }, { status: 500 });
  }
}
