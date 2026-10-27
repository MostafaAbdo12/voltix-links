'use client';

import React, { useMemo } from 'react';
import { BadgeCheck } from 'lucide-react';
import type { ThemeConfig, EffectsConfig } from '@/lib/themes';
import type { ProfileData, ProfileLinkItem, ProfileSocialItem } from '../ProfileRenderer';
import { getSocialPlatform } from '@/lib/social-platforms';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { SubscribeForm } from '../SubscribeForm';
import { ThemeBackdrop } from '../ThemeBackdrop';
import { CollectionBackdrop } from '../CollectionBackdrop';

/** Shared building blocks for the premium page templates. */

export interface TemplateProps {
  profile: ProfileData;
  theme: ThemeConfig;
  effects: EffectsConfig;
  isPreview: boolean;
  compactPhone: boolean;
  onLinkClick?: (link: ProfileLinkItem) => void;
}

export function useTemplateData(profile: ProfileData) {
  return useMemo(() => {
    const now = Date.now();
    const links = (profile.links || []).filter((l) => {
      if (l.isActive === false) return false;
      if (l.scheduledStart && new Date(l.scheduledStart).getTime() > now) return false;
      if (l.scheduledEnd && new Date(l.scheduledEnd).getTime() < now) return false;
      return true;
    });
    const socials = (profile.socialLinks || []).filter((s) => s.isActive !== false && s.url);
    const isRtl = (profile.locale || 'ar') === 'ar';
    return { links, featured: links.filter((l) => l.isFeatured), regular: links.filter((l) => !l.isFeatured), socials, isRtl };
  }, [profile.links, profile.socialLinks, profile.locale]);
}

/** Click handler: blocks navigation in previews, records analytics on live pages. */
export function useLinkClick(profile: ProfileData, isPreview: boolean, onLinkClick?: (link: ProfileLinkItem) => void) {
  return (link: ProfileLinkItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPreview) e.preventDefault();
    if (onLinkClick) onLinkClick(link);
    else if (!isPreview && link.id) {
      fetch('/api/analytics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id, userId: profile.id }),
        keepalive: true,
      }).catch(() => {});
    }
  };
}

export function linkProps(link: ProfileLinkItem, onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void) {
  return { href: link.url, target: '_blank', rel: 'noopener noreferrer', onClick };
}

function isVideo(url?: string) {
  return !!url && (url.startsWith('data:video/') || /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url));
}

export function CoverMedia({ profile, className = '', style }: { profile: ProfileData; className?: string; style?: React.CSSProperties }) {
  const url = profile.coverUrl;
  if (!url) return null;
  const pos = profile.coverPosition;
  const transform = pos ? `scale(${pos.zoom || 1}) translate(${pos.x || 0}px, ${pos.y || 0}px)` : undefined;
  return isVideo(url) ? (
    <video src={url} autoPlay muted loop playsInline className={`w-full h-full object-cover ${className}`} style={{ transform, ...style }} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`w-full h-full object-cover ${className}`} style={{ transform, ...style }} />
  );
}

export function Avatar({
  profile,
  size,
  className = '',
  style,
  fallbackBg,
  fallbackColor,
}: {
  profile: ProfileData;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  fallbackBg: string;
  fallbackColor: string;
}) {
  const pos = profile.avatarPosition;
  const transform = pos ? `scale(${pos.zoom || 1}) translate(${pos.x || 0}px, ${pos.y || 0}px)` : undefined;
  return (
    <div className={`overflow-hidden shrink-0 ${className}`} style={{ width: size, height: size, ...style }}>
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" style={{ transform }} />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-black"
          style={{ background: fallbackBg, color: fallbackColor, fontSize: size * 0.42 }}
        >
          {(profile.displayName || profile.username || '?').trim().charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function VerifiedMark({ show, color, size = 18 }: { show?: boolean; color: string; size?: number }) {
  if (!show) return null;
  return <BadgeCheck style={{ color, width: size, height: size }} className="inline-block shrink-0" aria-label="Verified" />;
}

export function LinkIcon({ link, className = 'w-5 h-5' }: { link: ProfileLinkItem; className?: string }) {
  if (link.thumbnailUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={link.thumbnailUrl} alt="" className={`${className} object-cover rounded-[inherit]`} />;
  }
  return <DynamicIcon name={link.icon} className={className} />;
}

export function SocialIcon({ social, className = 'w-5 h-5' }: { social: ProfileSocialItem; className?: string }) {
  return <>{getSocialPlatform(social.platform).renderIcon(className)}</>;
}

export function socialName(social: ProfileSocialItem, isRtl: boolean) {
  const meta = getSocialPlatform(social.platform);
  return isRtl ? meta.nameAr.split(' ')[0] : meta.name;
}

export function socialBrandColor(social: ProfileSocialItem) {
  return getSocialPlatform(social.platform).color;
}

/** Backdrop layers + page shell shared by every template. */
export function TemplateShell({
  theme,
  effects,
  compactPhone,
  isRtl,
  children,
  className = '',
}: {
  theme: ThemeConfig;
  effects: EffectsConfig;
  compactPhone: boolean;
  isRtl: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`relative w-full overflow-hidden ${compactPhone ? 'min-h-full' : 'min-h-screen'} ${className}`}
      style={{
        background: `linear-gradient(170deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 55%, ${theme.gradientColors[2]} 100%)`,
        color: theme.textColor,
        fontFamily: `"${theme.fontFamilyEn}", "${theme.fontFamilyAr}", sans-serif`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <ThemeBackdrop theme={theme} reduceMotion={effects.reduceMotion} />
        <CollectionBackdrop theme={theme} reduceMotion={effects.reduceMotion} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function TemplateFooter({ profile, theme, isRtl, isPreview }: { profile: ProfileData; theme: ThemeConfig; isRtl: boolean; isPreview: boolean }) {
  return (
    <>
      {profile.emailCapture?.enabled && profile.id && (
        <SubscribeForm userId={profile.id} title={profile.emailCapture.title} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      )}
      <div className="mt-12 pb-8 flex justify-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold opacity-70 hover:opacity-100 transition-opacity"
          style={{ border: `1px solid ${theme.cardBorder}`, color: theme.secondaryTextColor }}
          dir="ltr"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/voltix-logo.png" alt="" className="w-4 h-4 object-contain" />
          Powered by VoltiX
        </a>
      </div>
    </>
  );
}

/** Mirrors an arrow for the reading direction. */
export function dirArrow(isRtl: boolean) {
  return isRtl ? '←' : '→';
}
