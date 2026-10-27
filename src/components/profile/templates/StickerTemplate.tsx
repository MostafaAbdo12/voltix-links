'use client';

import React from 'react';
import {
  TemplateProps, TemplateShell, TemplateFooter, Avatar, VerifiedMark, SocialIcon, LinkIcon,
  useTemplateData, useLinkClick, linkProps,
} from './kit';

const WOBBLE = `@keyframes vx-wobble { 0%,100% { transform: rotate(var(--r)); } 50% { transform: rotate(calc(var(--r) * -1)); } }`;

/**
 * Sticker — neo-brutalist and playful: chunky outlines, hard offset shadows, tilted cards and
 * sticker badges, like a creator's scrapbook.
 */
export function StickerTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { links, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const ink = '#111111';
  const palette = [theme.accentColor, theme.glowColor, '#FFFFFF', '#FFE45C'];
  const tilt = [-1.6, 1.2, -0.8, 1.8];
  const hard = (c = ink) => `5px 5px 0 ${c}`;
  const play = effects.reduceMotion ? 'paused' : 'running';

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      <style>{WOBBLE}</style>
      <div className={`max-w-lg mx-auto px-5 ${compactPhone ? 'pt-8' : 'pt-14'}`}>
        <div className="relative w-fit mx-auto">
          <Avatar
            profile={profile}
            size={compactPhone ? 110 : 132}
            className="rounded-[28px] rotate-[-4deg]"
            style={{ border: `4px solid ${ink}`, boxShadow: hard() }}
            fallbackBg={theme.accentColor}
            fallbackColor={ink}
          />
          <span
            className="absolute -bottom-3 -end-6 px-3 py-1 rounded-full text-xs font-black rotate-[8deg]"
            style={{ background: theme.glowColor, color: ink, border: `3px solid ${ink}`, boxShadow: hard() }}
          >
            {isRtl ? 'أهلاً 👋' : 'hi 👋'}
          </span>
        </div>

        <h1
          className="mt-8 text-center text-4xl font-black w-fit mx-auto px-4 py-2 rotate-[-1.5deg] flex items-center gap-2"
          style={{ background: '#FFFFFF', color: ink, border: `4px solid ${ink}`, boxShadow: hard(theme.accentColor) }}
        >
          {profile.displayName}
          <VerifiedMark show={profile.isVerified} color={ink} size={26} />
        </h1>
        {profile.bio && (
          <p className="mt-5 text-center text-[15px] leading-7 font-semibold" style={{ color: theme.textColor }}>
            {profile.bio}
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {socials.map((s, i) => (
              <a
                key={s.id}
                href={isPreview ? undefined : s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:-translate-y-1"
                style={{
                  background: palette[i % palette.length],
                  color: ink,
                  border: `3px solid ${ink}`,
                  boxShadow: hard(),
                  ['--r' as string]: `${tilt[i % tilt.length] * 2}deg`,
                  animation: `vx-wobble ${3 + (i % 3)}s ease-in-out infinite`,
                  animationPlayState: play,
                }}
              >
                <SocialIcon social={s} className="w-5 h-5" />
              </a>
            ))}
          </div>
        )}

        <div className="mt-9 space-y-5">
          {links.map((link, i) => (
            <a
              key={link.id}
              {...linkProps(link, click(link))}
              className="relative flex items-center gap-3 px-4 py-4 rounded-2xl transition-transform hover:scale-[1.02]"
              style={{
                background: palette[i % palette.length],
                color: ink,
                border: `3px solid ${ink}`,
                boxShadow: hard(),
                transform: `rotate(${tilt[i % tilt.length]}deg)`,
              }}
            >
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-white" style={{ border: `3px solid ${ink}` }}>
                <LinkIcon link={link} className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-lg font-black leading-tight">{link.title}</span>
                {link.description && <span className="block text-xs font-bold mt-0.5 opacity-75 truncate">{link.description}</span>}
              </span>
              {(link.badgeText || link.isFeatured) && (
                <span
                  className="absolute -top-3 end-4 px-2.5 py-0.5 rounded-full text-[11px] font-black rotate-[6deg]"
                  style={{ background: '#FFFFFF', color: ink, border: `2px solid ${ink}` }}
                >
                  {link.badgeText || '★'}
                </span>
              )}
            </a>
          ))}
        </div>

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
