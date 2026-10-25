'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Layers,
  Zap,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  Smartphone,
  Monitor,
  Play,
} from 'lucide-react';
import { LinkCardType, ThemeConfig } from '@/lib/themes';
import {
  SOCIAL_PLATFORMS,
  OfficialSocialBadge,
  detectSocialPlatformFromUrl,
  detectChannelBadgeLabel,
} from '@/lib/social-platforms';

interface MiniCardVisualProps {
  cardType: LinkCardType;
  accentColor?: string;
  glowColor?: string;
  isSelected?: boolean;
  titleText?: string;
  subtitleText?: string;
  platformId?: string;
}

/**
 * Renders an authentic, real-time live miniature card in the exact architectural style
 * of each of the 12 LinkCardTypes (with real text, real icon/badge, and real visual effects).
 */
export function MiniCardArchitectureVisual({
  cardType,
  accentColor = '#D4AF37',
  glowColor = '#F3E5AB',
  isSelected = false,
  titleText,
  subtitleText,
  platformId,
}: MiniCardVisualProps) {
  const sampleTitle = titleText || 'قناتنا الرسمية VIP';
  const sampleSub = subtitleText || 'انضم الآن وتابع التحديثات';

  const renderMiniIcon = (customClass = 'w-8 h-8 rounded-xl') => {
    if (platformId) {
      return <OfficialSocialBadge platformId={platformId} size="sm" variant="gradient" />;
    }
    return (
      <div
        className={`${customClass} flex items-center justify-center shrink-0 border shadow-md`}
        style={{
          background:
            cardType === 'classic'
              ? 'rgba(0,0,0,0.2)'
              : `linear-gradient(135deg, ${accentColor}38, ${glowColor}18)`,
          borderColor: cardType === 'classic' ? 'rgba(0,0,0,0.35)' : `${accentColor}70`,
          color: cardType === 'classic' ? '#050508' : accentColor,
        }}
      >
        <Crown className="w-4 h-4" />
      </div>
    );
  };

  switch (cardType) {
    case 'glass':
      return (
        <div className="relative min-h-[68px] w-full rounded-2xl bg-white/[0.09] backdrop-blur-xl border border-white/30 p-3 flex items-center justify-between gap-2.5 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.4)]">
          <span className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <span className="pointer-events-none absolute -top-8 -left-8 w-20 h-20 rounded-full bg-white/20 blur-xl" />
          <div className="flex items-center gap-2.5 min-w-0 relative z-10">
            {renderMiniIcon()}
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-white truncate leading-tight">
                {sampleTitle}
              </div>
              <div className="text-[9px] text-zinc-300/85 truncate mt-0.5">
                {sampleSub}
              </div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      );

    case 'spotlight':
      return (
        <div
          className="relative min-h-[68px] w-full rounded-2xl border p-3 flex items-center justify-between gap-2.5 overflow-hidden"
          style={{
            background: `radial-gradient(130px circle at 30% 50%, ${accentColor}55, rgba(10,10,18,0.96) 78%)`,
            borderColor: accentColor,
            boxShadow: `0 10px 28px -6px ${accentColor}45, inset 0 1px 1px rgba(255,255,255,0.3)`,
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0 relative z-10">
            {renderMiniIcon()}
            <div className="min-w-0 text-start">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/25 border border-amber-400/60 text-[7px] font-black text-amber-200 uppercase">
                  SPOTLIGHT
                </span>
              </div>
              <div className="text-[11px] font-black text-white truncate leading-tight mt-0.5">
                {sampleTitle}
              </div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-md">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'animated_border':
      return (
        <div
          className="relative min-h-[68px] w-full rounded-2xl p-[2px] overflow-hidden shadow-[0_10px_28px_-6px_rgba(212,175,55,0.4)]"
          style={{
            background:
              'linear-gradient(90deg, #D4AF37, #EC4899, #00F5D4, #D4AF37)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }}
        >
          <div className="w-full h-full min-h-[64px] rounded-[14px] bg-[#090912] px-3 py-2.5 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {renderMiniIcon()}
              <div className="min-w-0 text-start">
                <div className="text-[11px] font-black text-white truncate leading-tight">
                  {sampleTitle}
                </div>
                <div className="text-[9px] text-amber-300/90 truncate mt-0.5">
                  إطار هولوجرامي متحرك ✨
                </div>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 text-black flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      );

    case '3d':
      return (
        <div
          className="relative min-h-[68px] w-full rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-white/25 border-b-[6px] p-3 flex items-center justify-between gap-2.5 shadow-[0_12px_22px_rgba(0,0,0,0.85)] -translate-y-0.5"
          style={{ borderBottomColor: accentColor }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black font-black text-[10px] flex items-center justify-center shadow-md shrink-0">
              3D
            </div>
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-white truncate leading-tight">
                {sampleTitle}
              </div>
              <div className="text-[9px] text-zinc-400 truncate mt-0.5">
                بروز ثلاثي الأبعاد
              </div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/10 border-b-2 border-amber-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
          </div>
        </div>
      );

    case 'neon':
      return (
        <div
          className="relative min-h-[68px] w-full rounded-2xl bg-[#05060D] p-3 flex items-center justify-between gap-2.5 border-[2px]"
          style={{
            borderColor: '#00F5D4',
            boxShadow:
              '0 0 22px rgba(0,245,212,0.55), inset 0 0 14px rgba(0,245,212,0.22)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#00F5D4] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-cyan-200 truncate leading-tight drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]">
                {sampleTitle}
              </div>
              <div className="text-[9px] font-mono font-bold text-cyan-400 truncate mt-0.5">
                NEON PULSE GLOW
              </div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_#00F5D4]">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'gradient':
      return (
        <div className="relative min-h-[68px] w-full rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-rose-500 border border-white/35 p-3 flex items-center justify-between gap-2.5 overflow-hidden shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/35 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-white truncate leading-tight">
                {sampleTitle}
              </div>
              <div className="text-[9px] text-white/85 truncate mt-0.5">
                تدرج لوني سينمائي
              </div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'bento':
      return (
        <div className="relative min-h-[68px] w-full rounded-2xl bg-gradient-to-br from-[#121220] to-[#080810] border border-amber-400/40 p-2.5 flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                <Layers className="w-3 h-3" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-amber-300">
                BENTO TILE
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[7px] font-black text-emerald-300">
              LIVE WIDGET
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white truncate">
              {sampleTitle}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </div>
        </div>
      );

    case 'image':
      return (
        <div
          className="relative min-h-[68px] w-full rounded-2xl border border-amber-400/45 p-2.5 flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'linear-gradient(to top, rgba(4,4,8,0.96) 15%, rgba(212,175,55,0.3) 100%)',
          }}
        >
          <ImageIcon className="w-9 h-9 text-amber-300/25 absolute top-1.5 right-2" />
          <span className="relative z-10 self-start px-2 py-0.5 rounded-full bg-amber-400 text-black text-[7px] font-black uppercase">
            HD COVER BANNER
          </span>
          <div className="relative z-10 flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-black text-white truncate">
              {sampleTitle}
            </span>
            <div className="w-5 h-5 rounded-full bg-black/70 border border-white/30 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3 h-3 text-amber-300" />
            </div>
          </div>
        </div>
      );

    case 'classic':
      return (
        <div className="relative min-h-[68px] w-full rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-black px-4 py-2.5 flex items-center justify-between gap-2.5 shadow-[0_10px_25px_rgba(212,175,55,0.45)] border border-white/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-black truncate leading-tight">
                {sampleTitle}
              </div>
              <div className="text-[9px] font-bold text-black/75 truncate mt-0.5">
                سبيكة ذهبية كلاسيكية
              </div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-black text-amber-300 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'icon':
      return (
        <div className="relative min-h-[68px] w-full rounded-2xl bg-[#0B0B14] border border-amber-400/45 p-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/35 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-white truncate leading-tight">
                {sampleTitle}
              </div>
              <div className="text-[9px] text-amber-300/85 truncate mt-0.5">
                أيقونة ثلاثية بارزة
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-300 shrink-0" />
        </div>
      );

    case 'minimal':
      return (
        <div className="relative min-h-[68px] w-full bg-black/40 rounded-t-xl border-b-2 border-amber-400 px-3 py-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-1 rounded-md bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono font-black text-[10px] shrink-0">
              01 //
            </span>
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-white truncate leading-tight">
                {sampleTitle}
              </div>
              <div className="text-[9px] text-zinc-400 truncate mt-0.5">
                خط تحريري بسيط وناعم
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
        </div>
      );

    case 'social_grid':
      return (
        <div className="relative min-h-[68px] w-full rounded-2xl bg-gradient-to-r from-[#071912] to-[#081018] border border-emerald-400/50 p-2.5 flex items-center justify-between gap-2.5 shadow-[0_8px_20px_rgba(37,211,102,0.2)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <OfficialSocialBadge
              platformId={platformId || 'whatsapp'}
              size="sm"
              variant="gradient"
            />
            <div className="min-w-0 text-start">
              <div className="text-[11px] font-black text-white truncate leading-tight">
                {sampleTitle}
              </div>
              <span className="inline-block text-[8px] font-mono font-extrabold text-emerald-400 uppercase">
                ● OFFICIAL SOCIAL HUB
              </span>
            </div>
          </div>
          <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>
      );

    default:
      return null;
  }
}

interface InteractiveLiveCardStageProps {
  cardType: LinkCardType;
  title: string;
  description: string;
  url: string;
  icon: string;
  thumbnailUrl?: string;
  badgeText?: string;
  isFeatured?: boolean;
  groupName?: string;
  theme: ThemeConfig;
  isRtl: boolean;
  renderDynamicIcon: (name: string, className?: string) => React.ReactNode;
}

/**
 * Full-scale interactive live card preview stage that renders BOTH:
 * 1) The 1:1 Interactive Card with live mouse-tracking 3D tilt, spotlight beam, & auto-demo mode
 * 2) A Live Mini Phone Viewport showing how the card sits inside the user's actual mobile page!
 */
export function InteractiveLiveCardStage({
  cardType,
  title,
  description,
  url,
  icon,
  thumbnailUrl,
  badgeText,
  isFeatured,
  groupName,
  theme,
  isRtl,
  renderDynamicIcon,
}: InteractiveLiveCardStageProps) {
  const [mousePos, setMousePos] = useState({ x: 220, y: 45, rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [autoAnimateDemo, setAutoAnimateDemo] = useState(true);
  const [demoTick, setDemoTick] = useState(0);

  // Subtle autonomous spotlight/tilt sweep so the user immediately sees the live effect even before moving the mouse
  useEffect(() => {
    if (!autoAnimateDemo || isHovered) return;
    const interval = setInterval(() => {
      setDemoTick((t) => (t + 1) % 100);
    }, 60);
    return () => clearInterval(interval);
  }, [autoAnimateDemo, isHovered]);

  const activeX = isHovered
    ? mousePos.x
    : 120 + Math.sin((demoTick / 100) * Math.PI * 2) * 110;
  const activeY = isHovered
    ? mousePos.y
    : 45 + Math.cos((demoTick / 100) * Math.PI * 2) * 18;
  const activeRx = isHovered
    ? mousePos.rx
    : autoAnimateDemo
    ? Math.sin((demoTick / 100) * Math.PI * 2) * 2.5
    : 0;
  const activeRy = isHovered
    ? mousePos.ry
    : autoAnimateDemo
    ? Math.cos((demoTick / 100) * Math.PI * 2) * 3.5
    : 0;

  const detectedSocial =
    SOCIAL_PLATFORMS.find((p) => p.id === icon?.toLowerCase()) ||
    detectSocialPlatformFromUrl(url);

  const effectiveAccent = detectedSocial?.color || theme.accentColor || '#D4AF37';
  const effectiveGlow = detectedSocial?.glowColor || theme.glowColor || '#F3E5AB';

  const displayTitle =
    title.trim() ||
    (detectedSocial
      ? isRtl
        ? `قناتنا الرسمية على ${detectedSocial.nameAr}`
        : `Official ${detectedSocial.name} Channel`
      : isRtl
      ? 'قناتنا الرسمية على واتساب — انضم الآن'
      : 'Join Our Official VIP Channel');

  const displayDesc =
    description.trim() ||
    (isRtl
      ? 'تابع أحدث الإعلانات والتحديثات الحصرية فور صدورها بتصميم تفاعلي فاخر'
      : 'Follow our latest official announcements & exclusive drops');

  const channelAutoBadge =
    badgeText?.trim() ||
    detectChannelBadgeLabel(url, isRtl) ||
    (isFeatured ? (isRtl ? 'رابط ملكي مميز' : 'VIP FEATURED') : 'VIP PASS');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width - 0.5) * 2;
    const pctY = (y / rect.height - 0.5) * 2;
    setMousePos({
      x,
      y,
      rx: -pctY * 7,
      ry: pctX * 7,
    });
  };

  const renderBadgeIcon = (size: 'md' | 'lg' = 'md') => {
    if (thumbnailUrl && cardType !== 'image') {
      return (
        <img
          src={thumbnailUrl}
          alt={displayTitle}
          className={`${
            size === 'lg' ? 'w-14 h-14' : 'w-12 h-12'
          } rounded-2xl object-cover border border-white/25 shrink-0 shadow-xl`}
        />
      );
    }
    if (detectedSocial) {
      return (
        <OfficialSocialBadge
          platformId={detectedSocial.id}
          size={size}
          variant="gradient"
        />
      );
    }
    return (
      <div
        className={`${
          size === 'lg' ? 'w-14 h-14' : 'w-12 h-12'
        } rounded-2xl flex items-center justify-center shrink-0 shadow-lg border transition-transform duration-300 group-hover:scale-110`}
        style={{
          background:
            cardType === 'classic'
              ? 'rgba(0,0,0,0.2)'
              : `linear-gradient(135deg, ${effectiveAccent}38, ${effectiveGlow}18)`,
          borderColor:
            cardType === 'classic' ? 'rgba(0,0,0,0.35)' : `${effectiveAccent}70`,
          color: cardType === 'classic' ? '#050508' : effectiveAccent,
        }}
      >
        {renderDynamicIcon(icon || 'Sparkles', size === 'lg' ? 'w-6 h-6' : 'w-5 h-5')}
      </div>
    );
  };

  const renderCardByArchitecture = () => {
    const transform3D = `perspective(1000px) rotateX(${activeRx}deg) rotateY(${activeRy}deg) translateY(${
      isHovered ? -3 : 0
    }px) scale(${isHovered ? 1.015 : 1})`;

    // 1. BENTO ARCHITECTURAL WIDGET CARD
    if (cardType === 'bento') {
      return (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: transform3D,
            background: `linear-gradient(145deg, rgba(16,16,28,0.96), rgba(8,8,14,0.98))`,
            borderColor: effectiveAccent,
            boxShadow: `0 24px 60px -12px ${effectiveGlow}45, inset 0 1px 1px rgba(255,255,255,0.25)`,
          }}
          className="group relative rounded-[28px] border-2 p-5 sm:p-6 transition-all duration-200 overflow-hidden cursor-pointer"
        >
          <span
            className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-45"
            style={{ backgroundColor: effectiveAccent }}
          />
          <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {renderBadgeIcon('lg')}
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-1"
                  style={{
                    backgroundColor: `${effectiveAccent}20`,
                    borderColor: `${effectiveAccent}55`,
                    color: effectiveAccent,
                  }}
                >
                  {channelAutoBadge || groupName || 'BENTO SHOWCASE'}
                </span>
                <div className="text-xs text-zinc-400 font-mono" dir="ltr">
                  {url || 'https://voltix.io'}
                </div>
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border"
              style={{
                backgroundColor: `${effectiveAccent}20`,
                borderColor: `${effectiveAccent}50`,
                color: effectiveAccent,
              }}
            >
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="relative z-10 space-y-1.5 text-start">
            <h4 className="text-base sm:text-lg font-black text-white leading-snug">
              {displayTitle}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300/85 leading-relaxed">
              {displayDesc}
            </p>
          </div>
        </div>
      );
    }

    // 2. CINEMATIC THUMBNAIL / IMAGE COVER CARD
    if (cardType === 'image') {
      const bgCover = thumbnailUrl
        ? `linear-gradient(to top, rgba(4,4,8,0.96) 15%, rgba(4,4,8,0.35) 100%), url(${thumbnailUrl}) center/cover no-repeat`
        : `linear-gradient(to top, rgba(4,4,8,0.95) 10%, rgba(18,14,28,0.45) 100%), radial-gradient(circle at 80% 20%, ${effectiveAccent}66, ${theme.gradientColors[1]} 70%)`;

      return (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: transform3D,
            background: bgCover,
            borderColor: effectiveAccent,
            boxShadow: `0 25px 60px -12px rgba(0,0,0,0.85)`,
          }}
          className="group relative rounded-[28px] border-2 min-h-[152px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden transition-all duration-200 cursor-pointer"
        >
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/50 text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3 h-3" />
              <span>{channelAutoBadge || (isRtl ? 'بطاقة مصورة سينمائية' : 'CINEMA COVER')}</span>
            </span>
            {detectedSocial && (
              <OfficialSocialBadge
                platformId={detectedSocial.id}
                size="sm"
                variant="gradient"
              />
            )}
          </div>

          <div className="relative z-10 flex items-end justify-between gap-4 pt-6">
            <div className="text-start space-y-1">
              <h4 className="text-base sm:text-lg font-black text-white drop-shadow-md leading-snug">
                {displayTitle}
              </h4>
              <p className="text-xs text-zinc-200/90 line-clamp-1">{displayDesc}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      );
    }

    // 3. MINIMAL EDITORIAL ARCHITECTURAL LINE
    if (cardType === 'minimal') {
      return (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative py-4 px-4 rounded-t-2xl bg-black/45 border-b-[3px] transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer"
          style={{
            borderColor: effectiveAccent,
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <span
              className="text-xs font-mono font-black tracking-widest px-3 py-1.5 rounded-xl border"
              style={{
                color: effectiveAccent,
                borderColor: `${effectiveAccent}55`,
                backgroundColor: `${effectiveAccent}15`,
              }}
            >
              01 //
            </span>
            <div className="text-start min-w-0">
              <div className="text-base font-black text-white">{displayTitle}</div>
              <div className="text-xs text-zinc-400">{displayDesc}</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 shrink-0" style={{ color: effectiveAccent }} />
        </div>
      );
    }

    // 4. ALL OTHER ARCHITECTURAL STYLES
    const getSurfaceStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
        transform: transform3D,
        transition: 'transform 0.18s ease-out, box-shadow 0.25s ease',
      };

      switch (cardType) {
        case 'spotlight':
          return {
            ...base,
            background: `radial-gradient(340px circle at ${activeX}px ${activeY}px, ${effectiveAccent}50, rgba(14,14,24,0.95) 75%)`,
            border: `1.5px solid ${effectiveAccent}`,
            boxShadow: `0 22px 50px -12px ${effectiveGlow}55, inset 0 1px 1.5px rgba(255,255,255,0.35)`,
          };
        case 'animated_border':
          return {
            ...base,
            background:
              'linear-gradient(#0B0B14, #0B0B14) padding-box, linear-gradient(120deg, #D4AF37, #EC4899, #00F5D4, #D4AF37) border-box',
            border: '2.5px solid transparent',
            boxShadow: `0 20px 50px -10px ${effectiveGlow}55`,
          };
        case '3d':
          return {
            ...base,
            background: 'linear-gradient(180deg, #222234 0%, #0D0D17 100%)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderBottom: `7px solid ${effectiveAccent}`,
            boxShadow: `0 22px 44px -8px rgba(0,0,0,0.9), 0 0 25px ${effectiveGlow}35`,
          };
        case 'neon':
          return {
            ...base,
            background: 'rgba(6, 8, 16, 0.94)',
            border: `2px solid #00F5D4`,
            boxShadow: `0 0 36px rgba(0,245,212,0.65), inset 0 0 20px rgba(0,245,212,0.28)`,
          };
        case 'gradient':
          return {
            ...base,
            background: `linear-gradient(135deg, ${theme.gradientColors[1]}EE 0%, ${theme.gradientColors[2]}EE 50%, ${effectiveAccent}AA 100%)`,
            border: '1.5px solid rgba(255,255,255,0.4)',
            boxShadow: `0 22px 50px -10px ${effectiveGlow}55, inset 0 1px 2px rgba(255,255,255,0.4)`,
          };
        case 'classic':
          return {
            ...base,
            background: `linear-gradient(135deg, #F3E5AB 0%, ${effectiveAccent} 55%, #AA771C 100%)`,
            color: '#050508',
            border: '1.5px solid rgba(255,255,255,0.6)',
            boxShadow: `0 20px 45px -10px ${effectiveAccent}75`,
          };
        case 'social_grid':
          return {
            ...base,
            background: `linear-gradient(135deg, rgba(8,26,18,0.95), rgba(8,14,22,0.96))`,
            border: `2px solid #25D366`,
            boxShadow: `0 18px 40px -10px rgba(37,211,102,0.45)`,
          };
        default:
          // 'glass' or 'icon'
          return {
            ...base,
            background: 'rgba(24, 24, 38, 0.82)',
            backdropFilter: 'blur(24px) saturate(190%)',
            border: `1.5px solid rgba(255,255,255,0.28)`,
            boxShadow: `0 20px 45px -12px rgba(0,0,0,0.75), inset 0 1px 2px rgba(255,255,255,0.35)`,
          };
      }
    };

    const isClassic = cardType === 'classic';

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
        style={getSurfaceStyle()}
        className={`group relative flex items-center justify-between gap-4 p-4 sm:p-5 ${
          isClassic ? 'rounded-full px-6' : 'rounded-[26px]'
        } overflow-hidden cursor-pointer`}
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/55 to-transparent" />

        <div className="relative z-10 flex items-center gap-4 min-w-0 flex-1">
          {renderBadgeIcon(cardType === 'icon' ? 'lg' : 'md')}

          <div className="min-w-0 flex-1 text-start space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {channelAutoBadge && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider leading-none ${
                    isClassic
                      ? 'bg-black/20 text-black border border-black/30'
                      : 'bg-amber-500/20 border border-amber-400/60 text-amber-200'
                  }`}
                >
                  <Crown className="w-2.5 h-2.5" />
                  <span>{channelAutoBadge}</span>
                </span>
              )}

              {detectedSocial && !isClassic && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider leading-none border"
                  style={{
                    backgroundColor: `${detectedSocial.color}22`,
                    borderColor: `${detectedSocial.color}65`,
                    color: detectedSocial.color,
                  }}
                >
                  {isRtl ? detectedSocial.nameAr : detectedSocial.name}
                </span>
              )}
            </div>

            <div
              className={`font-black leading-snug ${
                cardType === 'icon' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              } ${isClassic ? 'text-black' : 'text-white'}`}
            >
              {displayTitle}
            </div>

            <div
              className={`text-xs leading-relaxed ${
                isClassic ? 'text-black/75 font-semibold' : 'text-zinc-300/85'
              }`}
            >
              {displayDesc}
            </div>
          </div>
        </div>

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
            isClassic
              ? 'bg-black text-amber-300 shadow-lg'
              : 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[28px] bg-gradient-to-b from-[#0C0C16] to-[#06060C] border-2 border-amber-400/45 p-4 sm:p-5 space-y-3.5 shadow-[0_22px_55px_rgba(0,0,0,0.85)]">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-black text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {isRtl
              ? 'المعاينة الحية الفورية لشكل البطاقة المختار (تتغير لحظيًا مع كل اختيار):'
              : 'Real-Time Interactive Card Showroom:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoAnimateDemo((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1 transition-all ${
              autoAnimateDemo
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-white/5 border-white/15 text-zinc-400'
            }`}
          >
            <Play className="w-2.5 h-2.5" />
            <span>
              {isRtl ? 'حركة تفاعلية تلقائية' : 'Auto-Motion Demo'}
            </span>
          </button>

          <span
            dir="ltr"
            className="px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider"
          >
            {cardType.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl bg-[#040408] border border-white/10 p-4 sm:p-6 overflow-hidden flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 cyber-grid-floor opacity-40" />
        <div className="relative z-10 w-full max-w-[540px]">
          {renderCardByArchitecture()}
        </div>
      </div>
    </div>
  );
}
