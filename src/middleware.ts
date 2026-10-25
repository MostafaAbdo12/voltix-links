import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'aura_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rewrite /@username directly to /u/username for spatial luxury URLs
  if (pathname.startsWith('/@') && pathname.length > 2) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/u/${username}`;
    const response = NextResponse.rewrite(url);
    applySecurityHeaders(response);
    return response;
  }

  // 2. Sovereign Edge Protection for /admin Web Cockpit
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', '/admin');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Sovereign Edge Protection for /api/admin Endpoints
  if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = request.headers.get('authorization');
    if (!sessionCookie && !authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrator session token required' },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
}

export const config = {
  matcher: [
    '/@:path*',
    '/admin/:path*',
    '/admin',
    '/api/admin/:path*',
    '/api/admin',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
