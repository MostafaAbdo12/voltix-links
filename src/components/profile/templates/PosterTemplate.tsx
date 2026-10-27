'use client';

import React from 'react';
import {
  TemplateProps, TemplateShell, TemplateFooter, Avatar, VerifiedMark, SocialIcon,
  useTemplateData, useLinkClick, linkProps, dirArrow,
} from './kit';

const MARQUEE = `@keyframes vx-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;

/**
 * Poster — loud editorial. The name is set huge across the screen, a ticker runs the bio,
 * and links are full-width colour blocks with oversized numbers.
 */
export function PosterTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { links, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const accent = theme.accentColor;
  const ink = theme.bgColor;
  const blocks = [accent, theme.textColor, theme.glowColor];
  const ticker = `${profile.bio || profile.displayName} ✦ @${profile.username} ✦ `;

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      <style>{MARQUEE}</style>
      <div className={`max-w-2xl mx-auto px-4 ${compactPhone ? 'pt-6' : 'pt-10'}`}>
        <div className="flex items-center justify-between gap-3">
          <Avatar
            profile={profile}
            size={compactPhone ? 56 : 68}
            className="rounded-none"
            style={{ border: `3px solid ${accent}` }}
            fallbackBg={accent}
            fallbackColor={ink}
          />
          <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: accent }} dir="ltr">
            @{profile.username}
          </span>
        </div>

        <h1
          className="mt-6 font-black uppercase leading-[0.85] break-words flex items-end gap-2"
          style={{ fontSize: compactPhone ? 52 : 'clamp(56px, 15vw, 120px)', letterSpacing: '-0.03em' }}
        >
          <span>{profile.displayName}</span>
          <VerifiedMark show={profile.isVerified} color={accent} size={compactPhone ? 26 : 34} />
        </h1>
      </div>

      {/* Ticker */}
      <div className="mt-6 overflow-hidden py-3 -rotate-1" style={{ background: accent, color: ink }} dir="ltr">
        <div
          className="flex whitespace-nowrap font-black uppercase text-sm tracking-wider"
          style={{ width: 'max-content', animation: 'vx-marquee 18s linear infinite', animationPlayState: effects.reduceMotion ? 'paused' : 'running' }}
        >
          <span>{ticker.repeat(6)}</span>
          <span>{ticker.repeat(6)}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-3">
        {links.map((link, i) => {
          const bg = blocks[i % blocks.length];
          return (
            <a
              key={link.id}
              {...linkProps(link, click(link))}
              className="group flex items-center gap-4 px-5 py-5 transition-transform hover:-translate-y-1"
              style={{ background: bg, color: ink }}
            >
              <span className="font-black leading-none tabular-nums" style={{ fontSize: 44 }} dir="ltr">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xl font-black uppercase leading-tight">{link.title}</span>
                {link.description && <span className="block text-xs font-bold mt-1 opacity-75 truncate">{link.description}</span>}
              </span>
              {link.badgeText && (
                <span className="text-[10px] font-black uppercase px-2 py-1" style={{ background: ink, color: bg }}>
                  {link.badgeText}
                </span>
              )}
              <span className="text-3xl font-black group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                {dirArrow(isRtl)}
              </span>
            </a>
          );
        })}

        {socials.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-3">
            {socials.map((s) => (
              <a
                key={s.id}
                href={isPreview ? undefined : s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square flex items-center justify-center transition-colors"
                style={{ border: `3px solid ${theme.textColor}`, color: theme.textColor }}
              >
                <SocialIcon social={s} className="w-6 h-6" />
              </a>
            ))}
          </div>
        )}

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
