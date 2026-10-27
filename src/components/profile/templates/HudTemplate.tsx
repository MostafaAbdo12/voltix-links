'use client';

import React from 'react';
import {
  TemplateProps, TemplateShell, TemplateFooter, Avatar, VerifiedMark, SocialIcon, LinkIcon,
  useTemplateData, useLinkClick, linkProps,
} from './kit';

const HUD_KF = `
@keyframes vx-scan { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
@keyframes vx-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
`;

const cut = (n: number) =>
  `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`;

/**
 * HUD — the page is a game interface: a player card with level and XP bar, socials as
 * squad slots, and links as selectable quests with clipped corners and neon edges.
 */
export function HudTemplate({ profile, theme, effects, isPreview, compactPhone, onLinkClick }: TemplateProps) {
  const { links, socials, isRtl } = useTemplateData(profile);
  const click = useLinkClick(profile, isPreview, onLinkClick);
  const neon = theme.accentColor;
  const play = effects.reduceMotion ? 'paused' : 'running';
  const level = Math.min(99, 5 + links.length * 7 + socials.length * 3);
  const xp = Math.min(100, 35 + ((links.length * 13) % 60));

  return (
    <TemplateShell theme={theme} effects={effects} compactPhone={compactPhone} isRtl={isRtl}>
      <style>{HUD_KF}</style>
      {/* scanline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-20 opacity-20"
        style={{ background: `linear-gradient(180deg, transparent, ${neon}, transparent)`, animation: 'vx-scan 6s linear infinite', animationPlayState: play }} />
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.07]"
        style={{ background: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)' }} />

      <div className={`max-w-lg mx-auto px-4 ${compactPhone ? 'pt-6' : 'pt-12'}`}>
        <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: neon }} dir="ltr">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: neon, animation: 'vx-blink 1.2s infinite', animationPlayState: play }} />
            ONLINE
          </span>
          <span>PLAYER PROFILE</span>
        </div>

        {/* Player card */}
        <div className="mt-3 p-[1.5px]" style={{ background: `linear-gradient(135deg, ${neon}, ${theme.glowColor})`, clipPath: cut(18) }}>
          <div className="p-4 flex items-center gap-4" style={{ background: theme.bgColor, clipPath: cut(17) }}>
            <div className="relative">
              <Avatar
                profile={profile}
                size={compactPhone ? 76 : 88}
                style={{ clipPath: cut(12), boxShadow: `0 0 24px ${neon}` }}
                fallbackBg={neon}
                fallbackColor={theme.bgColor}
              />
              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-black"
                style={{ background: neon, color: theme.bgColor, clipPath: cut(4) }}
                dir="ltr"
              >
                LV {level}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black uppercase tracking-wide truncate flex items-center gap-1.5" style={{ textShadow: `0 0 12px ${neon}` }}>
                {profile.displayName}
                <VerifiedMark show={profile.isVerified} color={neon} />
              </h1>
              <p className="text-[11px] font-bold tracking-widest" style={{ color: theme.secondaryTextColor }} dir="ltr">
                @{profile.username}
              </p>
              <div className="mt-2.5 h-2.5 w-full" style={{ background: `${neon}22`, clipPath: cut(3) }} dir="ltr">
                <div className="h-full" style={{ width: `${xp}%`, background: `linear-gradient(90deg, ${theme.glowColor}, ${neon})`, boxShadow: `0 0 10px ${neon}` }} />
              </div>
              <div className="mt-1 text-[10px] font-bold" style={{ color: theme.secondaryTextColor }} dir="ltr">
                XP {xp}/100
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-7 px-3 py-2 border-s-2" style={{ borderColor: neon, color: theme.secondaryTextColor }}>
            {profile.bio}
          </p>
        )}

        {socials.length > 0 && (
          <>
            <p className="mt-6 mb-2 text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: neon }}>
              {isRtl ? 'الفريق' : 'Squad'}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={isPreview ? undefined : s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square flex items-center justify-center transition-all hover:-translate-y-0.5"
                  style={{ background: `${neon}14`, border: `1px solid ${neon}66`, color: neon, clipPath: cut(8) }}
                >
                  <SocialIcon social={s} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </>
        )}

        <p className="mt-6 mb-2 text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: neon }}>
          {isRtl ? 'المهمّات' : 'Quests'}
        </p>
        <div className="space-y-2.5">
          {links.map((link, i) => (
            <a
              key={link.id}
              {...linkProps(link, click(link))}
              className="group block p-[1px] transition-transform hover:translate-x-1 rtl:hover:-translate-x-1"
              style={{ background: link.isFeatured ? neon : `${neon}55`, clipPath: cut(12) }}
            >
              <span className="flex items-center gap-3 px-3.5 py-3" style={{ background: theme.cardBg, clipPath: cut(11) }}>
                <span className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `${neon}22`, color: neon, clipPath: cut(6) }}>
                  <LinkIcon link={link} className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-black uppercase tracking-wide truncate">{link.title}</span>
                  <span className="block text-[10px] font-bold tracking-widest mt-0.5" style={{ color: theme.secondaryTextColor }} dir="ltr">
                    {link.badgeText ? link.badgeText.toUpperCase() : `QUEST ${String(i + 1).padStart(2, '0')}`}
                  </span>
                </span>
                <span
                  className="px-2.5 py-1 text-[10px] font-black opacity-70 group-hover:opacity-100"
                  style={{ background: neon, color: theme.bgColor, clipPath: cut(4) }}
                >
                  {isRtl ? 'ابدأ' : 'GO'}
                </span>
              </span>
            </a>
          ))}
        </div>

        <TemplateFooter profile={profile} theme={theme} isRtl={isRtl} isPreview={isPreview} />
      </div>
    </TemplateShell>
  );
}
