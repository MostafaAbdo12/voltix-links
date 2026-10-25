import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { passwordHash: _ph, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
