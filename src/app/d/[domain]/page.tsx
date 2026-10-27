import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import LandingPage from '@/app/page';
import PublicProfilePage, { generateMetadata as generateProfileMetadata } from '@/app/u/[username]/page';

// Served via a middleware rewrite when a visitor opens a user's custom domain
export const revalidate = 60;

async function usernameForDomain(rawDomain: string) {
  const domain = decodeURIComponent(rawDomain).toLowerCase();
  const user = await prisma.user.findUnique({ where: { customDomain: domain }, select: { username: true } });
  return user?.username ?? null;
}

export async function generateMetadata({ params }: { params: { domain: string } }): Promise<Metadata> {
  const username = await usernameForDomain(params.domain);
  if (!username) return {};
  return generateProfileMetadata({ params: { username } });
}

export default async function CustomDomainPage({ params }: { params: { domain: string } }) {
  const username = await usernameForDomain(params.domain);
  // Unknown host (e.g. the platform's own domain when NEXT_PUBLIC_APP_URL is misconfigured): show the landing page
  if (!username) return <LandingPage />;
  return PublicProfilePage({ params: { username } });
}
