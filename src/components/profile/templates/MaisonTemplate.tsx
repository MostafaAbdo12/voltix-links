'use client';

import React from 'react';
import {
  TemplateProps, TemplateShell, TemplateFooter, CoverMedia, Avatar, VerifiedMark, SocialIcon,
  useTemplateData, useLinkClick, linkProps, dirArrow,
} from './kit';

/**
 * Maison — quiet luxury editorial. Tall cover that fades into the page, a large serif name
 * between hairlines, and links as numbered rows like a magazine contents page.
 */
export function MaisonTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { links, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const accent = theme.accentColor;
  const hairline = `linear-gradient(90deg, transparent, ${accent}, transparent)`;

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      {/* Cover */}
      <div className={`relative w-full ${compactPhone ? 'h-56' : 'h-[46vh] min-h-[280px]'} overflow-hidden`}>
        {profile.coverUrl ? (
          <CoverMedia profile={profile} />
        ) : (
          <div className="w-full h-full" style={{ background: `radial-gradient(ellipse at 50% 20%, ${accent}40, transparent 65%)` }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, transparent 25%, ${theme.gradientColors[0]} 96%)` }}
        />
      </div>

      <div className="relative max-w-xl mx-auto px-6 -mt-20 text-center">
        <div className="inline-block p-[3px] rounded-full" style={{ background: `conic-gradient(${accent}, ${theme.glowColor}, ${accent})` }}>
          <Avatar
            profile={profile}
            size={compactPhone ? 96 : 116}
            className="rounded-full"
            style={{ border: `4px solid ${theme.gradientColors[0]}` }}
            fallbackBg={theme.gradientColors[1]}
            fallbackColor={accent}
          />
        </div>

        <p className="mt-6 text-[10px] tracking-[0.45em] uppercase" style={{ color: accent }} dir="ltr">
          Maison · @{profile.username}
        </p>
        <div className="mt-3 h-px w-40 mx-auto" style={{ background: hairline }} />
        <h1 className="mt-5 text-4xl sm:text-5xl font-semibold leading-tight flex items-center justify-center gap-2">
          {profile.displayName}
          <VerifiedMark show={profile.isVerified} color={accent} size={24} />
        </h1>
        <div className="mt-5 h-px w-40 mx-auto" style={{ background: hairline }} />
        {profile.bio && (
          <p className="mt-6 text-[15px] leading-8 max-w-md mx-auto" style={{ color: theme.secondaryTextColor }}>
            {profile.bio}
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-7 flex justify-center gap-5">
            {socials.map((s) => (
              <a
                key={s.id}
                href={isPreview ? undefined : s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
                style={{ color: theme.textColor }}
              >
                <SocialIcon social={s} className="w-[18px] h-[18px]" />
              </a>
            ))}
          </div>
        )}

        {/* Contents-page links */}
        <div className="mt-12 text-start">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-3 text-center" style={{ color: theme.secondaryTextColor }}>
            {isRtl ? 'المحتويات' : 'Contents'}
          </p>
          {links.map((link, i) => (
            <a
              key={link.id}
              {...linkProps(link, click(link))}
              className="group flex items-baseline gap-4 py-5 border-b transition-colors"
              style={{ borderColor: `${accent}33` }}
            >
              <span className="text-xs tabular-nums w-8 shrink-0" style={{ color: accent }} dir="ltr">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-lg font-semibold group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  {link.title}
                  {link.badgeText && (
                    <span className="ms-2 align-middle text-[10px] px-2 py-0.5 rounded-full" style={{ border: `1px solid ${accent}`, color: accent }}>
                      {link.badgeText}
                    </span>
                  )}
                </span>
                {link.description && (
                  <span className="block mt-1 text-xs truncate" style={{ color: theme.secondaryTextColor }}>
                    {link.description}
                  </span>
                )}
              </span>
              <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>
                {dirArrow(isRtl)}
              </span>
            </a>
          ))}
        </div>

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
