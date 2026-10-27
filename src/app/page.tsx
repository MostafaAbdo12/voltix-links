'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Crown,
  Layers,
  BarChart3,
  QrCode,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  ChevronDown,
  Wand2,
  Smartphone,
  CheckCircle2,
  Eye,
  Zap,
  Settings,
  Megaphone,
  Mail,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  AURA_THEMES,
  ThemeConfig,
  DEFAULT_EFFECTS_CONFIG,
  PROFILE_LAYOUTS,
  ProfileLayoutType,
} from '@/lib/themes';
import { getCatalogThemes } from '@/lib/theme-store';
import {
  SOCIAL_PLATFORMS,
  OfficialSocialBadge,
} from '@/lib/social-platforms';
import {
  DEFAULT_SITE_CONFIG,
  ExtendedSiteConfig,
  BANNER_THEME_STYLES,
} from '@/lib/site-config';
import { ProfileRenderer, ProfileData } from '@/components/profile/ProfileRenderer';
import {
  LuxuryThemeShowroomCard,
  HorizontalThemeShowroomCarousel,
} from '@/components/profile/LuxuryThemeShowroomCard';

export default function LandingPage() {
  const { locale, toggleLocale, t } = useLanguage();
  const isRtl = locale === 'ar';

  const [siteConfig, setSiteConfig] = useState<ExtendedSiteConfig>(DEFAULT_SITE_CONFIG);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('obsidian-luxury');
  const [selectedLayout, setSelectedLayout] = useState<ProfileLayoutType>('centered');
  const [themeCategoryFilter, setThemeCategoryFilter] = useState<string>('ALL');
  const [inspectedThemeModal, setInspectedThemeModal] = useState<ThemeConfig | null>(null);
  const [claimUsername, setClaimUsername] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mountedHost, setMountedHost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMountedHost(window.location.host);
    }
  }, []);

  const liveDomainPrefix = mountedHost ? `${mountedHost}/@` : (siteConfig.claimDomainPrefix || '/@');

  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.siteConfig) {
          setSiteConfig(data.siteConfig);
          if (data.siteConfig.defaultThemeId) {
            setSelectedThemeId(data.siteConfig.defaultThemeId);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Showcase the live catalog (free + paid); retired themes are not advertised
  const enabledThemes = getCatalogThemes().filter(
    (th) => !siteConfig.disabledThemes.includes(th.id)
  );
  const activeTheme = {
    ...(enabledThemes.find((th) => th.id === selectedThemeId) ||
      enabledThemes[0] ||
      AURA_THEMES[0]),
    profileLayout: selectedLayout,
  };

  const activeOfficialSocials = siteConfig.officialSocials.filter((s) => s.isActive);
  const topBarBanners = siteConfig.banners.filter(
    (b) => b.isActive && b.position === 'top_bar'
  );
  const heroShowcaseBanners = siteConfig.banners.filter(
    (b) => b.isActive && b.position === 'hero_showcase'
  );

  // Build dynamic Hero 3D Phone Profile from siteConfig
  const dynamicHeroProfile: ProfileData = {
    username: siteConfig.heroPhone.username || 'sultan',
    displayName:
      siteConfig.heroPhone.displayName || 'سلطان العتيبي | VoltiX Director',
    bio:
      siteConfig.heroPhone.bio ||
      'مصمم تجارب رقمية ثلاثية الأبعاد ومؤسس استوديو الفخامة البصرية ✨',
    avatarUrl: siteConfig.heroPhone.avatarUrl || undefined,
    coverUrl: siteConfig.heroPhone.coverUrl || undefined,
    isVerified: true,
    locale,
    mediaEmbed: {
      enabled: true,
      type: 'spotify',
      title: 'Obsidian Horizon (Original Mix)',
      artist: 'VoltiX Sound Lab',
      url: 'https://open.spotify.com',
    },
    socialLinks: activeOfficialSocials.slice(0, 8).map((s) => ({
      id: s.id,
      platform: s.platform,
      url: s.url,
    })),
    links: activeOfficialSocials.slice(0, 4).map((s, idx) => ({
      id: `hero-link-${s.id}`,
      title: isRtl ? s.labelAr : s.labelEn,
      url: s.url,
      description:
        idx === 0
          ? isRtl
            ? 'تابع أحدث الإعلانات والتحديثات الحصرية فور صدورها'
            : 'Follow our latest official announcements & exclusive drops'
          : isRtl
          ? 'انضم الآن وتواصل مع مجتمعنا الرسمي مباشرة'
          : 'Join now and connect directly with our official community',
      icon: 'Sparkles',
      cardType: idx === 0 ? 'spotlight' : idx === 1 ? 'animated_border' : 'glass',
      isFeatured: idx === 0,
      badgeText: s.handleOrBadge,
    })),
  };

  return (
    <div className="relative min-h-screen bg-[#040407] text-white overflow-x-clip">
      {/* ====================================================================
          ARCHITECTURAL AURORA & CYBER GRID AMBIENT STAGE
      ==================================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 cyber-grid-floor opacity-70" />
        <div className="absolute -top-56 -left-56 w-[650px] h-[650px] rounded-full bg-amber-500/15 blur-[150px] animate-aurora-flow" />
        <div className="absolute top-1/4 -right-56 w-[650px] h-[650px] rounded-full bg-purple-600/15 blur-[160px] animate-aurora-flow" />
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] rounded-full bg-cyan-500/12 blur-[150px] animate-aurora-flow" />
      </div>

      {/* ====================================================================
          DYNAMIC TOP ANNOUNCEMENT BANNERS (FROM MAIN SITE CMS)
      ==================================================================== */}
      {topBarBanners.length > 0 && (
        <div className="relative z-40 border-b border-amber-500/30">
          {topBarBanners.map((banner) => {
            const st =
              BANNER_THEME_STYLES[banner.themeStyle] || BANNER_THEME_STYLES.royal_gold;
            return (
              <div
                key={banner.id}
                style={{ background: st.gradient }}
                className="px-4 py-2.5 sm:py-3"
              >
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      style={{ background: st.badgeBg }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-black uppercase tracking-wider shrink-0"
                    >
                      {isRtl ? banner.badgeAr : banner.badgeEn}
                    </span>
                    <span className="font-extrabold text-white">
                      {isRtl ? banner.titleAr : banner.titleEn}
                    </span>
                    {(banner.subtitleAr || banner.subtitleEn) && (
                      <span className="hidden md:inline text-zinc-300/85">
                        — {isRtl ? banner.subtitleAr : banner.subtitleEn}
                      </span>
                    )}
                  </div>

                  {banner.buttonUrl && (
                    <a
                      href={banner.buttonUrl}
                      target={banner.buttonUrl.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{ background: st.badgeBg }}
                      className="px-3.5 py-1 rounded-full text-black font-black text-[11px] flex items-center gap-1 hover:scale-105 transition-transform shrink-0"
                    >
                      <span>{isRtl ? banner.buttonTextAr : banner.buttonTextEn}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          ULTRA-LUXURY ROYAL OBSIDIAN & 24K GOLD SPATIAL COMMAND NAVBAR
      ==================================================================== */}
      <div className="sticky top-4 z-40 px-3 sm:px-6 mt-3">
        <header className="relative max-w-[1440px] mx-auto rounded-full bg-[#06060C]/90 backdrop-blur-2xl border border-amber-400/35 px-3.5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between gap-3 shadow-[0_24px_70px_-12px_rgba(0,0,0,0.95),0_0_40px_-15px_rgba(212,175,55,0.32)]">
          {/* Top & Bottom Specular Gold Light Reflections */}
          <span className="pointer-events-none absolute inset-x-16 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/85 to-transparent" />
          <span className="pointer-events-none absolute inset-x-28 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />

          {/* Brand Emblem & Royal Crest */}
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-black to-black border border-amber-400/55 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.35)] group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                <img
                  src={siteConfig.logoUrl || '/voltix-logo.png'}
                  alt={`${siteConfig.siteName} Official Logo`}
                  className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.65)]"
                />
              </div>
              <div dir="ltr" className="text-left flex flex-col justify-center shrink-0">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xl sm:text-[22px] font-black tracking-wide gold-gradient-text leading-none py-0 whitespace-nowrap">
                    {siteConfig.siteName || 'VoltiX'}
                  </span>
                  {siteConfig.logoBadge && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/25 to-amber-600/15 border border-amber-400/50 text-[9px] font-black text-amber-200 uppercase tracking-widest leading-none whitespace-nowrap">
                      {siteConfig.logoBadge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-400 tracking-[0.16em] uppercase block mt-1 leading-none whitespace-nowrap">
                  {siteConfig.logoSubtext || 'SPATIAL IDENTITY OS'}
                </span>
              </div>
            </Link>

            <span className="hidden xl:block h-8 w-[1px] bg-gradient-to-b from-transparent via-white/15 to-transparent mx-1" />
          </div>

          {/* Center Recessed Glass Navigation Track */}
          <nav className="hidden lg:flex items-center p-1.5 rounded-full bg-black/75 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)] gap-0.5 xl:gap-1 shrink-0">
            {[
              {
                href: '#socials',
                labelAr: 'قنواتنا ومنصاتنا',
                labelEn: 'Official Channels',
                dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
              },
              {
                href: '#themes',
                labelAr: `مكتبة الثيمات (${enabledThemes.length})`,
                labelEn: `${enabledThemes.length} Themes`,
                dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
              },
              {
                href: '#features',
                labelAr: 'الهندسة البصرية',
                labelEn: 'Architecture',
              },
              {
                href: '#creators',
                labelAr: 'نخبة المبدعين',
                labelEn: 'VIP Creators',
              },
              {
                href: '#faq',
                labelAr: 'الأسئلة الشائعة',
                labelEn: 'FAQ',
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-2.5 xl:px-3.5 py-2 rounded-full text-[11px] xl:text-xs font-extrabold text-zinc-200 hover:text-amber-200 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-amber-500/5 border border-transparent hover:border-amber-400/35 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {item.dot && (
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
                )}
                <span className="whitespace-nowrap">{isRtl ? item.labelAr : item.labelEn}</span>
              </a>
            ))}
          </nav>

          {/* Right/Left Action Command Dock (Strictly Single-Line Pills) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLocale}
              className="h-10 px-3 rounded-full bg-white/[0.04] hover:bg-white/12 border border-white/15 text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">{locale === 'ar' ? 'EN' : 'العربية'}</span>
            </button>

            <Link
              href="/login"
              className="h-10 px-4 rounded-full bg-white/[0.05] hover:bg-white/12 border border-white/15 hover:border-amber-400/40 text-xs font-extrabold text-zinc-100 flex items-center justify-center transition-all whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">{t.login}</span>
            </Link>

            {siteConfig.allowRegistrations && (
              <Link
                href="/register"
                className="h-10 px-5 rounded-full bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs shadow-[0_10px_28px_-6px_rgba(212,175,55,0.6),inset_0_1px_1px_rgba(255,255,255,0.75)] hover:scale-[1.03] hover:brightness-110 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t.signup}</span>
              </Link>
            )}
          </div>
        </header>
      </div>

      {/* ====================================================================
          CINEMATIC HERO SECTION WITH ORBITING OFFICIAL SOCIAL ORBS & 3D PHONE
      ==================================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center">
          {/* Left Column: Monumental Typography & VIP Handle Claim */}
          <div className="lg:col-span-7 space-y-7 sm:space-y-8 text-start">
            {/* 1. VIP Royal Crest Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-[#0D0912] to-amber-950/30 text-amber-300 text-xs font-black shadow-[0_0_25px_rgba(212,175,55,0.22),inset_0_1px_1px_rgba(255,255,255,0.2)] tracking-wide"
            >
              <Crown className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse" />
              <span className="font-sans font-bold">{isRtl ? siteConfig.heroBadgeAr : siteConfig.heroBadgeEn}</span>
            </motion.div>

            {/* 2. Monumental Liquid Gold Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl sm:text-6xl lg:text-[62px] font-black tracking-tight leading-[1.26] sm:leading-[1.22]"
            >
              <span className="block text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
                {isRtl ? siteConfig.heroTitle1Ar : siteConfig.heroTitle1En}
              </span>
              <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-[#FFFBEB] via-[#FDE68A] via-[#D4AF37] to-[#F59E0B] bg-clip-text text-transparent drop-shadow-[0_6px_35px_rgba(212,175,55,0.45)]">
                {isRtl ? siteConfig.heroTitle2Ar : siteConfig.heroTitle2En}
              </span>
            </motion.h1>

            {/* 3. Refined Editorial Subtitle with VIP Highlights */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-base sm:text-lg text-zinc-300/90 max-w-2xl leading-[1.9] sm:leading-[2.1] font-normal"
            >
              {isRtl ? (
                <>
                  منصة <span className="font-black text-amber-300 font-mono tracking-wide px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30">VoltiX</span> تجمع حساباتك، قنواتك الرسمية (واتساب، تيليغرام، ديسكورد، فيسبوك)، وأعمالك في تحفة بصرية تفاعلية مع <span className="text-white font-bold">20 ثيمًا سينمائيًا</span> وتقنيات <span className="text-white font-bold">الزجاج السائل ثلاثي الأبعاد</span>.
                </>
              ) : (
                siteConfig.heroSubtitleEn
              )}
            </motion.p>

            {/* 4. VIP Black Card Handle Claim Box (Rock-Solid Non-Wrapping Architecture) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="relative p-2 sm:p-2.5 rounded-[26px] bg-gradient-to-b from-[#140F18]/95 via-[#0A070E]/95 to-[#040205]/98 border border-amber-500/35 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.18),inset_0_1px_2px_rgba(255,255,255,0.15)] max-w-xl group"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                {/* Clean Recessed Input Track */}
                <div
                  className="flex items-center px-4 py-3 sm:py-3.5 flex-1 min-w-0 bg-black/60 rounded-[18px] sm:rounded-2xl border border-white/10 group-focus-within:border-amber-400/50 shadow-inner transition-colors"
                  dir="ltr"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 mr-2.5 shrink-0 animate-pulse" />
                  <span className="text-zinc-400 font-mono font-bold text-xs sm:text-sm select-none shrink-0 truncate max-w-[150px] sm:max-w-[210px]">
                    {liveDomainPrefix}
                  </span>
                  <input
                    type="text"
                    value={claimUsername}
                    onChange={(e) =>
                      setClaimUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))
                    }
                    placeholder="yourname"
                    className="bg-transparent text-amber-300 font-mono font-black text-sm sm:text-base focus:outline-none flex-1 min-w-0 placeholder:text-zinc-600 placeholder:font-normal"
                  />
                </div>

                {/* Royal Gold Masterpiece Button - Strictly Single-Line */}
                <Link
                  href={claimUsername ? `/register?username=${claimUsername}` : '/register'}
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-[18px] sm:rounded-2xl bg-gradient-to-r from-[#FFF0B3] via-[#E5BF5A] to-[#B88A28] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(212,175,55,0.45),inset_0_1px_2px_rgba(255,255,255,0.85)] hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="whitespace-nowrap">{isRtl ? siteConfig.ctaPrimaryAr : siteConfig.ctaPrimaryEn}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5] shrink-0" />
                </Link>
              </div>
            </motion.div>

            {/* 5. Cohesive Official Channels Spatial Glass Dock */}
            <div className="pt-2 space-y-2.5 max-w-xl">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>
                    {isRtl
                      ? 'قنواتنا ومنصاتنا الرسمية المعتمدة:'
                      : 'Connect with our official verified channels:'}
                  </span>
                </div>
                <a
                  href="#socials"
                  className="text-[11px] font-black text-amber-300 hover:text-white transition-colors flex items-center gap-1 group/all"
                >
                  <span>{isRtl ? 'عرض الكل' : 'View all'}</span>
                  <ArrowUpRight className="w-3 h-3 group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              <div className="p-2 sm:p-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-xl flex flex-wrap items-center gap-2 sm:gap-2.5 shadow-lg">
                {activeOfficialSocials.slice(0, 10).map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isRtl ? soc.labelAr : soc.labelEn}
                    className="transition-transform hover:scale-115 hover:-translate-y-0.5"
                  >
                    <OfficialSocialBadge
                      platformId={soc.platform}
                      size="sm"
                      variant="gradient"
                    />
                  </a>
                ))}
                <div className="h-6 w-px bg-white/15 mx-1 hidden sm:block" />
                <a
                  href="#socials"
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-extrabold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5"
                >
                  <span>{isRtl ? 'جميع القنوات' : 'All Channels'}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                    +{activeOfficialSocials.length}
                  </span>
                </a>
              </div>
            </div>

            {/* 6. Live Profiles Quick Bar with Correct BiDi & VIP Emblem */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="font-bold text-zinc-400">
                {isRtl ? 'استعرض الهوية الحية للمنصة:' : 'Live Official Profile:'}
              </span>
              <Link
                href="/@voltix"
                className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 hover:from-amber-500/25 hover:to-amber-500/25 border border-amber-500/40 text-amber-200 font-extrabold transition-all shadow-[0_0_20px_rgba(212,175,55,0.18)] hover:scale-105"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span dir="ltr" className="font-mono font-black text-amber-300 tracking-wider">
                  @voltix
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span className="text-[10.5px] text-amber-300/80 font-normal">
                  {isRtl ? 'الهوية الملكية الموثقة' : 'Verified VIP Profile'}
                </span>
                <ArrowUpRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive 3D Titanium Phone Studio + Orbiting Social Orbs */}
          <div className="lg:col-span-5 flex flex-col items-center relative">
            {/* Floating Decorative Official Social Orbs around the Phone */}
            <div className="hidden sm:block pointer-events-none absolute -left-6 top-16 z-20 animate-float-slow">
              <OfficialSocialBadge platformId="whatsapp" size="md" variant="gradient" />
            </div>
            <div className="hidden sm:block pointer-events-none absolute -right-5 top-28 z-20 animate-float-medium">
              <OfficialSocialBadge platformId="telegram" size="md" variant="gradient" />
            </div>
            <div className="hidden sm:block pointer-events-none absolute -left-8 bottom-44 z-20 animate-float-medium">
              <OfficialSocialBadge platformId="discord" size="md" variant="gradient" />
            </div>
            <div className="hidden sm:block pointer-events-none absolute -right-6 bottom-36 z-20 animate-float-slow">
              <OfficialSocialBadge platformId="facebook" size="md" variant="gradient" />
            </div>

            <div className="mb-3 text-center">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-200 vip-black-card px-4 py-1.5 rounded-full">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                {t.livePhoneTitle}
              </span>
            </div>

            {/* Titanium Bezel */}
            <div className="relative w-full max-w-[365px] h-[680px] rounded-[54px] p-3 bg-gradient-to-b from-zinc-600 via-zinc-900 to-black border-2 border-amber-500/30 shadow-[0_30px_100px_-15px_rgba(212,175,55,0.4)]">
              {/* Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 w-28 h-6 bg-black rounded-full border border-white/15 flex items-center justify-between px-3">
                <span className="text-[8px] font-black tracking-widest text-amber-400">
                  {(siteConfig.siteName || 'VOLTIX').toUpperCase()}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Screen Viewport */}
              <div className="w-full h-full rounded-[42px] overflow-y-auto overflow-x-hidden no-scrollbar bg-[#040407]">
                <ProfileRenderer
                  profile={dynamicHeroProfile}
                  theme={activeTheme}
                  effects={DEFAULT_EFFECTS_CONFIG}
                  isPreview={true}
                  compactPhone={true}
                />
              </div>
            </div>

            {/* Interactive Theme Switcher Dock under Phone */}
            <div className="mt-5 p-2.5 rounded-3xl spatial-dock flex flex-wrap items-center justify-center gap-1.5 max-w-md">
              {enabledThemes.slice(0, 8).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSelectedThemeId(th.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                    selectedThemeId === th.id
                      ? 'bg-amber-400 text-black border-amber-300 scale-105 shadow-lg shadow-amber-500/30'
                      : 'bg-black/40 text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/50"
                    style={{ backgroundColor: th.accentColor }}
                  />
                  <span>{isRtl ? th.nameAr : th.nameEn}</span>
                </button>
              ))}
            </div>

            {/* Layout Switcher Pills */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
              {PROFILE_LAYOUTS.slice(0, 4).map((ly) => (
                <button
                  key={ly.id}
                  type="button"
                  onClick={() => setSelectedLayout(ly.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    selectedLayout === ly.id
                      ? 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  {isRtl ? ly.nameAr : ly.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          WIDE HERO SHOWCASE PROMOTIONAL BANNERS (FROM MAIN SITE CMS)
      ==================================================================== */}
      {heroShowcaseBanners.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-5">
          {heroShowcaseBanners.map((banner) => {
            const st =
              BANNER_THEME_STYLES[banner.themeStyle] || BANNER_THEME_STYLES.royal_gold;
            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  background: st.gradient,
                  borderColor: st.border,
                }}
                className="rounded-[34px] p-6 sm:p-9 border-2 shadow-[0_25px_80px_rgba(0,0,0,0.75)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
                  {banner.imageUrl ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-black/70 border border-amber-400/40 p-2 shrink-0 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                      <img
                        src={banner.imageUrl}
                        alt={banner.titleAr}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-3xl bg-black/60 border border-white/20 flex items-center justify-center shrink-0">
                      <Megaphone className="w-7 h-7 text-amber-300" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <span
                      style={{ background: st.badgeBg }}
                      className="inline-block px-3.5 py-1 rounded-full text-[10px] font-black text-black uppercase tracking-wider"
                    >
                      {isRtl ? banner.badgeAr : banner.badgeEn}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      {isRtl ? banner.titleAr : banner.titleEn}
                    </h3>
                    {(banner.subtitleAr || banner.subtitleEn) && (
                      <p className="text-xs sm:text-sm text-zinc-200/90 leading-relaxed">
                        {isRtl ? banner.subtitleAr : banner.subtitleEn}
                      </p>
                    )}
                  </div>
                </div>

                {banner.buttonUrl && (
                  <a
                    href={banner.buttonUrl}
                    target={banner.buttonUrl.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ background: st.badgeBg }}
                    className="px-7 py-4 rounded-2xl text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-transform shrink-0"
                  >
                    <span>{isRtl ? banner.buttonTextAr : banner.buttonTextEn}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </section>
      )}

      {/* ====================================================================
          OFFICIAL SOCIAL MEDIA & COMMUNITY CHANNELS ECOSYSTEM
      ==================================================================== */}
      <section
        id="socials"
        className="relative z-10 py-24 sm:py-28 border-t border-white/10 bg-black/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span
              dir="ltr"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-extrabold uppercase tracking-[0.15em] text-amber-300"
            >
              <Zap className="w-3.5 h-3.5" />
              OFFICIAL SOCIAL MEDIA & CHANNELS ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black leading-[1.4]">
              {isRtl
                ? 'جميع قنواتنا ومنصاتك الرسمية بأيقوناتها وتدرجاتها الأصلية'
                : 'Every Official Channel & Platform. Authentic Brand Aesthetics.'}
            </h2>
            <p className="text-zinc-300/85 text-sm sm:text-base leading-[1.85] max-w-2xl mx-auto">
              {isRtl
                ? 'انقر على أي منصة للتواصل معنا أو الانضمام إلى قنوات الموقع الرسمية، أو اربط حساباتك وقنواتك بنفس التصميم داخل صفحتك'
                : 'Click any emblem to visit our official channels, or integrate all 14 official platforms with 3D specular glass on your own VoltiX hub.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {(activeOfficialSocials.length > 0
              ? activeOfficialSocials
              : SOCIAL_PLATFORMS.map((p) => ({
                  id: p.id,
                  platform: p.id,
                  labelAr: p.nameAr,
                  labelEn: p.name,
                  handleOrBadge: p.domains[0],
                  url: `https://${p.domains[0]}`,
                  isActive: true,
                }))
            ).map((soc) => {
              const plat =
                SOCIAL_PLATFORMS.find((p) => p.id === soc.platform) || SOCIAL_PLATFORMS[0];
              return (
                <motion.a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="liquid-glass rounded-3xl p-5 flex flex-col items-center text-center gap-3.5 group hover:border-amber-400/50 transition-all"
                >
                  <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <OfficialSocialBadge
                      platformId={soc.platform}
                      size="lg"
                      variant="gradient"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-extrabold text-white leading-snug group-hover:text-amber-200 transition-colors">
                      {isRtl ? soc.labelAr || plat.nameAr : soc.labelEn || plat.name}
                    </div>
                    <div
                      className="text-[11px] font-mono font-bold opacity-85 leading-none"
                      style={{ color: plat.color }}
                      dir="ltr"
                    >
                      {soc.handleOrBadge || plat.domains[0]}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          20 SIGNATURE THEMES INTERACTIVE LIVE SHOWROOM VAULT
      ==================================================================== */}
      <section id="themes" className="relative z-10 py-24 sm:py-28 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <span
              dir="ltr"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-300"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              THEME ENGINE 2.5 • {enabledThemes.length} LIVE ARCHITECTURAL WORLDS
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-black leading-[1.4]">
              {t.themesShowcaseTitle}
            </h2>
            <p className="text-zinc-300/85 text-sm sm:text-base leading-[1.85] max-w-2xl mx-auto">
              {isRtl
                ? 'استكشف 20 عالمًا بصريًا بمعاينة حية مصغرة داخل كل بطاقة، وانقر على أي ثيم لتجربته فورًا على الهاتف التفاعلي الحي بجانبك دون مغادرة مكانك!'
                : 'Explore 20 bespoke visual worlds with live miniature viewports inside every card, and click any theme to test it immediately on the interactive showroom phone beside you!'}
            </p>
          </div>

          {/* Split-Screen Showroom: Horizontal Left/Right Theme Carousel + Live 3D Showroom Phone */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main 8 Cols: Horizontal Left & Right Scroll Showroom Deck */}
            <div className="lg:col-span-8 min-w-0">
              <HorizontalThemeShowroomCarousel
                themes={enabledThemes}
                allThemesForIndex={AURA_THEMES}
                selectedThemeId={selectedThemeId}
                isRtl={isRtl}
                defaultRows={2}
                onSelect={(id, th) => {
                  setSelectedThemeId(id);
                  setSelectedLayout(th.profileLayout);
                }}
                onQuickInspect={(themeObj) => {
                  setSelectedThemeId(themeObj.id);
                  setSelectedLayout(themeObj.profileLayout);
                  setInspectedThemeModal(themeObj);
                }}
              />
            </div>

            {/* Right 4 Cols: Sticky Live 3D Showroom Phone & Theme DNA Inspector */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
              <div className="rounded-[34px] vip-black-card border border-amber-400/45 p-5 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] space-y-4">
                {/* Active Theme Specs Header */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                        {isRtl ? 'المعاينة الحية الفورية للثيم' : 'LIVE THEME SHOWROOM'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      {isRtl ? activeTheme.nameAr : activeTheme.nameEn}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedThemeModal(activeTheme)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 hover:text-black border border-amber-400/50 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تكبير' : 'Expand'}</span>
                  </button>
                </div>

                {/* Theme DNA Specs Pills */}
                <div className="grid grid-cols-3 gap-2 text-center" dir="ltr">
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                    <div className="text-[9px] text-zinc-400 uppercase">CARD STYLE</div>
                    <div className="text-[11px] font-black text-amber-300 uppercase truncate">
                      {activeTheme.defaultCardType}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                    <div className="text-[9px] text-zinc-400 uppercase">LAYOUT</div>
                    <div className="text-[11px] font-black text-white uppercase truncate">
                      {selectedLayout}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                    <div className="text-[9px] text-zinc-400 uppercase">SHADER</div>
                    <div className="text-[11px] font-black text-cyan-300 uppercase truncate">
                      {activeTheme.animatedBgType}
                    </div>
                  </div>
                </div>

                {/* Interactive Showroom Titanium Phone Viewport */}
                <div className="relative mx-auto w-full max-w-[335px] h-[560px] rounded-[46px] p-2.5 bg-gradient-to-b from-zinc-600 via-zinc-900 to-black border-2 border-amber-400/40 shadow-[0_20px_70px_-10px_rgba(212,175,55,0.35)]">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full border border-white/15 flex items-center justify-between px-2.5">
                    <span className="text-[7px] font-black tracking-widest text-amber-400">
                      VOLTIX
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="w-full h-full rounded-[36px] overflow-y-auto overflow-x-hidden no-scrollbar bg-[#040407]">
                    <ProfileRenderer
                      profile={dynamicHeroProfile}
                      theme={activeTheme}
                      effects={DEFAULT_EFFECTS_CONFIG}
                      isPreview={true}
                      compactPhone={true}
                    />
                  </div>
                </div>

                {/* Quick Layout Switcher inside Showroom */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {PROFILE_LAYOUTS.slice(0, 5).map((ly) => (
                    <button
                      key={ly.id}
                      type="button"
                      onClick={() => setSelectedLayout(ly.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all ${
                        selectedLayout === ly.id
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-black/50 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {isRtl ? ly.nameAr : ly.nameEn}
                    </button>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 hover:scale-[1.01] transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? `ابدأ صفحتك بثيم «${activeTheme.nameAr}» الآن`
                      : `Start with "${activeTheme.nameEn}" Theme`}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Interactive Theme Inspector Modal */}
        {inspectedThemeModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setInspectedThemeModal(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[96vw] max-w-[1040px] rounded-[36px] vip-black-card border border-amber-400/50 p-5 sm:p-8 text-white shadow-[0_35px_100px_rgba(0,0,0,0.95)] space-y-5 max-h-[92vh] flex flex-col"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl border border-white/30 flex items-center justify-center font-black text-sm shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${inspectedThemeModal.accentColor}, ${inspectedThemeModal.glowColor})`,
                      color: '#050508',
                    }}
                  >
                    ✦
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                      {isRtl
                        ? inspectedThemeModal.categoryAr
                        : inspectedThemeModal.categoryEn}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black">
                      {isRtl ? inspectedThemeModal.nameAr : inspectedThemeModal.nameEn}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/register"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-black font-black text-xs sm:text-sm"
                  >
                    {isRtl ? 'اعتماد هذا الثيم لصفحتي' : 'Use This Theme'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setInspectedThemeModal(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-extrabold"
                  >
                    {isRtl ? 'إغلاق المعاينة' : 'Close'}
                  </button>
                </div>
              </div>

              <div className="flex-1 rounded-[28px] overflow-y-auto no-scrollbar border border-white/15">
                <ProfileRenderer
                  profile={dynamicHeroProfile}
                  theme={{
                    ...inspectedThemeModal,
                    profileLayout: selectedLayout,
                  }}
                  effects={DEFAULT_EFFECTS_CONFIG}
                  isPreview={true}
                  compactPhone={false}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ====================================================================
          ARCHITECTURAL BENTO GRID FEATURES SECTION
      ==================================================================== */}
      <section id="features" className="relative z-10 py-24 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span
            dir="ltr"
            className="inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-amber-400"
          >
            SPATIAL LUXURY ENGINEERING
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black leading-[1.4]">
            {t.featuresTitle}
          </h2>
          <p className="text-zinc-300/85 text-sm sm:text-base leading-[1.85] max-w-2xl mx-auto">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Wand2,
              title: isRtl ? 'محرك Theme DNA واستخراج الألوان الذكي' : 'Theme DNA & Smart Color Extraction',
              desc: isRtl
                ? 'استخرج ألوان الثيم تلقائيًا من صورتك الشخصية أو ولّد ثيمًا متناغمًا عبر 6 أمزجة بصرية (Luxury, Calm, Gaming, Cinematic).'
                : 'Extract dominant palettes directly from your avatar or synthesize bespoke themes in one click.',
              badge: 'Smart Palette AI',
            },
            {
              icon: Sparkles,
              title: isRtl ? 'استوديو التأثيرات (Effects Studio)' : 'Interactive Effects Studio',
              desc: isRtl
                ? '17 مؤثرًا بصريًا تشمل إضاءة الشفق القطبي، الجسيمات العائمة، إمالة البطاقات ثلاثية الأبعاد، والأزرار المغناطيسية.'
                : 'Fine-tune 17 motion shaders including Aurora Borealis, 3D perspective tilt, magnetic hover, and spotlight beams.',
              badge: '17+ Motion Shaders',
            },
            {
              icon: Layers,
              title: isRtl ? '12 نمطًا لبطاقات الروابط و 7 تخطيطات' : '12 Link Card Styles & 7 Layouts',
              desc: isRtl
                ? 'من بطاقات الزجاج السائل (Liquid Glass) وشبكة البينتو (Bento Grid) إلى البطاقات ذات الحدود الهولوجرامية المتحركة.'
                : 'From Liquid Glass and Bento Grids to Spotlight, 3D, and Animated Holographic Border cards.',
              badge: 'Modular Spatial UI',
            },
            {
              icon: BarChart3,
              title: isRtl ? 'نظام تحليلات حقيقي يراعي الخصوصية' : 'Real-Time Privacy-First Analytics',
              desc: isRtl
                ? 'تتبع الزيارات، الزوار الفريدين، معدل النقر CTR، الدول، الأجهزة، ومصادر الزيارات برسوم بيانية تفاعلية دقيقة.'
                : 'Track page views, unique visitors, CTR%, countries, devices, and traffic sources without invasive cookies.',
              badge: 'Live Telemetry',
            },
            {
              icon: QrCode,
              title: isRtl ? 'بطاقة VoltiX Black Pass ومدير SEO' : 'VoltiX Black Pass QR & SEO Studio',
              desc: isRtl
                ? 'بطاقة هوية رقمية فاخرة برمز QR مخصص بصيغتي PNG و SVG، مع تحكم كامل في بيانات Open Graph ومحركات البحث.'
                : 'Interactive VIP Black Pass with high-res PNG & SVG QR codes, plus custom Open Graph & canonical tags.',
              badge: 'VIP Black Card',
            },
            {
              icon: ShieldCheck,
              title: isRtl ? 'نظام خطوط عربي وإنجليزي متقدم' : 'Bilingual RTL/LTR Typography',
              desc: isRtl
                ? 'تحكم كامل في 10 خطوط احترافية للعربية (Alexandria, Cairo, Tajawal) والإنجليزية (Sora, Space Grotesk, Outfit).'
                : 'Seamless Arabic RTL & English LTR switching with 10 curated editorial and geometric typefaces.',
              badge: '10 Curated Fonts',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="vip-black-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-amber-400/70 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300/25 to-amber-600/15 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      dir="ltr"
                      className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/15 text-amber-200"
                    >
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-[1.45] mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-300/90 leading-[1.82]">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          VIP CREATOR SHOWCASE GALLERY (LINKS TO REAL SEEDED PROFILES)
      ==================================================================== */}
      <section id="creators" className="relative z-10 py-24 sm:py-28 border-t border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span
              dir="ltr"
              className="inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-amber-400"
            >
              VERIFIED VOLTIX IDENTITIES
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black leading-[1.4]">
              {t.showcaseUsersTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/@voltix"
              className="group rounded-3xl p-7 border border-white/15 hover:border-amber-400/60 bg-gradient-to-br from-[#07070C] via-[#171324] to-[#291E10] transition-all flex flex-col justify-between shadow-2xl hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-amber-500/20 border-amber-400/50 text-amber-300">
                    ✦ Obsidian Luxury
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black">سلطان العتيبي | VoltiX Founder</h3>
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <p className="text-xs text-zinc-300 mt-1.5">
                  {isRtl ? 'مؤسس ومصمم تجارب رقمية ثلاثية الأبعاد' : 'Founder & 3D Experience Architect'}
                </p>

                <div className="flex items-center gap-2 mt-5">
                  {(['whatsapp', 'telegram', 'discord', 'instagram', 'youtube'] as const).map((sId) => (
                    <OfficialSocialBadge
                      key={sId}
                      platformId={sId}
                      size="sm"
                      variant="gradient"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-extrabold">
                <span dir="ltr" className="text-zinc-300 font-mono">
                  {liveDomainPrefix}voltix
                </span>
                <span className="text-amber-300">
                  {isRtl ? 'فتح الهوية الحية ←' : 'Open Live Hub →'}
                </span>
              </div>
            </Link>

            <Link
              href="/register"
              className="group rounded-3xl p-7 border border-white/15 hover:border-amber-400/60 bg-gradient-to-br from-[#160B10] via-[#2E1822] to-[#42232E] transition-all flex flex-col justify-between shadow-2xl hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-rose-500/20 border-rose-400/50 text-rose-300">
                    ✨ {isRtl ? 'احجز هويتك الآن' : 'Reserve Your Hub'}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <h3 className="text-xl font-black">{isRtl ? 'هويتك الرقمية الملكية' : 'Your Royal Digital Hub'}</h3>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                  {isRtl
                    ? 'انضم إلى نخبة المبدعين وصناع المحتوى، وخصص هويتك برابط ملكي فريد يعكس تميزك.'
                    : 'Join visionary creators and launch your bespoke link-in-bio hub with signature 3D themes.'}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-extrabold">
                <span dir="ltr" className="text-zinc-300 font-mono">
                  {liveDomainPrefix}yourname
                </span>
                <span className="text-rose-300">
                  {isRtl ? 'تسجيل حساب جديد ←' : 'Claim Now →'}
                </span>
              </div>
            </Link>

            <a
              href="#themes"
              className="group rounded-3xl p-7 border border-white/15 hover:border-amber-400/60 bg-gradient-to-br from-[#070312] via-[#2A0845] to-[#001F3F] transition-all flex flex-col justify-between shadow-2xl hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-cyan-500/20 border-cyan-400/50 text-cyan-300">
                    ⚡ 30+ {isRtl ? 'ثيم ملكي' : 'Signature Themes'}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <h3 className="text-xl font-black">{isRtl ? 'معرض التصاميم الفاخرة' : 'Signature Themes Studio'}</h3>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                  {isRtl
                    ? 'اكتشف حزم تصاميم الزجاج السائل، والأناقة الملكية، والتأثيرات النيون التفاعلية.'
                    : 'Explore liquid glass architecture, obsidian gold, cyberpunk neon, and immersive 3D card physics.'}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-extrabold">
                <span className="text-zinc-300 font-mono">
                  {isRtl ? 'تصفح كافة القوالب' : 'Explore All Themes'}
                </span>
                <span className="text-cyan-300">
                  {isRtl ? 'استعراض الثيمات ↓' : 'View Themes ↓'}
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================
          DYNAMIC FAQ SECTION (FROM MAIN SITE CMS)
      ==================================================================== */}
      <section id="faq" className="relative z-10 py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">{t.faqTitle}</h2>
        <div className="space-y-4">
          {siteConfig.faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.id || idx}
                className="vip-black-card rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-start flex items-center justify-between gap-4 font-bold text-base"
                >
                  <span>{isRtl ? item.questionAr : item.questionEn}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-zinc-300 leading-relaxed border-t border-white/10 pt-4">
                    {isRtl ? item.answerAr : item.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          LUXURY FOOTER WITH OFFICIAL SOCIAL CHANNELS & CONTACT INFO
      ==================================================================== */}
      <footer className="relative z-10 border-t border-white/10 bg-black/85 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-black/80 border border-amber-400/40 p-1 flex items-center justify-center overflow-hidden">
                <img
                  src={siteConfig.logoUrl || '/voltix-logo.png'}
                  alt={`${siteConfig.siteName} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-black text-xl tracking-wider gold-gradient-text block">
                  {siteConfig.siteName || 'VoltiX'}
                </span>
                <span className="text-xs text-zinc-400">
                  {isRtl ? siteConfig.copyrightAr : siteConfig.copyrightEn}
                </span>
              </div>
            </div>

            {/* Official Social Icons Row in Footer */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {activeOfficialSocials.slice(0, 8).map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={isRtl ? soc.labelAr : soc.labelEn}
                  className="transition-transform hover:scale-110"
                >
                  <OfficialSocialBadge
                    platformId={soc.platform}
                    size="sm"
                    variant="gradient"
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex flex-wrap items-center gap-5 font-mono" dir="ltr">
              {siteConfig.contactEmail && (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="hover:text-amber-300 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{siteConfig.contactEmail}</span>
                </a>
              )}
              {siteConfig.contactPhone && (
                <a
                  href={siteConfig.whatsappSupportUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{siteConfig.contactPhone}</span>
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 font-bold">
              <Link href="/login" className="hover:text-amber-300 transition-colors">
                {t.login}
              </Link>
              <Link href="/register" className="hover:text-amber-300 transition-colors">
                {t.signup}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
