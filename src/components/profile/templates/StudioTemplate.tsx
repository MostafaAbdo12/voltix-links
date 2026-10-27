'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { StudioStyle } from '@/lib/themes';
import type { ProfileLinkItem } from '../ProfileRenderer';
import {
  TemplateProps, TemplateFooter, Avatar, VerifiedMark, SocialIcon, LinkIcon, CoverMedia,
  useTemplateData, useLinkClick, linkProps,
} from './kit';

/**
 * Studio — one restrained design system for every paid theme, modelled on what the leading
 * link-in-bio products do: a calm background (solid, gradient, photo or subtle texture),
 * a clear identity block, one consistent button style, real thumbnails, featured links as
 * image cards, and links grouped under section titles. Themes differ through StudioStyle.
 */

const TEXTURES: Record<string, string> = {
  paper:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  grain:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  marble:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.011' numOctaves='5' seed='11'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.35  0 0 0 0 0.38  0 0 0 -3.2 1.6'/></filter><rect width='100%' height='100%' filter='url(%23m)'/></svg>\")",
  grid: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
  stars:
    'radial-gradient(1px 1px at 20% 30%, #fff9, transparent), radial-gradient(1px 1px at 70% 15%, #fff7, transparent), radial-gradient(1.5px 1.5px at 85% 60%, #fffa, transparent), radial-gradient(1px 1px at 35% 75%, #fff8, transparent), radial-gradient(1px 1px at 55% 45%, #fff6, transparent), radial-gradient(1.5px 1.5px at 10% 85%, #fff9, transparent)',
};

function background(s: StudioStyle, hasPhoto: boolean): React.CSSProperties {
  const base: React.CSSProperties = { backgroundColor: s.bg };
  switch (s.background) {
    case 'gradient':
      return { ...base, backgroundImage: `linear-gradient(160deg, ${s.bg} 0%, ${s.bg2 || s.bg} 100%)` };
    case 'mesh':
      return {
        ...base,
        backgroundImage: `radial-gradient(at 15% 10%, ${s.mesh?.[0]} 0, transparent 55%), radial-gradient(at 85% 20%, ${s.mesh?.[1]} 0, transparent 50%), radial-gradient(at 50% 95%, ${s.mesh?.[2]} 0, transparent 60%)`,
      };
    case 'texture':
      return {
        ...base,
        backgroundImage: `${TEXTURES[s.texture || 'paper']}${s.bg2 ? `, linear-gradient(160deg, ${s.bg} 0%, ${s.bg2} 100%)` : ''}`,
        backgroundSize: s.texture === 'grid' ? '28px 28px' : s.texture === 'stars' ? '320px 320px' : undefined,
      };
    case 'photo':
      return hasPhoto ? base : { ...base, backgroundImage: `linear-gradient(160deg, ${s.bg} 0%, ${s.bg2 || s.bg} 100%)` };
    default:
      return base;
  }
}

function buttonStyle(s: StudioStyle): { className: string; style: React.CSSProperties } {
  const fill = s.btnBg;
  const text = s.btnText;
  const edge = s.btnBorder || s.btnText;
  switch (s.button) {
    case 'pill':
      return { className: 'rounded-full', style: { background: fill, color: text, boxShadow: s.btnShadow ? '0 6px 20px -8px rgba(0,0,0,0.35)' : undefined } };
    case 'rounded':
      return { className: 'rounded-2xl', style: { background: fill, color: text, boxShadow: s.btnShadow ? '0 6px 20px -8px rgba(0,0,0,0.35)' : undefined } };
    case 'square':
      return { className: 'rounded-[4px]', style: { background: fill, color: text } };
    case 'outline':
      return { className: s.radius === 'full' ? 'rounded-full' : 'rounded-xl', style: { background: 'transparent', color: text, border: `1.5px solid ${edge}` } };
    case 'hard':
      return { className: 'rounded-xl', style: { background: fill, color: text, border: `2px solid ${edge}`, boxShadow: `4px 4px 0 ${edge}` } };
    case 'glass':
      return {
        className: 'rounded-2xl',
        style: {
          background: fill,
          color: text,
          border: `1px solid ${edge}`,
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        },
      };
    case 'line':
      return { className: 'rounded-none', style: { background: 'transparent', color: text, borderBottom: `1px solid ${edge}` } };
    default:
      return { className: 'rounded-2xl', style: { background: fill, color: text } };
  }
}

