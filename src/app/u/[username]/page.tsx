import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { mergeThemeWithCustom, mergeEffectsConfig, ProfileLayoutType } from '@/lib/themes';
import { PublicProfileClient } from '@/components/profile/PublicProfileClient';
import { ProfileData, MediaEmbedConfig } from '@/components/profile/ProfileRenderer';
import { canUseTheme, FALLBACK_FREE_THEME_ID } from '@/lib/theme-store';

// Incremental Static Regeneration: 60-second edge cache with background revalidation
export const revalidate = 60;

// Deduplicate database query between generateMetadata and PublicProfilePage in a single request
const getPublicUserProfile = cache(async (rawUsername: string) => {
  const cleanUsername = decodeURIComponent(rawUsername).replace(/^@/, '').toLowerCase().trim();
  if (!cleanUsername) return null;

  return prisma.user.findUnique({
    where: { username: cleanUsername },
    include: {
      profileConfig: true,
      links: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      socialLinks: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      themePurchases: { select: { themeId: true } },
    },
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
    { premiumUntil: user.premiumUntil, ownedThemeIds: user.themePurchases.map((p) => p.themeId) },
    savedThemeId
  );
  const mergedTheme = themeAllowed
    ? mergeThemeWithCustom(savedThemeId, pc?.customThemeJson)
    : mergeThemeWithCustom(FALLBACK_FREE_THEME_ID);
  if (pc?.layout) {
    mergedTheme.profileLayout = pc.layout as ProfileLayoutType;
  }

  const mergedEffects = mergeEffectsConfig(pc?.effectsConfigJson);

  let avatarPos = { zoom: 1, x: 0, y: 0 };
  let coverPos = { zoom: 1, x: 0, y: 0 };
  let sectionsOrder = ['header', 'social', 'featured', 'media', 'links'];
  let mediaEmbed: MediaEmbedConfig = {
    enabled: false,
    type: 'spotify' as const,
    title: '',
    artist: '',
    url: '',
    embedUrl: '',
    tracks: [],
  };
  let qrConfig = {
    fgColor: mergedTheme.accentColor,
    bgColor: mergedTheme.bgColor,
    includeLogo: true,
  };

  try {
    if (user.avatarPosition) avatarPos = JSON.parse(user.avatarPosition);
  } catch {}
  try {
    if (user.coverPosition) coverPos = JSON.parse(user.coverPosition);
  } catch {}
  try {
    if (pc?.sectionsOrderJson) sectionsOrder = JSON.parse(pc.sectionsOrderJson);
  } catch {}
  try {
    if (pc?.mediaEmbedJson) mediaEmbed = JSON.parse(pc.mediaEmbedJson);
  } catch {}
  try {
    if (pc?.qrConfigJson) qrConfig = JSON.parse(pc.qrConfigJson);
  } catch {}

  const profileData: ProfileData = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    avatarPosition: avatarPos,
    coverUrl: user.coverUrl,
    coverPosition: coverPos,
    isVerified: user.isVerified,
    locale: user.locale === 'en' ? 'en' : 'ar',
    // Filter scheduled links on the server so future links' URLs never reach the browser
    links: user.links.filter((l) => {
      const now = Date.now();
      if (l.scheduledStart && l.scheduledStart.getTime() > now) return false;
      if (l.scheduledEnd && l.scheduledEnd.getTime() < now) return false;
      return true;
    }).map((l) => ({
      ...l,
      scheduledStart: l.scheduledStart ? l.scheduledStart.toISOString() : null,
      scheduledEnd: l.scheduledEnd ? l.scheduledEnd.toISOString() : null,
    })),
    socialLinks: user.socialLinks,
    sectionsOrder,
    mediaEmbed,
    qrConfig,
    emailCapture: {
      enabled: pc?.emailCaptureEnabled ?? false,
      title: pc?.emailCaptureTitle ?? '',
    },
  };

  return (
    <PublicProfileClient
      profile={profileData}
      theme={mergedTheme}
      effects={mergedEffects}
    />
  );
}
