'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TemplateProps, TemplateShell, TemplateFooter, Avatar, VerifiedMark, SocialIcon, LinkIcon,
  useTemplateData, useLinkClick, linkProps, socialBrandColor, socialName,
} from './kit';

/**
 * iOS — the page reads like a native settings screen: a large-title header, an action row
 * of round buttons, and inset-grouped lists with coloured icon squares and chevrons.
 */
export function IosTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { featured, regular, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const accent = theme.accentColor;
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  const group: React.CSSProperties = {
    background: theme.cardBg,
    backdropFilter: `blur(${theme.glassBlur}px) saturate(160%)`,
    WebkitBackdropFilter: `blur(${theme.glassBlur}px) saturate(160%)`,
    border: `0.5px solid ${theme.cardBorder}`,
    borderRadius: 18,
  };
  const iconColors = [accent, theme.glowColor, '#34C759', '#FF9500', '#5856D6', '#FF2D55'];

  const renderGroup = (title: string, items: typeof regular, offset = 0) =>
    items.length > 0 && (
      <section className="mt-7">
        <h2 className="px-4 mb-2 text-[13px] uppercase tracking-wide" style={{ color: theme.secondaryTextColor }}>
          {title}
        </h2>
        <div className="overflow-hidden" style={group}>
          {items.map((link, i) => (
            <a key={link.id} {...linkProps(link, click(link))} className="flex items-center gap-3 ps-3 active:opacity-60">
              <span
                className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white shrink-0 overflow-hidden"
                style={{ background: iconColors[(i + offset) % iconColors.length] }}
              >
                <LinkIcon link={link} className="w-[17px] h-[17px]" />
              </span>
              <span
                className="flex-1 min-w-0 flex items-center gap-2 py-3 pe-3"
                style={{ borderBottom: i < items.length - 1 ? `0.5px solid ${theme.cardBorder}` : 'none' }}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[16px] truncate">{link.title}</span>
                  {link.description && (
                    <span className="block text-[12px] truncate" style={{ color: theme.secondaryTextColor }}>
                      {link.description}
                    </span>
                  )}
                </span>
                {link.badgeText && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full text-white" style={{ background: accent }}>
                    {link.badgeText}
                  </span>
                )}
                <Chevron className="w-4 h-4 shrink-0" style={{ color: theme.secondaryTextColor }} />
              </span>
            </a>
          ))}
        </div>
      </section>
    );

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      <div className={`max-w-lg mx-auto px-4 ${compactPhone ? 'pt-6' : 'pt-12'}`}>
        <div className="flex flex-col items-center text-center">
          <Avatar
            profile={profile}
            size={compactPhone ? 92 : 108}
            className="rounded-full"
            style={{ boxShadow: `0 12px 40px -12px ${theme.glowColor}` }}
            fallbackBg={accent}
            fallbackColor="#fff"
          />
          <h1 className="mt-4 text-[30px] font-bold tracking-tight flex items-center gap-1.5">
            {profile.displayName}
            <VerifiedMark show={profile.isVerified} color={accent} size={22} />
          </h1>
          <p className="text-[15px]" style={{ color: theme.secondaryTextColor }} dir="ltr">
            @{profile.username}
          </p>
          {profile.bio && (
            <p className="mt-3 text-[15px] leading-6 max-w-sm" style={{ color: theme.secondaryTextColor }}>
              {profile.bio}
            </p>
          )}
        </div>

        {socials.length > 0 && (
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            {socials.map((s) => (
              <a
                key={s.id}
                href={isPreview ? undefined : s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 w-16 active:opacity-60"
              >
                <span className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ ...group, borderRadius: 999, color: socialBrandColor(s) }}>
                  <SocialIcon social={s} className="w-6 h-6" />
                </span>
                <span className="text-[11px] truncate w-full" style={{ color: theme.secondaryTextColor }}>
                  {socialName(s, isRtl)}
                </span>
              </a>
            ))}
          </div>
        )}

        {renderGroup(isRtl ? 'مميز' : 'Featured', featured)}
        {renderGroup(isRtl ? 'الروابط' : 'Links', regular, featured.length)}

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
