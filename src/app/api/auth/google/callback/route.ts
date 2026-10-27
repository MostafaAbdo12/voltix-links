import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { hashPassword, setSessionCookie, sanitizeText, GOOGLE_STATE_COOKIE, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface GoogleUserInfo {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

function appUrl(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
}

function failRedirect(reason: string) {
  const res = NextResponse.redirect(appUrl(`/login?oauth_error=${encodeURIComponent(reason)}`));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}

/** Builds a unique username from the email's local part. */
async function generateUsername(email: string): Promise<string> {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'user';
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}${crypto.randomInt(1000, 9999)}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }
  return `${base}${crypto.randomBytes(4).toString('hex')}`;
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId || !clientSecret) return failRedirect('not_configured');

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = req.headers
    .get('cookie')
    ?.match(new RegExp(`(?:^|;\\s*)${GOOGLE_STATE_COOKIE}=([^;]+)`))?.[1];

  if (!code || !state || !cookieState || state !== cookieState) return failRedirect('invalid_state');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) return failRedirect('token_exchange_failed');
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return failRedirect('token_exchange_failed');

    const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!infoRes.ok) return failRedirect('userinfo_failed');
    const info = (await infoRes.json()) as GoogleUserInfo;

    // Only trust Google-verified emails, otherwise an attacker could claim someone else's account
    if (!info.email || !info.email_verified) return failRedirect('email_not_verified');
    const email = info.email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
      if (siteSettings && !siteSettings.allowRegistrations) return failRedirect('registrations_closed');

      const username = await generateUsername(email);
      const displayName = sanitizeText(info.name || username, 60);
      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName,
          // Random unusable password; the user can set one through "forgot password"
          passwordHash: await hashPassword(crypto.randomBytes(32).toString('hex')),
          avatarUrl: info.picture || '',
          emailVerified: new Date(),
          profileConfig: {
            create: {
              themeId: siteSettings?.defaultThemeId || 'obsidian-luxury',
              seoTitle: `${displayName} (@${username}) | VoltiX LINKS`,
              seoDescription: `Explore all official links, projects, and social channels of ${displayName}.`,
            },
          },
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    }

    if (user.isSuspended) return failRedirect('suspended');

    const token = await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    });

    const res = NextResponse.redirect(appUrl('/dashboard'));
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    });
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  } catch (err) {
    console.error('Google OAuth error:', err);
    return failRedirect('server_error');
  }
}
