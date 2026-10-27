import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { getThemeById, mergeEffectsConfig } from '@/lib/themes';
import { getThemeTier, getThemePrice, canUseTheme, PREMIUM_THEME_PRICES, NEW_THEME_IDS } from '@/lib/theme-store';
import { buildProfileData, PROFILE_VIEW_INCLUDE } from '@/lib/profile-view';
import { ThemePreviewClient } from '@/components/profile/ThemePreviewClient';

// "Try it on my page": the signed-in user's real profile rendered with any catalog theme
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'معاينة الثيم | VoltiX',
  robots: { index: false, follow: false },
};

export default async function ThemePreviewPage({ params }: { params: { themeId: string } }) {
  const session = await getSessionFromRequest();
  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent(`/preview/${params.themeId}`)}`);

  const themeId = decodeURIComponent(params.themeId);
  if (getThemeTier(themeId) === 'retired') notFound();

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: PROFILE_VIEW_INCLUDE });
  if (!user || user.isSuspended) redirect('/login');

  // Show the theme as designed (its own layout), not merged with the user's custom tweaks
  const theme = getThemeById(themeId);
  const owned = canUseTheme(
    themeId,
    { premiumUntil: user.premiumUntil, ownedThemeIds: user.themePurchases.map((p) => p.themeId) },
    user.profileConfig?.themeId
  );

  // Cycle through the paid collection, new themes first (same order as the store)
  const paidIds = Object.keys(PREMIUM_THEME_PRICES).sort(
    (a, b) => Number(NEW_THEME_IDS.has(b)) - Number(NEW_THEME_IDS.has(a))
  );
  const index = paidIds.indexOf(themeId);
  const neighbours =
    index >= 0
      ? { prev: paidIds[(index - 1 + paidIds.length) % paidIds.length], next: paidIds[(index + 1) % paidIds.length] }
      : { prev: null, next: null };

  return (
    <ThemePreviewClient
      profile={buildProfileData(user, theme)}
      theme={theme}
      effects={mergeEffectsConfig(user.profileConfig?.effectsConfigJson)}
      price={getThemePrice(themeId)}
      owned={owned}
      isCurrent={user.profileConfig?.themeId === themeId}
      prevThemeId={neighbours.prev}
      nextThemeId={neighbours.next}
      position={index >= 0 ? { index: index + 1, total: paidIds.length } : null}
    />
  );
}
