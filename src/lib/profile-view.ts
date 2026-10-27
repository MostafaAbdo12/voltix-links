import type { Prisma } from '@prisma/client';
import type { ProfileData, MediaEmbedConfig } from '@/components/profile/ProfileRenderer';
import type { ThemeConfig } from './themes';

/** Relations needed to render a profile page; shared by the public page and the theme preview. */
export const PROFILE_VIEW_INCLUDE = {
  profileConfig: true,
  links: { where: { isActive: true }, orderBy: { order: 'asc' } },
  socialLinks: { where: { isActive: true }, orderBy: { order: 'asc' } },
  themePurchases: { select: { themeId: true } },
} satisfies Prisma.UserInclude;

export type ProfileViewUser = Prisma.UserGetPayload<{ include: typeof PROFILE_VIEW_INCLUDE }>;

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Turns a user row into the data ProfileRenderer needs (theme is chosen separately by the caller). */
export function buildProfileData(user: ProfileViewUser, theme: ThemeConfig): ProfileData {
  const pc = user.profileConfig;
  const now = Date.now();

  const mediaEmbed = parseJson<MediaEmbedConfig>(pc?.mediaEmbedJson, {
    enabled: false,
    type: 'spotify',
    title: '',
    artist: '',
    url: '',
    embedUrl: '',
    tracks: [],
  });

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    avatarPosition: parseJson(user.avatarPosition, { zoom: 1, x: 0, y: 0 }),
    coverUrl: user.coverUrl,
    coverPosition: parseJson(user.coverPosition, { zoom: 1, x: 0, y: 0 }),
    isVerified: user.isVerified,
    locale: user.locale === 'en' ? 'en' : 'ar',
    // Filter scheduled links on the server so future links' URLs never reach the browser
    links: user.links
      .filter((l) => {
        if (l.scheduledStart && l.scheduledStart.getTime() > now) return false;
        if (l.scheduledEnd && l.scheduledEnd.getTime() < now) return false;
        return true;
      })
      .map((l) => ({
        ...l,
        scheduledStart: l.scheduledStart ? l.scheduledStart.toISOString() : null,
        scheduledEnd: l.scheduledEnd ? l.scheduledEnd.toISOString() : null,
      })),
    socialLinks: user.socialLinks,
    sectionsOrder: parseJson(pc?.sectionsOrderJson, ['header', 'social', 'featured', 'media', 'links']),
    mediaEmbed,
    qrConfig: parseJson(pc?.qrConfigJson, { fgColor: theme.accentColor, bgColor: theme.bgColor, includeLogo: true }),
    emailCapture: {
      enabled: pc?.emailCaptureEnabled ?? false,
      title: pc?.emailCaptureTitle ?? '',
    },
  };
}
