import { NextResponse } from 'next/server';
import { getAuthUser, checkRateLimit } from '@/lib/auth';
import { isGoogleMapsUrl, isShortMapsUrl, extractMapQuery } from '@/lib/maps';

export const dynamic = 'force-dynamic';

// Every redirect hop must stay on Google, so this can never be used to reach other hosts (SSRF)
const ALLOWED_HOP = /^(maps\.app\.goo\.gl|goo\.gl|(www\.|maps\.|consent\.)?google\.[a-z.]+)$/i;

async function expandShortLink(url: string): Promise<string | null> {
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    const host = new URL(current).hostname;
    if (!ALLOWED_HOP.test(host)) return null;
    // Google's EU consent wall wraps the real destination in ?continue=
    if (host.startsWith('consent.')) {
      const next = new URL(current).searchParams.get('continue');
      if (!next) return null;
      current = next;
      continue;
    }
    if (!isShortMapsUrl(current)) return current;
    const res = await fetch(current, { method: 'GET', redirect: 'manual', cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0 VoltiX' } });
    const location = res.headers.get('location');
    if (!location) return null;
    current = new URL(location, current).toString();
  }
  return null;
}

/** Owner: turn any Google Maps link (including maps.app.goo.gl short links) into a place query. */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`maps-resolve:${user.id}`, 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url || !isGoogleMapsUrl(url)) {
    return NextResponse.json({ error: 'ليس رابط خرايط جوجل / Not a Google Maps link' }, { status: 400 });
  }

  try {
    const full = isShortMapsUrl(url) ? await expandShortLink(url) : url;
    const query = full ? extractMapQuery(full) : null;
    if (!query) {
      return NextResponse.json({ error: 'تعذر قراءة الموقع من الرابط / Could not read the place from this link' }, { status: 422 });
    }
    return NextResponse.json({ query });
  } catch {
    return NextResponse.json({ error: 'تعذر فتح الرابط / Could not open the link' }, { status: 502 });
  }
}
