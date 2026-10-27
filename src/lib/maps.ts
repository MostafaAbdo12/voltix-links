/**
 * Google Maps link helpers shared by the dashboard, the API and the profile renderers.
 * Map links are stored as normal links; their display settings live in customStyleJson.map.
 */

export interface LinkMapSettings {
  /** What Google should search for: a place name, an address or "lat,lng". */
  query: string;
  /** Show an embedded map card, or a regular link button with a pin icon. */
  display: 'card' | 'button';
}

const MAPS_HOSTS = /^(www\.)?(google\.[a-z.]+|maps\.google\.[a-z.]+)$/i;

export function isGoogleMapsUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    if (u.hostname === 'maps.app.goo.gl') return true;
    if (u.hostname === 'goo.gl' && u.pathname.startsWith('/maps')) return true;
    if (/^maps\.google\./i.test(u.hostname)) return true;
    return MAPS_HOSTS.test(u.hostname) && u.pathname.startsWith('/maps');
  } catch {
    return false;
  }
}

export function isShortMapsUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.hostname === 'maps.app.goo.gl' || (u.hostname === 'goo.gl' && u.pathname.startsWith('/maps'));
  } catch {
    return false;
  }
}

/** Pulls the place out of a full Google Maps URL ("/place/Name", "@lat,lng", ?q=, ?query=). */
export function extractMapQuery(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const param = u.searchParams.get('q') || u.searchParams.get('query') || u.searchParams.get('destination') || u.searchParams.get('daddr');
    if (param) return param.trim();

    const place = u.pathname.match(/\/place\/([^/]+)/);
    if (place) return decodeURIComponent(place[1].replace(/\+/g, ' ')).trim();

    const coords = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || u.href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (coords) return `${coords[1]},${coords[2]}`;

    const ll = u.searchParams.get('ll');
    if (ll) return ll;
    return null;
  } catch {
    return null;
  }
}

export function mapEmbedUrl(query: string, locale: 'ar' | 'en' = 'ar') {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=${locale}`;
}

export function mapDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

/** Reads map settings from a link's customStyleJson (null for non-map links). */
export function getLinkMap(customStyleJson?: string | null): LinkMapSettings | null {
  if (!customStyleJson) return null;
  try {
    const parsed = JSON.parse(customStyleJson);
    const m = parsed?.map;
    if (m && typeof m.query === 'string' && m.query.trim()) {
      return { query: m.query.trim().slice(0, 300), display: m.display === 'button' ? 'button' : 'card' };
    }
  } catch {}
  return null;
}
