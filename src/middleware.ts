import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /@username directly to /u/username
  if (pathname.startsWith('/@') && pathname.length > 2) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/u/${username}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/@:path*'],
};

