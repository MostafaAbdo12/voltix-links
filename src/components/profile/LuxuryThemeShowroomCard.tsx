'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Crown,
  Eye,
  Sparkles,
  ArrowUpRight,
  Layers,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Rows2,
  GalleryHorizontalEnd,
  LayoutGrid,
  Power,
  Star,
  Search,
  Shuffle,
  Palette,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { OfficialSocialBadge } from '@/lib/social-platforms';

interface LuxuryThemeShowroomCardProps {
  theme: ThemeConfig;
  index: number;
  isSelected: boolean;
  isRtl: boolean;
  onSelect: (themeId: string) => void;
  onQuickInspect?: (theme: ThemeConfig) => void;
  compact?: boolean;
  isDefaultTheme?: boolean;
  isDisabledTheme?: boolean;
  onToggleDisable?: (themeId: string) => void;
  onSetDefault?: (themeId: string) => void;
  /** Optional corner badge, e.g. a price/lock for paid themes */
  badge?: React.ReactNode;
}

/**
 * Out-of-the-box 3D Miniature Smartphone & Spatial Identity Showroom Card
 * Renders a live miniature interactive profile preview for each of the 30 themes.
 */
export function LuxuryThemeShowroomCard({
  theme: th,
  index,
  isSelected,
  isRtl,
  onSelect,
  onQuickInspect,
  compact = false,
  isDefaultTheme = false,
  isDisabledTheme = false,
  onToggleDisable,
  onSetDefault,
  badge,
}: LuxuryThemeShowroomCardProps) {
  const isLight = Boolean(th.isLight);
  const primaryText = isLight ? '#0F172A' : '#FFFFFF';
  const secondaryText = isLight ? '#475569' : 'rgba(228,228,231,0.82)';
  const themeFontStack = `'${th.fontFamilyAr}', '${th.fontFamilyEn}', sans-serif`;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.018 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(th.id)}
      className={`group cursor-pointer text-start rounded-[30px] p-3.5 sm:p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
        isDisabledTheme ? 'opacity-65 saturate-50 ' : ''
      }${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_25px_70px_-12px_rgba(212,175,55,0.45)]'
          : isDefaultTheme
          ? 'border-emerald-400/80 ring-1 ring-emerald-400/40 shadow-[0_20px_60px_-12px_rgba(16,185,129,0.3)]'
          : isLight
          ? 'border-slate-300/80 hover:border-indigo-500 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.25)]'
          : 'border-white/15 hover:border-amber-400/55 shadow-[0_20px_55px_-15px_rgba(0,0,0,0.85)]'
      }`}
      style={{
        background: `linear-gradient(155deg, ${th.gradientColors[0]} 0%, ${th.gradientColors[1]} 52%, ${th.gradientColors[2]} 100%)`,
        fontFamily: themeFontStack,
      }}
    >
      {badge && <div className="absolute top-3 end-3 z-30 pointer-events-none">{badge}</div>}
      {/* Ambient Theme Glow Orb */}
      <span
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-45 group-hover:opacity-80 transition-opacity"
        style={{ backgroundColor: th.glowColor }}
      />
      <span
        className="pointer-events-none absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-35 group-hover:opacity-70 transition-opacity"
        style={{ backgroundColor: th.accentColor }}
      />

      {/* Top Specular Reflection */}
      <span className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div>
        {/* Header Bar: Rank + Category + DNA Color Orbs */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${
              isLight
                ? 'bg-slate-900/90 text-white border-slate-700'
                : 'bg-black/65 text-white border-white/15'
            }`}
          >
            <span className="text-amber-400 font-mono">
              #{String(index + 1).padStart(2, '0')}
            </span>
            <span>•</span>
            <span>{isRtl ? th.categoryAr : th.categoryEn}</span>
          </span>

          <div className="flex items-center gap-1.5" dir="ltr">
            {isDefaultTheme && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-black uppercase flex items-center gap-1 shadow">
                <Star className="w-2.5 h-2.5 fill-black" />
                <span>{isRtl ? 'افتراضي' : 'DEFAULT'}</span>
              </span>
            )}
            {isSelected && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase flex items-center gap-1 shadow">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{isRtl ? 'نشط' : 'ACTIVE'}</span>
              </span>
            )}
            <div className="flex items-center -space-x-1.5">
              <span
                className="w-4 h-4 rounded-full border border-white/80 shadow-sm"
                style={{ backgroundColor: th.accentColor }}
                title={`Accent: ${th.accentColor}`}
              />
              <span
                className="w-4 h-4 rounded-full border border-white/80 shadow-sm"
                style={{ backgroundColor: th.glowColor }}
                title={`Glow: ${th.glowColor}`}
              />
            </div>
          </div>
        </div>

        {/* ================================================================
            LIVE MINIATURE SMARTPHONE VIEWPORT INSIDE THEME CARD
        ================================================================ */}
        <div
          className="relative z-10 rounded-[22px] p-3 border overflow-hidden transition-transform duration-300 group-hover:scale-[1.01]"
          style={{
            background: isLight
              ? 'rgba(255,255,255,0.84)'
              : 'rgba(6, 6, 12, 0.64)',
            borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(16px)',
            boxShadow: `inset 0 1px 1px rgba(255,255,255,0.22), 0 12px 30px -10px rgba(0,0,0,0.55)`,
          }}
        >
          {/* Mini Phone Notch + Status */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span
              className="text-[8px] font-mono font-extrabold uppercase tracking-widest opacity-85"
              style={{ color: th.accentColor }}
              dir="ltr"
            >
              {th.animatedBgType}
            </span>
            <div className="w-12 h-2 rounded-full bg-black/60 border border-white/15 flex items-center justify-end px-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span
              className="text-[8px] font-mono font-bold uppercase opacity-75"
              style={{ color: secondaryText }}
              dir="ltr"
            >
              {th.profileLayout}
            </span>
          </div>

          {/* Mini Profile Header inside Viewport */}
          <div
            className="rounded-2xl p-2.5 mb-2.5 border relative overflow-hidden flex items-center gap-2.5"
            style={{
              backgroundColor: th.cardBg,
              borderColor: th.cardBorder,
            }}
          >
            {/* Subtle Header Cover Accent for Creator/Split Layouts */}
            {(th.profileLayout === 'creator-showcase' || th.profileLayout === 'split') && (
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-2 opacity-60"
                style={{
                  background: `linear-gradient(90deg, ${th.accentColor}, ${th.glowColor})`,
                }}
              />
            )}

            {/* Mini Orbital Avatar */}
            <div
              className="w-9 h-9 rounded-full p-[1.5px] shrink-0 relative"
              style={{
                background: `conic-gradient(from 0deg, ${th.accentColor}, ${th.glowColor}, ${th.accentColor})`,
              }}
            >
              <div className="w-full h-full rounded-full bg-[#07070D] p-1 flex items-center justify-center overflow-hidden">
                <img
                  src="/voltix-logo.png"
                  alt="VoltiX"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span
                  className="text-xs font-black truncate leading-tight"
                  style={{ color: primaryText }}
                >
                  {isRtl ? th.nameAr : th.nameEn}
                </span>
                <Crown
                  className="w-3 h-3 shrink-0"
                  style={{ color: th.accentColor }}
                />
              </div>
              <div
                className="text-[9px] font-mono truncate opacity-80"
                style={{ color: secondaryText }}
                dir="ltr"
              >
                @voltix • {th.defaultCardType}
              </div>
            </div>
          </div>

          {/* Mini Official Social Icons Strip */}
          {!compact && (
            <div className="flex items-center justify-center gap-1.5 mb-2.5">
              {(['whatsapp', 'telegram', 'discord', 'instagram'] as const).map((platId) => (
                <div
                  key={platId}
                  className="scale-75 -mx-1 transition-transform group-hover:scale-90"
                >
                  <OfficialSocialBadge
                    platformId={platId}
                    size="sm"
                    variant="gradient"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Miniature Link Cards Matching the Theme's Exact Architecture & Layout */}
          <div className="space-y-1.5">
            {/* Link Card 1 (Primary Featured Style) */}
            <div
              className="px-2.5 py-2 flex items-center justify-between gap-2 transition-all"
              style={{
                borderRadius:
                  th.buttonStyle === 'pill' || th.buttonStyle === 'glass-capsule'
                    ? '999px'
                    : th.buttonStyle === 'sharp'
                    ? '6px'
                    : '12px',
                background:
                  th.defaultCardType === 'classic'
                    ? th.accentColor
                    : th.defaultCardType === 'gradient'
                    ? `linear-gradient(135deg, ${th.gradientColors[1]}, ${th.gradientColors[2]})`
                    : th.defaultCardType === 'spotlight'
                    ? `radial-gradient(120px circle at 25% 50%, ${th.accentColor}45, ${th.cardBg} 85%)`
                    : th.cardBg,
                border:
                  th.defaultCardType === 'neon'
                    ? `1.5px solid ${th.glowColor}`
                    : th.defaultCardType === '3d'
                    ? `1px solid ${th.cardBorder}`
                    : `1px solid ${th.accentColor}65`,
                borderBottom:
                  th.defaultCardType === '3d'
                    ? `3px solid ${th.accentColor}`
                    : undefined,
                boxShadow:
                  th.defaultCardType === 'neon'
                    ? `0 0 12px ${th.glowColor}45`
                    : `0 6px 16px -6px ${th.glowColor}40`,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                  style={{
                    backgroundColor:
                      th.defaultCardType === 'classic'
                        ? 'rgba(0,0,0,0.2)'
                        : `${th.accentColor}30`,
                    color:
                      th.defaultCardType === 'classic'
                        ? isLight
                          ? '#FFFFFF'
                          : '#050508'
                        : th.accentColor,
                  }}
                >
                  ✦
                </span>
                <span
                  className="text-[10px] font-extrabold truncate"
                  style={{
                    color:
                      th.defaultCardType === 'classic'
                        ? isLight
                          ? '#FFFFFF'
                          : '#050508'
                        : primaryText,
                  }}
                >
                  {isRtl ? 'القناة الرسمية المميزة' : 'Featured Official Channel'}
                </span>
              </div>
              <ArrowUpRight
                className="w-3 h-3 shrink-0"
                style={{
                  color:
                    th.defaultCardType === 'classic'
                      ? isLight
                        ? '#FFFFFF'
                        : '#050508'
                      : th.accentColor,
                }}
              />
            </div>

            {/* Link Card 2: Renders 2-Column Bento Tiles if Bento, or Secondary Bar */}
            {th.profileLayout === 'bento' || th.defaultCardType === 'bento' ? (
              <div className="grid grid-cols-2 gap-1.5">
                {[1, 2].map((tileNum) => (
                  <div
                    key={tileNum}
                    className="px-2 py-1.5 flex items-center justify-between rounded-lg"
                    style={{
                      backgroundColor: th.cardBg,
                      border: `1px solid ${th.cardBorder}`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: tileNum === 1 ? th.accentColor : th.glowColor,
                      }}
                    />
                    <span
                      className="text-[7px] font-mono uppercase"
                      style={{ color: primaryText }}
                    >
                      BENTO {tileNum}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="px-2.5 py-1.5 flex items-center justify-between gap-2 opacity-90"
                style={{
                  borderRadius:
                    th.buttonStyle === 'pill' || th.buttonStyle === 'glass-capsule'
                      ? '999px'
                      : th.buttonStyle === 'sharp'
                      ? '6px'
                      : '11px',
                  backgroundColor: th.cardBg,
                  border: `1px solid ${th.cardBorder}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: th.glowColor }}
                  />
                  <div
                    className="w-20 h-1.5 rounded-full opacity-75"
                    style={{ backgroundColor: primaryText }}
                  />
                </div>
                <span
                  className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${th.accentColor}20`,
                    color: th.accentColor,
                  }}
                >
                  VIP
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Theme Title + Specs + Live Preview & Optional Admin Triggers */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div
              className="text-xs sm:text-sm font-black truncate"
              style={{ color: primaryText }}
            >
              {isRtl ? th.nameAr : th.nameEn}
            </div>
            <div
              className="text-[10px] font-mono truncate flex items-center gap-1"
              style={{ color: secondaryText }}
              dir="ltr"
            >
              <span>{th.defaultCardType.toUpperCase()}</span>
              <span>•</span>
              <span>{th.fontFamilyAr}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onQuickInspect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickInspect(th);
                }}
                title={isRtl ? 'معاينة مكبرة للثيم' : 'Full Inspect Theme'}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 border transition-all whitespace-nowrap ${
                  isLight
                    ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                    : 'bg-black/65 text-amber-300 border-amber-400/40 hover:bg-amber-400 hover:text-black'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{isRtl ? 'معاينة حية' : 'Live View'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Admin Action Bar (Enable/Disable + Set Default Platform Theme) */}
        {(onToggleDisable || onSetDefault) && (
          <div
            className="flex items-center gap-1.5 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            {onToggleDisable && (
              <button
                type="button"
                onClick={() => onToggleDisable(th.id)}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-extrabold border flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                  isDisabledTheme
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 hover:bg-emerald-500 hover:text-black'
                    : 'bg-black/65 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                <Power className="w-3 h-3 shrink-0" />
                <span>
                  {isDisabledTheme
                    ? isRtl
                      ? 'تفعيل الثيم'
                      : 'Enable'
                    : isRtl
                    ? 'تعطيل مؤقت'
                    : 'Disable'}
                </span>
              </button>
            )}

            {onSetDefault && (
              <button
                type="button"
                onClick={() => onSetDefault(th.id)}
                disabled={isDefaultTheme}
                className={`py-1.5 px-2.5 rounded-xl text-[10px] font-extrabold border flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                  isDefaultTheme
                    ? 'bg-emerald-400 text-black border-emerald-300 cursor-default'
                    : 'bg-black/65 text-amber-200 border-amber-400/40 hover:bg-amber-400 hover:text-black'
                }`}
              >
                <Star className="w-3 h-3 shrink-0" />
                <span>
                  {isDefaultTheme
                    ? isRtl
                      ? 'افتراضي المنصة'
                      : 'Default'
                    : isRtl
                    ? 'تعيين افتراضي'
                    : 'Set Default'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface HorizontalThemeShowroomCarouselProps {
  themes: ThemeConfig[];
  allThemesForIndex?: ThemeConfig[];
  selectedThemeId: string;
  isRtl: boolean;
  onSelect: (themeId: string, themeObj: ThemeConfig) => void;
  onQuickInspect?: (theme: ThemeConfig) => void;
  defaultRows?: 1 | 2 | 'grid';
  defaultThemeId?: string;
  disabledThemeIds?: string[];
  onToggleDisable?: (themeId: string) => void;
  onSetDefault?: (themeId: string) => void;
  themeBadges?: Record<string, React.ReactNode>;
}

/**
 * Ultra-Luxury Horizontal Left/Right Scroll Showroom Deck
 * Designed to sit directly beside the Live Phone Preview without vertical page clutter.
 */
export function HorizontalThemeShowroomCarousel({
  themes,
  allThemesForIndex,
  selectedThemeId,
  isRtl,
  onSelect,
  onQuickInspect,
  defaultRows = 2,
  defaultThemeId,
  disabledThemeIds = [],
  onToggleDisable,
  onSetDefault,
  themeBadges,
}: HorizontalThemeShowroomCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const categoryTrackRef = useRef<HTMLDivElement>(null);
  const [rowsMode, setRowsMode] = useState<1 | 2 | 'grid'>(defaultRows);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Smooth Category Track Drag & Scroll Controls
  const [isCatDragging, setIsCatDragging] = useState(false);
  const [catDragStartX, setCatDragStartX] = useState(0);
  const [catDragScrollLeft, setCatDragScrollLeft] = useState(0);

  const scrollCategoryTrack = (direction: 'left' | 'right') => {
    const el = categoryTrackRef.current;
    if (!el) return;
    const amount = Math.max(180, Math.round(el.clientWidth * 0.45));
    // In modern Chromium/browsers, negative delta scrolls to the visual left
    const delta = direction === 'left' ? -amount : amount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    const el = categoryTrackRef.current;
    if (!el) return;
    setIsCatDragging(true);
    setCatDragStartX(e.pageX - el.offsetLeft);
    setCatDragScrollLeft(el.scrollLeft);
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isCatDragging) return;
    e.preventDefault();
    const el = categoryTrackRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - catDragStartX) * 1.4;
    if (isRtl) {
      el.scrollLeft = catDragScrollLeft + walk;
    } else {
      el.scrollLeft = catDragScrollLeft - walk;
    }
  };

  const handleCatMouseUp = () => {
    setIsCatDragging(false);
  };

  const handleCatWheel = (e: React.WheelEvent) => {
    const el = categoryTrackRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      const sign = isRtl ? -1 : 1;
      el.scrollBy({ left: sign * (e.deltaY * 1.2), behavior: 'auto' });
    }
  };

  const uniqueCategories = Array.from(new Set(themes.map((th) => th.categoryEn))).map(
    (catEn) => {
      const sample = themes.find((tItem) => tItem.categoryEn === catEn)!;
      return {
        en: catEn,
        ar: sample ? sample.categoryAr : catEn,
        count: themes.filter((tItem) => tItem.categoryEn === catEn).length,
      };
    }
  );

  const filteredByCategory =
    categoryFilter === 'ALL'
      ? themes
      : themes.filter((th) => th.categoryEn === categoryFilter);

  const q = searchQuery.trim().toLowerCase();
  const visibleThemes = q
    ? filteredByCategory.filter(
        (th) =>
          th.nameAr.toLowerCase().includes(q) ||
          th.nameEn.toLowerCase().includes(q) ||
          th.categoryAr.toLowerCase().includes(q) ||
          th.categoryEn.toLowerCase().includes(q) ||
          th.fontFamilyAr.toLowerCase().includes(q) ||
          th.fontFamilyEn.toLowerCase().includes(q) ||
          th.defaultCardType.toLowerCase().includes(q)
      )
    : filteredByCategory;

  const activeThemeIndex = Math.max(
    0,
    visibleThemes.findIndex((th) => th.id === selectedThemeId)
  );
  const activeThemeObj =
    visibleThemes.find((th) => th.id === selectedThemeId) ||
    themes.find((th) => th.id === selectedThemeId) ||
    visibleThemes[0] ||
    themes[0];

  const handleRandomTheme = () => {
    if (themes.length === 0) return;
    const randomIdx = Math.floor(Math.random() * themes.length);
    const chosen = themes[randomIdx];
    onSelect(chosen.id, chosen);
    scrollToThemeCard(chosen);
  };

  const handleScrollBy = (direction: 'prev' | 'next') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const step = Math.max(320, Math.round(container.clientWidth * 0.72));
    // In RTL, scrolling "next" visually moves left (negative scrollLeft in modern browsers)
    const sign =
      direction === 'next' ? (isRtl ? -1 : 1) : isRtl ? 1 : -1;
    container.scrollBy({ left: sign * step, behavior: 'smooth' });
  };

  const handleStepTheme = (direction: 'prev' | 'next') => {
    if (visibleThemes.length === 0) return;
    const nextIdx =
      direction === 'next'
        ? (activeThemeIndex + 1) % visibleThemes.length
        : (activeThemeIndex - 1 + visibleThemes.length) % visibleThemes.length;
    const target = visibleThemes[nextIdx];
    if (target) {
      onSelect(target.id, target);
      const el = cardRefs.current[target.id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const scrollToThemeCard = (themeObj: ThemeConfig) => {
    onSelect(themeObj.id, themeObj);
    const el = cardRefs.current[themeObj.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  return (
    <div className="rounded-[34px] vip-black-card border border-amber-400/35 p-4 sm:p-6 shadow-[0_28px_80px_rgba(0,0,0,0.9)] space-y-4 relative overflow-hidden">
      {/* Top Specular Gold Line */}
      <span className="pointer-events-none absolute inset-x-16 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/75 to-transparent" />

      {/* ====================================================================
          TOP NAVIGATION & HEADER (40 THEMES SHOWROOM)
      ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 via-black to-purple-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-500/10">
            <Palette className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white whitespace-nowrap">
                {isRtl
                  ? 'معرض الثيمات المعمارية الفاخرة (40 ثيماً ملكياً وخارج الصندوق)'
                  : 'Sovereign 40 Architectural Themes Showroom'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-purple-500/20 border border-amber-400/40 text-[10px] font-black text-amber-300 whitespace-nowrap">
                {visibleThemes.length} / {themes.length} {isRtl ? 'ثيم' : 'Themes'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {isRtl
                ? 'مرر يميناً ويساراً أو ابحث لاختبار الثيمات مباشرة على الهاتف التفاعلي ثلاثي الأبعاد بجانبك'
                : 'Scroll left & right or search to test themes live on the interactive 3D phone beside you'}
            </p>
          </div>
        </div>

        {/* Row Mode Toggle + Surprise Button + Left/Right Scroll Arrows */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Surprise Me Button */}
          <button
            type="button"
            onClick={handleRandomTheme}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-black to-amber-500/20 hover:from-purple-500/40 hover:to-amber-500/40 border border-purple-400/40 text-purple-200 hover:text-white text-[11px] font-black flex items-center gap-1.5 transition-all shadow-md"
            title={isRtl ? 'اختر ثيماً عشوائياً مفاجئاً' : 'Surprise me with random theme'}
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            <span>{isRtl ? 'ثيم عشوائي ✦' : 'Surprise Me ✦'}</span>
          </button>

          {/* 1-Row vs 2-Row vs Grid Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-black/75 border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setRowsMode(1)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all whitespace-nowrap ${
                rowsMode === 1
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GalleryHorizontalEnd className="w-3 h-3" />
              <span>{isRtl ? 'صف واحد' : '1 Row'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRowsMode(2)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all whitespace-nowrap ${
                rowsMode === 2
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Rows2 className="w-3 h-3" />
              <span>{isRtl ? 'صفان مدمجان' : '2 Rows'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRowsMode('grid')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all whitespace-nowrap ${
                rowsMode === 'grid'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{isRtl ? 'شبكة كاملة' : 'Full Grid'}</span>
            </button>
          </div>

          {/* Smooth Horizontal Scroll Left / Right Buttons */}
          {rowsMode !== 'grid' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScrollBy('prev')}
                title={isRtl ? 'تمرير لليمين (السابق)' : 'Scroll Left (Previous)'}
                className="h-9 px-3 rounded-full bg-white/[0.06] hover:bg-amber-400 hover:text-black border border-white/15 hover:border-amber-300 text-xs font-extrabold flex items-center gap-1 transition-all whitespace-nowrap shadow-sm"
              >
                {isRtl ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
                <span className="hidden md:inline">{isRtl ? 'يمين' : 'Left'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleScrollBy('next')}
                title={isRtl ? 'تمرير لليسار (التالي)' : 'Scroll Right (Next)'}
                className="h-9 px-3.5 rounded-full bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs flex items-center gap-1 shadow-[0_8px_20px_-4px_rgba(212,175,55,0.5)] hover:brightness-110 transition-all whitespace-nowrap"
              >
                <span>{isRtl ? 'يسار (المزيد)' : 'Right (More)'}</span>
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          ACTIVE THEME VIP HERO DOCK / SPOTLIGHT STRIP
      ==================================================================== */}
      {activeThemeObj && (
        <div
          className="p-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 flex flex-wrap items-center justify-between gap-3 shadow-inner"
          style={{
            background: `linear-gradient(90deg, ${activeThemeObj.gradientColors[0]}90, ${activeThemeObj.gradientColors[1]}60, rgba(0,0,0,0.85))`,
            borderColor: `${activeThemeObj.accentColor}55`,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Live Indicator Dot */}
            <span
              className="w-3 h-3 rounded-full animate-ping shrink-0"
              style={{ background: activeThemeObj.accentColor }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  {isRtl ? activeThemeObj.nameAr : activeThemeObj.nameEn}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-black/60 border border-white/15 text-amber-300">
                  {isRtl ? activeThemeObj.categoryAr : activeThemeObj.categoryEn}
                </span>
              </div>
              <div className="text-[10px] text-zinc-300 font-mono flex items-center gap-1.5 mt-0.5">
                <span>{activeThemeObj.fontFamilyAr} + {activeThemeObj.fontFamilyEn}</span>
                <span>•</span>
                <span className="uppercase text-amber-300">{activeThemeObj.defaultCardType}</span>
                <span>•</span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isRtl ? 'نشط الآن على الهاتف الحي' : 'Live on Phone'}
                </span>
              </div>
            </div>
          </div>

          {/* DNA Swatch Pills */}
          <div className="flex items-center gap-2" dir="ltr">
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              {activeThemeObj.gradientColors.map((col, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-lg border border-white/20 shadow-sm"
                  style={{ background: col }}
                  title={`Color: ${col}`}
                />
              ))}
            </div>
            <div
              className="w-4 h-4 rounded-lg border border-white/25 shadow-sm"
              style={{ background: activeThemeObj.accentColor }}
              title={`Accent: ${activeThemeObj.accentColor}`}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          SEARCH BAR & CATEGORY FILTER PILLS
      ==================================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-zinc-400 pointer-events-none`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isRtl
                  ? 'ابحث بالاسم أو اللون أو الطابع (مثال: أوريغامي، كوانتوم، ذهب، نيون)...'
                  : 'Search themes by name, color, or vibe (e.g., Quantum, Origami, Gold, Cyber)...'
              }
              className={`w-full ${isRtl ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 rounded-2xl bg-black/65 border border-white/10 focus:border-amber-400/60 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2.5' : 'right-2.5'} text-[10px] font-bold text-zinc-400 hover:text-white px-1.5 py-0.5 rounded-full bg-white/10`}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Horizontal Track with Smooth Left/Right Buttons, Mouse Drag & Wheel Scroll */}
        <div className="relative flex items-center gap-1.5 pt-0.5">
          {/* Scroll Toward Start (Right in RTL, Left in LTR) */}
          <button
            type="button"
            onClick={() => scrollCategoryTrack(isRtl ? 'right' : 'left')}
            className="w-7 h-7 rounded-full bg-[#0E0E17] hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-black text-amber-300 border border-amber-400/40 hover:border-amber-300 flex items-center justify-center shrink-0 shadow-md transition-all z-10 active:scale-95"
            title={isRtl ? 'تمرير الفئات لليمين (البداية)' : 'Scroll Left (Start)'}
          >
            {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Scrollable Category Pills Track */}
          <div
            ref={categoryTrackRef}
            onWheel={handleCatWheel}
            onMouseDown={handleCatMouseDown}
            onMouseMove={handleCatMouseMove}
            onMouseUp={handleCatMouseUp}
            onMouseLeave={handleCatMouseUp}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 cursor-grab active:cursor-grabbing select-none"
          >
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                categoryFilter === 'ALL'
                  ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{isRtl ? `كل الثيمات (${themes.length} ثيماً)` : `All ${themes.length} Themes`}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {themes.length}
              </span>
            </button>

            {uniqueCategories.map((cat) => {
              const activeCat = categoryFilter === cat.en;
              const isAvantGarde = cat.en === 'Avant-Garde & Tech';
              return (
                <button
                  key={cat.en}
                  type="button"
                  onClick={() => setCategoryFilter(cat.en)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeCat
                      ? isAvantGarde
                        ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 text-black border-purple-300 shadow-md shadow-purple-500/30 font-black'
                        : 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/20'
                      : isAvantGarde
                      ? 'bg-purple-950/30 text-purple-200 border-purple-500/30 hover:border-purple-400/60'
                      : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isAvantGarde && <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />}
                  <span>{isRtl ? cat.ar : cat.en}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Toward End (Left in RTL, Right in LTR) */}
          <button
            type="button"
            onClick={() => scrollCategoryTrack(isRtl ? 'left' : 'right')}
            className="w-7 h-7 rounded-full bg-[#0E0E17] hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-black text-amber-300 border border-amber-400/40 hover:border-amber-300 flex items-center justify-center shrink-0 shadow-md transition-all z-10 active:scale-95"
            title={isRtl ? 'تمرير الفئات لليسار (المزيد)' : 'Scroll Right (More)'}
          >
            {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ====================================================================
          MAIN HORIZONTAL SNAP CAROUSEL TRACK (LEFT & RIGHT SCROLL)
      ==================================================================== */}
      <div className="relative group/carousel">
        {/* Floating Side Arrow Buttons on Hover */}
        {rowsMode !== 'grid' && (
          <>
            <button
              type="button"
              onClick={() => handleScrollBy('prev')}
              aria-label="Scroll Previous"
              className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 ${
                isRtl ? '-right-3' : '-left-3'
              } z-20 w-11 h-11 rounded-full bg-black/90 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.9)] items-center justify-center transition-all hover:scale-110`}
            >
              {isRtl ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleScrollBy('next')}
              aria-label="Scroll Next"
              className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 ${
                isRtl ? '-left-3' : '-right-3'
              } z-20 w-11 h-11 rounded-full bg-black/90 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.9)] items-center justify-center transition-all hover:scale-110`}
            >
              {isRtl ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </>
        )}

        {/* Horizontal Scrollable Grid Track or Full Grid */}
        <div
          ref={scrollContainerRef}
          className={
            rowsMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-2'
              : `grid grid-flow-col ${
                  rowsMode === 2
                    ? 'grid-rows-2 auto-cols-[265px] sm:auto-cols-[288px]'
                    : 'grid-rows-1 auto-cols-[285px] sm:auto-cols-[315px]'
                } gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 px-1 custom-horizontal-scrollbar`
          }
        >
          {visibleThemes.map((th, idx) => {
            const sourceList = allThemesForIndex || themes;
            const globalIdx = sourceList.findIndex((x) => x.id === th.id);
            return (
              <div
                key={th.id}
                ref={(el) => {
                  cardRefs.current[th.id] = el;
                }}
                className={rowsMode === 'grid' ? '' : 'snap-start'}
              >
                <LuxuryThemeShowroomCard
                  theme={th}
                  index={globalIdx >= 0 ? globalIdx : idx}
                  isSelected={selectedThemeId === th.id}
                  isRtl={isRtl}
                  compact={rowsMode === 2}
                  onSelect={(id) => onSelect(id, th)}
                  onQuickInspect={onQuickInspect}
                  isDefaultTheme={defaultThemeId ? defaultThemeId === th.id : false}
                  isDisabledTheme={disabledThemeIds.includes(th.id)}
                  onToggleDisable={onToggleDisable}
                  onSetDefault={onSetDefault}
                  badge={themeBadges?.[th.id]}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          BOTTOM QUICK-JUMP FILMSTRIP DOCK & ACTIVE THEME STEPPER
      ==================================================================== */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Quick Orb Filmstrip for Instant Jump to Any of the 20 Themes */}
        <div className="w-full sm:flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {visibleThemes.map((th, i) => {
            const isSelected = selectedThemeId === th.id;
            const sourceList = allThemesForIndex || themes;
            const globalIdx = sourceList.findIndex((x) => x.id === th.id);
            const numLabel = String((globalIdx >= 0 ? globalIdx : i) + 1).padStart(2, '0');
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => scrollToThemeCard(th)}
                title={isRtl ? th.nameAr : th.nameEn}
                className={`h-8 px-2.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 text-amber-200 scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/70 shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${th.accentColor}, ${th.glowColor})`,
                  }}
                />
                <span className="font-mono text-[9px] text-amber-400/90">#{numLabel}</span>
                <span className="max-w-[90px] truncate">
                  {isRtl ? th.nameAr : th.nameEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Theme Prev/Next Quick Cycle */}
        {activeThemeObj && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleStepTheme('prev')}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-extrabold text-zinc-200 whitespace-nowrap"
            >
              {isRtl ? 'الثيم السابق' : 'Prev Theme'}
            </button>
            <span className="text-[11px] font-mono font-bold text-amber-300 whitespace-nowrap">
              {activeThemeIndex + 1} / {visibleThemes.length}
            </span>
            <button
              type="button"
              onClick={() => handleStepTheme('next')}
              className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-400 hover:text-black border border-amber-400/40 text-[11px] font-extrabold text-amber-200 transition-all whitespace-nowrap"
            >
              {isRtl ? 'الثيم التالي' : 'Next Theme'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

