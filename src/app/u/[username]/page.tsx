import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { mergeThemeWithCustom, mergeEffectsConfig, ProfileLayoutType } from '@/lib/themes';
import { PublicProfileClient } from '@/components/profile/PublicProfileClient';
import { buildProfileData, PROFILE_VIEW_INCLUDE } from '@/lib/profile-view';
import { canUseTheme, FALLBACK_FREE_THEME_ID, buildEntitlements } from '@/lib/theme-store';

// Incremental Static Regeneration: 60-second edge cache with background revalidation
export const revalidate = 60;

// Deduplicate database query between generateMetadata and PublicProfilePage in a single request
const getPublicUserProfile = cache(async (rawUsername: string) => {
  const cleanUsername = decodeURIComponent(rawUsername).replace(/^@/, '').toLowerCase().trim();
  if (!cleanUsername) return null;

  return prisma.user.findUnique({
    where: { username: cleanUsername },
    include: PROFILE_VIEW_INCLUDE,
  });
});

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await getPublicUserProfile(params.username);

  if (!user || user.isSuspended) {
    return {
      title: 'Profile Not Found | VoltiX',
    };
  }

  const pc = user.profileConfig;
  const canonicalTitle = `${user.displayName || user.username} (@${user.username}) | VoltiX`;
  const customSeo = pc?.seoTitle?.trim();
  const isLegacyPlaceholder = customSeo && /VoltiX Official/i.test(customSeo);
  const title = (customSeo && !isLegacyPlaceholder) ? customSeo : canonicalTitle;
  const description =
    pc?.seoDescription ||
    user.bio ||
    `Explore official links and digital identity of ${user.displayName} on VoltiX.`;
  const ogImage = pc?.ogImageUrl || user.avatarUrl || undefined;

  return {
    title,
    description,
    alternates: pc?.canonicalUrl ? { canonical: pc.canonicalUrl } : undefined,
    robots: pc?.robotsIndex === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      type: 'profile',
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getPublicUserProfile(params.username);

  if (!user || user.isSuspended) {
    notFound();
  }

  const pc = user.profileConfig;
  // A premium theme whose access lapsed (e.g. expired Premium) falls back to a free theme
  const savedThemeId = pc?.themeId || FALLBACK_FREE_THEME_ID;
  const themeAllowed = canUseTheme(
    savedThemeId,
    buildEntitlements(user),
    savedThemeId
  );
  const mergedTheme = themeAllowed
    ? mergeThemeWithCustom(savedThemeId, pc?.customThemeJson)
    : mergeThemeWithCustom(FALLBACK_FREE_THEME_ID);
  if (pc?.layout) {
    mergedTheme.profileLayout = pc.layout as ProfileLayoutType;
  }

  const mergedEffects = mergeEffectsConfig(pc?.effectsConfigJson);
  const profileData = buildProfileData(user, mergedTheme);

  return (
    <PublicProfileClient
      profile={profileData}
      theme={mergedTheme}
      effects={mergedEffects}
    />
  );
}
