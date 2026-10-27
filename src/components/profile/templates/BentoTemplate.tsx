'use client';

import React from 'react';
import {
  TemplateProps, TemplateShell, TemplateFooter, Avatar, VerifiedMark, SocialIcon, LinkIcon, CoverMedia,
  useTemplateData, useLinkClick, linkProps, socialBrandColor, socialName,
} from './kit';

/**
 * Bento — iOS-widget grid. Tiles of different sizes: a big identity tile, featured links as
 * wide tiles, socials as square brand tiles, and the rest as compact glass tiles.
 */
export function BentoTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { links, featured, regular, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const accent = theme.accentColor;
  const tile: React.CSSProperties = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    backdropFilter: `blur(${theme.glassBlur}px)`,
    WebkitBackdropFilter: `blur(${theme.glassBlur}px)`,
    borderRadius: 28,
  };
  // With no featured links, promote the first link so the grid still has a hero tile
  const heroes = featured.length ? featured : links.slice(0, 1);
  const rest = featured.length ? regular : links.slice(1);

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      <div className={`max-w-xl mx-auto px-4 ${compactPhone ? 'pt-6' : 'pt-12'} grid grid-cols-2 gap-3`}>
        {/* Identity tile */}
        <div className="col-span-2 relative overflow-hidden p-5 flex items-center gap-4" style={tile}>
          {profile.coverUrl && (
            <div className="absolute inset-0 opacity-25">
              <CoverMedia profile={profile} />
            </div>
          )}
          <Avatar
            profile={profile}
            size={compactPhone ? 72 : 84}
            className="relative rounded-[24px]"
            style={{ boxShadow: `0 10px 30px -10px ${theme.glowColor}` }}
            fallbackBg={accent}
            fallbackColor={theme.bgColor}
          />
          <div className="relative min-w-0">
            <h1 className="text-2xl font-extrabold flex items-center gap-1.5 truncate">
              {profile.displayName}
              <VerifiedMark show={profile.isVerified} color={accent} />
            </h1>
            <p className="text-xs mt-0.5" style={{ color: theme.secondaryTextColor }} dir="ltr">
              @{profile.username}
            </p>
          </div>
        </div>

        {profile.bio && (
          <div className="col-span-2 p-5 text-sm leading-7" style={{ ...tile, color: theme.secondaryTextColor }}>
            {profile.bio}
          </div>
        )}

        {heroes.map((link) => (
          <a
            key={link.id}
            {...linkProps(link, click(link))}
            className="col-span-2 relative overflow-hidden p-5 min-h-[130px] flex flex-col justify-end transition-transform hover:scale-[1.015]"
            style={{
              ...tile,
              background: `linear-gradient(135deg, ${accent}, ${theme.glowColor})`,
              color: theme.bgColor,
              border: 'none',
            }}
          >
            <span className="absolute top-4 end-4 w-11 h-11 rounded-2xl flex items-center justify-center bg-black/15 overflow-hidden">
              <LinkIcon link={link} className="w-5 h-5" />
            </span>
            {link.badgeText && <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{link.badgeText}</span>}
            <span className="text-xl font-black leading-tight">{link.title}</span>
            {link.description && <span className="text-xs mt-1 opacity-80 truncate">{link.description}</span>}
          </a>
        ))}

        {socials.slice(0, 4).map((s) => (
          <a
            key={s.id}
            href={isPreview ? undefined : s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square p-4 flex flex-col justify-between transition-transform hover:scale-[1.03]"
            style={{ ...tile, background: `${socialBrandColor(s)}26`, borderColor: `${socialBrandColor(s)}55` }}
          >
            <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: socialBrandColor(s) }}>
              <SocialIcon social={s} className="w-5 h-5" />
            </span>
            <span className="text-sm font-bold">{socialName(s, isRtl)}</span>
          </a>
        ))}

        {rest.map((link, i) => (
          <a
            key={link.id}
            {...linkProps(link, click(link))}
            className={`${rest.length % 2 === 1 && i === rest.length - 1 ? 'col-span-2' : ''} p-4 flex flex-col gap-3 transition-transform hover:scale-[1.03]`}
            style={tile}
          >
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: `${accent}22`, color: accent }}>
              <LinkIcon link={link} className="w-5 h-5" />
            </span>
            <span className="text-sm font-bold leading-snug line-clamp-2">{link.title}</span>
          </a>
        ))}

        {socials.length > 4 && (
          <div className="col-span-2 p-3 flex justify-center gap-3" style={tile}>
            {socials.slice(4).map((s) => (
              <a key={s.id} href={isPreview ? undefined : s.url} target="_blank" rel="noopener noreferrer" style={{ color: socialBrandColor(s) }}>
                <SocialIcon social={s} className="w-6 h-6" />
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="max-w-xl mx-auto px-4">
        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