export function StudioTemplate({ profile, theme, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const s = theme.studio!;
  const { featured, regular, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const btn = buttonStyle(s);
  const photo = s.background === 'photo' ? profile.coverUrl || profile.avatarUrl : undefined;
  const isLine = s.button === 'line';

  // Featured links lead; in the "tiles" layout up to four become image tiles
  const tiles = s.layout === 'tiles' ? (featured.length ? featured : regular.slice(0, 2)).slice(0, 4) : featured;
  const list = s.layout === 'tiles' && !featured.length ? regular.slice(tiles.length) : regular;

  // Group the remaining links under their section titles, preserving order
  const groups: { name: string; items: ProfileLinkItem[] }[] = [];
  for (const link of list) {
    const name = link.groupName?.trim() || '';
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(link);
    else groups.push({ name, items: [link] });
  }

  const linkRow = (link: ProfileLinkItem) => (
    <a
      key={link.id}
      {...linkProps(link, click(link))}
      className={`group relative flex items-center gap-3 w-full transition-transform duration-200 hover:-translate-y-0.5 ${isLine ? 'py-4 px-1' : 'min-h-[60px] px-2.5 py-2.5'} ${btn.className}`}
      style={btn.style}
    >
      <span
        className={`w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden ${s.button === 'square' || isLine ? 'rounded-[4px]' : 'rounded-xl'}`}
        style={{ background: link.thumbnailUrl ? 'transparent' : s.iconBg || 'rgba(0,0,0,0.08)', color: s.btnText }}
      >
        <LinkIcon link={link} className={link.thumbnailUrl ? 'w-10 h-10' : 'w-[18px] h-[18px]'} />
      </span>
      <span className={`flex-1 min-w-0 ${isLine ? 'text-start' : 'text-center'} px-1`}>
        <span className="block text-[15px] font-semibold leading-snug">{link.title}</span>
        {link.badgeText && (
          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.accent, color: s.accentText || '#fff' }}>
            {link.badgeText}
          </span>
        )}
      </span>
      <span className="w-10 shrink-0 flex justify-center opacity-40 group-hover:opacity-90 transition-opacity">
        <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
      </span>
    </a>
  );

  const tileCard = (link: ProfileLinkItem, wide: boolean) => (
    <a
      key={link.id}
      {...linkProps(link, click(link))}
      className={`group relative overflow-hidden ${wide ? 'col-span-2 aspect-[16/9]' : 'aspect-square'} ${s.button === 'square' ? 'rounded-[6px]' : 'rounded-3xl'} transition-transform hover:-translate-y-0.5`}
      style={{ background: `linear-gradient(135deg, ${s.accent}, ${s.bg2 || s.bg})`, border: s.button === 'hard' ? `2px solid ${s.btnBorder}` : undefined, boxShadow: s.button === 'hard' ? `4px 4px 0 ${s.btnBorder}` : undefined }}
    >
      {link.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      )}
      {!link.thumbnailUrl && (
        <span className="absolute top-4 start-4 w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 text-white">
          <LinkIcon link={link} className="w-5 h-5" />
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span className="absolute bottom-0 inset-x-0 p-4 text-white text-start">
        {link.badgeText && <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{link.badgeText}</span>}
        <span className="block text-base font-bold leading-snug">{link.title}</span>
        {wide && link.description && <span className="block text-xs mt-1 opacity-80 truncate">{link.description}</span>}
      </span>
    </a>
  );

  const isHero = s.layout === 'hero';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`relative w-full overflow-hidden ${compactPhone ? 'min-h-full' : 'min-h-screen'}`}
      style={{ ...background(s, !!photo), color: s.text, fontFamily: `"${theme.fontFamilyEn}", "${theme.fontFamilyAr}", sans-serif` }}
    >
      {photo && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-70" />
          <div className="absolute inset-0" style={{ background: s.overlay || 'rgba(0,0,0,0.45)' }} />
        </div>
      )}

      {isHero && (
        <div className={`relative w-full ${compactPhone ? 'h-40' : 'h-56 sm:h-64'} overflow-hidden`}>
          {profile.coverUrl ? (
            <CoverMedia profile={profile} />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${s.accent} 0%, ${s.bg2 || s.accent} 100%)` }} />
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 62%, ${s.bg} 100%)` }} />
        </div>
      )}

      <div className={`relative max-w-[560px] mx-auto px-5 ${isHero ? '-mt-14' : compactPhone ? 'pt-10' : 'pt-16'} pb-4`}>
        {/* Identity */}
        <div className="flex flex-col items-center text-center">
          <Avatar
            profile={profile}
            size={compactPhone ? 88 : 104}
            className={s.button === 'square' ? 'rounded-[8px]' : 'rounded-full'}
            style={{ border: isHero ? `4px solid ${s.bg}` : s.avatarRing ? `3px solid ${s.accent}` : undefined, boxShadow: '0 10px 30px -12px rgba(0,0,0,0.45)' }}
            fallbackBg={s.accent}
            fallbackColor={s.accentText || '#fff'}
          />
          <h1 className={`mt-4 ${s.titleSize === 'xl' ? 'text-4xl' : 'text-2xl'} font-bold tracking-tight flex items-center gap-1.5`} style={{ letterSpacing: s.titleTracking }}>
            {s.titleCase === 'upper' ? profile.displayName.toUpperCase() : profile.displayName}
            <VerifiedMark show={profile.isVerified} color={s.accent} size={20} />
          </h1>
          {s.showHandle !== false && (
            <p className="mt-1 text-sm opacity-60" dir="ltr">
              @{profile.username}
            </p>
          )}
          {profile.bio && <p className="mt-3 text-[15px] leading-7 max-w-sm opacity-85">{profile.bio}</p>}

          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-4">
              {socials.map((sl) => (
                <a
                  key={sl.id}
                  href={isPreview ? undefined : sl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 hover:scale-110 transition-all"
                  style={{ color: s.text }}
                >
                  <SocialIcon social={sl} className="w-[22px] h-[22px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Featured */}
        {tiles.length > 0 && (
          <div className={`mt-8 grid grid-cols-2 gap-3`}>
            {tiles.map((link, i) => tileCard(link, tiles.length === 1 || (tiles.length === 3 && i === 0)))}
          </div>
        )}

        {/* Links, grouped */}
        <div className={`mt-6 ${isLine ? 'space-y-0' : 'space-y-3'}`}>
          {groups.map((g, gi) => (
            <div key={`${g.name}-${gi}`} className={isLine ? '' : 'space-y-3'}>
              {g.name && <h2 className="pt-4 pb-1 text-center text-sm font-bold opacity-75">{g.name}</h2>}
              {g.items.map(linkRow)}
            </div>
          ))}
        </div>

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </div>
  );
}
