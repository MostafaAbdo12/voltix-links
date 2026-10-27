/**
 * Thin wrapper over the Vercel REST API for attaching user custom domains to this project.
 * Requires VERCEL_API_TOKEN and VERCEL_PROJECT_ID (and VERCEL_TEAM_ID when the project belongs to a team).
 */

const API = 'https://api.vercel.com';

export const DOMAIN_REGEX = /^(?=.{4,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

export function isVercelDomainsConfigured() {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

/** Hostnames that belong to the platform itself and must never be claimed by a user. */
export function isPlatformHost(host: string) {
  const appHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL || '').hostname;
    } catch {
      return '';
    }
  })();
  return host === appHost || host.endsWith('.vercel.app') || host === 'localhost';
}

function withTeam(path: string) {
  const teamId = process.env.VERCEL_TEAM_ID;
  return `${API}${path}${teamId ? `${path.includes('?') ? '&' : '?'}teamId=${teamId}` : ''}`;
}

async function vercelFetch(path: string, init?: RequestInit) {
  const res = await fetch(withTeam(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function addDomainToProject(domain: string) {
  return vercelFetch(`/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });
}

export async function removeDomainFromProject(domain: string) {
  return vercelFetch(`/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`, {
    method: 'DELETE',
  });
}

export interface DomainStatus {
  verified: boolean;
  misconfigured: boolean;
  /** DNS records the user must add (ownership TXT records when the domain is used elsewhere on Vercel). */
  verification: { type: string; domain: string; value: string }[];
}

export async function getDomainStatus(domain: string): Promise<DomainStatus> {
  const [project, config] = await Promise.all([
    vercelFetch(`/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`),
    vercelFetch(`/v6/domains/${domain}/config`),
  ]);

  let verified = Boolean(project.data?.verified);
  if (!verified && project.ok) {
    // Ask Vercel to re-check the TXT record now instead of waiting for its background job
    const check = await vercelFetch(`/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify`, {
      method: 'POST',
    });
    verified = Boolean(check.data?.verified);
  }

  return {
    verified,
    misconfigured: config.ok ? Boolean(config.data?.misconfigured) : true,
    verification: Array.isArray(project.data?.verification) ? project.data.verification : [],
  };
}
