'use client';

import React from 'react';
import {
  TemplateProps, TemplateShell, TemplateFooter, Avatar, VerifiedMark, SocialIcon, LinkIcon,
  useTemplateData, useLinkClick, linkProps,
} from './kit';

/**
 * Black Card — a metal membership card (chip, foil name, member number) heads the page;
 * links sit below as engraved plates with a brushed-metal sheen.
 */
export function BlackCardTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { links, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const accent = theme.accentColor;
  const metal = `linear-gradient(135deg, ${theme.gradientColors[1]} 0%, #0a0a0c 45%, ${theme.gradientColors[2]} 100%)`;
  const foil = `linear-gradient(100deg, ${accent} 0%, #fff8e1 45%, ${accent} 60%, ${theme.glowColor} 100%)`;
  // A stable, card-like member number derived from the username
  const hash = Array.from(profile.username || 'member').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const digits = String(hash).padStart(8, '0');
  const memberNo = `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`;

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      <div className={`max-w-md mx-auto px-5 ${compactPhone ? 'pt-8' : 'pt-14'}`}>
        {/* The card */}
        <div
          className="relative aspect-[1.586] w-full rounded-[22px] p-5 sm:p-6 overflow-hidden"
          style={{
            background: metal,
            border: `1px solid ${accent}55`,
            boxShadow: `0 40px 80px -30px #000, 0 0 0 1px #ffffff10 inset, 0 0 60px -20px ${theme.glowColor}66`,
          }}
          dir="ltr"
        >
          {/* brushed sheen */}
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: 'repeating-linear-gradient(90deg, #ffffff08 0 1px, transparent 1px 3px)' }}
          />
          <div className="absolute -top-1/2 -left-1/4 w-[80%] h-[200%] rotate-12 opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #fff, transparent)' }} />

          <div className="relative h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] tracking-[0.35em] font-semibold" style={{ color: accent }}>
                VOLTIX · BLACK
              </span>
              <Avatar
                profile={profile}
                size={compactPhone ? 44 : 52}
                className="rounded-full"
                style={{ border: `2px solid ${accent}` }}
                fallbackBg="#111"
                fallbackColor={accent}
              />
            </div>

            {/* EMV chip */}
            <div
              className="w-12 h-9 rounded-md"
              style={{ background: `linear-gradient(135deg, #f7e7b4, ${accent}, #8a6d2b)`, boxShadow: 'inset 0 0 0 1px #00000040' }}
            >
              <div className="w-full h-full rounded-md" style={{ background: 'repeating-linear-gradient(0deg, transparent 0 7px, #00000033 7px 8px)' }} />
            </div>

            <div>
              <div className="font-mono text-sm sm:text-base tracking-[0.2em] text-white/80">{memberNo}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className="text-lg sm:text-xl font-bold uppercase tracking-wider truncate"
                  style={{ background: foil, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
                >
                  {profile.displayName}
                </span>
                <VerifiedMark show={profile.isVerified} color={accent} />
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-7 text-center text-sm leading-7" style={{ color: theme.secondaryTextColor }}>
            {profile.bio}
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.id}
                href={isPreview ? undefined : s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform hover:-translate-y-0.5"
                style={{ background: metal, border: `1px solid ${accent}44`, color: accent }}
              >
                <SocialIcon social={s} className="w-[18px] h-[18px]" />
              </a>
            ))}
          </div>
        )}

        {/* Engraved plates */}
        <div className="mt-8 space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              {...linkProps(link, click(link))}
              className="group relative flex items-center gap-4 px-4 py-4 rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
              style={{
                background: link.isFeatured ? `linear-gradient(135deg, ${accent}30, ${theme.cardBg})` : theme.cardBg,
                border: `1px solid ${link.isFeatured ? accent : theme.cardBorder}`,
                boxShadow: 'inset 0 1px 0 #ffffff14, inset 0 -1px 0 #00000080',
              }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: '#0b0b0d', border: `1px solid ${accent}55`, color: accent }}
              >
                <LinkIcon link={link} className="w-[18px] h-[18px]" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold tracking-wide truncate">{link.title}</span>
                {link.description && (
                  <span className="block text-xs mt-0.5 truncate" style={{ color: theme.secondaryTextColor }}>
                    {link.description}
                  </span>
                )}
              </span>
              {link.badgeText && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: accent, color: '#000' }}>
                  {link.badgeText}
                </span>
              )}
              <span
                className="absolute inset-y-0 -left-1/3 w-1/3 opacity-0 group-hover:opacity-100 group-hover:left-full transition-all duration-700"
                style={{ background: 'linear-gradient(90deg, transparent, #ffffff22, transparent)' }}
              />
            </a>
          ))}
        </div>

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
