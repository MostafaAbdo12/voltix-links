import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aura-links-ultra-premium-jwt-secret-key-change-in-production-2026'
);

export const SESSION_COOKIE_NAME = 'aura_session';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || !payload.email) return null;
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      username: String(payload.username),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER',
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>) {
  const token = await createSessionToken(payload);
  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });
  } catch {
    // Called outside Next.js AsyncLocalStorage request context (e.g., direct test invocation)
  }
  return token;
}

export function clearSessionCookie() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Called outside Next.js AsyncLocalStorage request context
  }
}

export async function getSessionFromRequest(req?: Request): Promise<SessionPayload | null> {
  try {
    if (req) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        return verifySessionToken(decodeURIComponent(match[1]));
      }
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return verifySessionToken(authHeader.slice(7));
      }
    }
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getAuthUser(req?: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      isSuspended: true,
      passwordHash: true,
    },
  });

  if (!user || user.isSuspended) return null;
  return user;
}

export async function getCurrentUser(req?: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profileConfig: true,
      links: { orderBy: { order: 'asc' } },
      socialLinks: { orderBy: { order: 'asc' } },
      customThemes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user || user.isSuspended) return null;
  return user;
}

// ============================================================================
// SECURITY UTILITIES: Rate Limiting, XSS Sanitization & URL Validation
// ============================================================================

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 40, windowMs = 60_000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitBuckets.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function validateSafeUrl(rawUrl: string): { valid: boolean; normalized: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, normalized: '', error: 'URL is required' };
  }
  const trimmed = rawUrl.trim();
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return { valid: false, normalized: '', error: 'Unsafe URL protocol is not allowed' };
  }
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate) && !/^mailto:/i.test(candidate) && !/^tel:/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return { valid: false, normalized: '', error: 'Unsupported URL protocol' };
    }
    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, normalized: '', error: 'Invalid URL format' };
  }
}
