import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        configured: false,
        message:
          'لتفعيل تسجيل الدخول عبر Google OAuth، يرجى إضافة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في ملف .env / Please configure GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env to enable Google OAuth.',
      },
      { status: 200 }
    );
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');

  return NextResponse.redirect(googleAuthUrl.toString());
}

