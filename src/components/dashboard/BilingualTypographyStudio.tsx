'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Crown,
  Sparkles,
  Type,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  ARABIC_FONTS,
  ENGLISH_FONTS,
  ArabicFontFamily,
  EnglishFontFamily,
  ThemeConfig,
} from '@/lib/themes';

interface BilingualTypographyStudioProps {
  effectiveTheme: ThemeConfig;
  isRtl: boolean;
  displayName?: string;
  customPreviewTextAr?: string;
  setCustomPreviewTextAr?: (val: string) => void;
  customPreviewTextEn?: string;
  setCustomPreviewTextEn?: (val: string) => void;
  onUpdateField: <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => void;
}

const CURATED_FONT_PAIRINGS: {
  id: string;
  titleAr: string;
  titleEn: string;
  ar: ArabicFontFamily;
  en: EnglishFontFamily;
  weight: ThemeConfig['fontWeight'];
}[] = [
  {
    id: 'royal-monument',
    titleAr: 'الفخامة الملكية (الإسكندرية + Cinzel)',
    titleEn: 'Royal Monument (Alexandria + Cinzel)',
    ar: 'Alexandria',
    en: 'Cinzel',
    weight: '700',
  },
  {
    id: 'diwani-couture',
    titleAr: 'الأناقة الديوانية (المسيري + Playfair)',
    titleEn: 'Diwani Couture (El Messiri + Playfair)',
    ar: 'El Messiri',
    en: 'Playfair Display',
    weight: '700',
  },
  {
    id: 'cyber-esports',
    titleAr: 'السايبر والألعاب (تشانجا + Orbitron)',
    titleEn: 'Cyber Esports (Changa + Orbitron)',
    ar: 'Changa',
    en: 'Orbitron',
    weight: '800',
  },
  {
    id: 'kufi-architect',
    titleAr: 'الكوفي المعماري (نوتو كوفي + Syne)',
    titleEn: 'Architectural Kufi (Noto Kufi + Syne)',
    ar: 'Noto Kufi Arabic',
    en: 'Syne',
    weight: '700',
  },
  {
    id: 'executive-clarity',
    titleAr: 'الوضوح التنفيذي (ريدكس برو + Jakarta)',
    titleEn: 'Executive Clarity (Readex Pro + Jakarta)',
    ar: 'Readex Pro',
    en: 'Plus Jakarta Sans',
    weight: '600',
  },
  {
    id: 'classic-literary',
    titleAr: 'الأصالة الكلاسيكية (الأميري + Montserrat)',
    titleEn: 'Classic Heritage (Amiri + Montserrat)',
    ar: 'Amiri',
    en: 'Montserrat',
    weight: '700',
  },
];

export function BilingualTypographyStudio({
  effectiveTheme,
  isRtl,
  displayName,
  customPreviewTextAr: externalAr,
  setCustomPreviewTextAr: setExternalAr,
  customPreviewTextEn: externalEn,
  setCustomPreviewTextEn: setExternalEn,
  onUpdateField,
}: BilingualTypographyStudioProps) {
  const [internalAr, setInternalAr] = useState('');
  const [internalEn, setInternalEn] = useState('');
  const [activeFontTab, setActiveFontTab] = useState<'both' | 'arabic' | 'english'>('both');

  const customPreviewTextAr = externalAr !== undefined ? externalAr : internalAr;
  const setCustomPreviewTextAr = setExternalAr || setInternalAr;
  const customPreviewTextEn = externalEn !== undefined ? externalEn : internalEn;
  const setCustomPreviewTextEn = setExternalEn || setInternalEn;

  const currentArFont =
    ARABIC_FONTS.find((f) => f.id === effectiveTheme.fontFamilyAr) || ARABIC_FONTS[0];
  const currentEnFont =
    ENGLISH_FONTS.find((f) => f.id === effectiveTheme.fontFamilyEn) || ENGLISH_FONTS[0];

  const sizePreviewPx =
    effectiveTheme.fontSize === 'sm'
      ? '15px'
      : effectiveTheme.fontSize === 'lg'
      ? '20px'
      : effectiveTheme.fontSize === 'xl'
      ? '24px'
      : '17px';

  return (
    <div className="p-6 sm:p-7 rounded-3xl vip-black-card border border-amber-400/35 space-y-6 shadow-[0_25px_70px_rgba(0,0,0,0.75)]">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300/25 to-amber-600/15 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                dir="ltr"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300"
              >
                VOLTIX BILINGUAL TYPOGRAPHY LAB • 24 CURATED TYPEFACES
              </span>
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-extrabold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isRtl ? 'المعاينة الحية ثابتة بجانبك ←' : 'Live Preview Pinned Beside You →'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              {isRtl
                ? 'استوديو الخطوط الاحترافي والمعاينة الحية (12 خطًا عربيًا + 12 خطًا إنجليزيًا)'
                : 'Bilingual Typography & Live Font Specimen Studio (24 Curated Fonts)'}
            </h3>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-2xl bg-black/70 border border-white/15 p-1 text-xs font-extrabold">
          {[
            { id: 'both' as const, labelAr: 'العربية والإنجليزية معًا', labelEn: 'Both Languages' },
            { id: 'arabic' as const, labelAr: 'الخطوط العربية (12)', labelEn: 'Arabic (12)' },
            { id: 'english' as const, labelAr: 'الخطوط الإنجليزية (12)', labelEn: 'English (12)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFontTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeFontTab === tab.id
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isRtl ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Interactive Text Tester Bar (Also synced with the Sticky Side Font Preview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/60 border border-amber-400/25">
        <input
          type="text"
          dir="rtl"
          value={customPreviewTextAr}
          onChange={(e) => setCustomPreviewTextAr(e.target.value)}
          placeholder="✍️ اكتب اسمك أو عبارتك بالعربية هنا لمعاينتها حيًا بجانبك وعلى جميع الخطوط..."
          className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/15 focus:border-amber-400 text-xs text-white focus:outline-none"
        />
        <input
          type="text"
          dir="ltr"
          value={customPreviewTextEn}
          onChange={(e) => setCustomPreviewTextEn(e.target.value)}
          placeholder="✍️ Type custom English text here to preview live beside you..."
          className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/15 focus:border-cyan-400 text-xs text-white focus:outline-none"
        />
      </div>

      {/* ====================================================================
          MOBILE-ONLY FALLBACK SPECIMEN STAGE (HIDDEN ON DESKTOP WHERE IT IS STICKY BESIDE FONTS)
      ==================================================================== */}
      <div className="lg:hidden rounded-3xl bg-gradient-to-b from-[#0C0C16] to-[#06060B] border border-amber-400/45 p-5 space-y-4 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 gap-3">
          <div
            dir="rtl"
            className="p-4 rounded-2xl bg-black/75 border border-amber-400/30 space-y-2 text-right"
            style={{
              fontFamily: `"${effectiveTheme.fontFamilyAr}", sans-serif`,
              fontWeight: effectiveTheme.fontWeight,
            }}
          >
            <div className="text-[11px] text-amber-300 font-sans font-bold">
              الخط العربي النشط: {currentArFont.label}
            </div>
            <div className="text-white leading-snug" style={{ fontSize: sizePreviewPx }}>
              {customPreviewTextAr.trim() ||
                displayName ||
                'سلطان العتيبي — استوديو الفخامة الرقمية VoltiX'}
            </div>
          </div>

          <div
            dir="ltr"
            className="p-4 rounded-2xl bg-black/75 border border-cyan-400/30 space-y-2 text-left"
            style={{
              fontFamily: `"${effectiveTheme.fontFamilyEn}", sans-serif`,
              fontWeight: effectiveTheme.fontWeight,
            }}
          >
            <div className="text-[11px] text-cyan-300 font-sans font-bold">
              Active English Font: {currentEnFont.label}
            </div>
            <div className="text-white leading-snug" style={{ fontSize: sizePreviewPx }}>
              {customPreviewTextEn.trim() || 'VOLTIX ROYAL CREST — Spatial Identity OS'}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. 1-CLICK CURATED ROYAL FONT PAIRINGS
      ==================================================================== */}
      <div className="space-y-2.5">
        <div className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span>
            {isRtl
              ? 'توليفات خطوط متناغمة جاهزة (تطبيق الخط العربي والإنجليزي معًا بنقرة واحدة):'
              : '1-Click Curated Bilingual Font Pairings:'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CURATED_FONT_PAIRINGS.map((pair) => {
            const isPairActive =
              effectiveTheme.fontFamilyAr === pair.ar &&
              effectiveTheme.fontFamilyEn === pair.en;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => {
                  onUpdateField('fontFamilyAr', pair.ar);
                  onUpdateField('fontFamilyEn', pair.en);
                  onUpdateField('fontWeight', pair.weight);
                }}
                className={`p-3.5 rounded-2xl border text-start transition-all flex items-center justify-between gap-2 ${
                  isPairActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/15'
                    : 'bg-black/50 border-white/10 text-zinc-300 hover:border-amber-400/40 hover:bg-white/[0.04]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">
                    {isRtl ? pair.titleAr : pair.titleEn}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5" dir="ltr">
                    {pair.ar} + {pair.en}
                  </div>
                </div>
                {isPairActive ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          3. ARABIC FONT SPECIMEN GALLERY (12 ARABIC FONTS)
      ==================================================================== */}
      {(activeFontTab === 'both' || activeFontTab === 'arabic') && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <span>1. اختر الخط العربي (12 خطًا عربيًا احترافيًا بمعاينة حية):</span>
            </h4>
            <span className="text-[11px] text-zinc-400">
              {isRtl ? 'كل بطاقة مرسومة بالخط الفعلي مباشرةً' : 'Rendered in authentic typeface'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" dir="rtl">
            {ARABIC_FONTS.map((font) => {
              const selected = effectiveTheme.fontFamilyAr === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onUpdateField('fontFamilyAr', font.id)}
                  className={`group p-4 rounded-3xl border text-right transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                    selected
                      ? 'bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-black border-amber-400 ring-2 ring-amber-400/40 shadow-[0_16px_40px_-10px_rgba(212,175,55,0.45)] scale-[1.01]'
                      : 'bg-black/60 border-white/10 hover:border-amber-400/45 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Top Header: Font Name + Style Tag */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-[11px] font-sans font-extrabold text-amber-300/95 truncate">
                      {font.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/10 text-[9px] font-sans font-bold text-zinc-300">
                        {isRtl ? font.styleTagAr : font.styleTagEn}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Large Live Specimen Rendered in Exact Arabic Font */}
                  <div
                    className="py-2 px-3 rounded-2xl bg-black/55 border border-white/10 space-y-1 w-full"
                    style={{
                      fontFamily: `"${font.id}", sans-serif`,
                      fontWeight: effectiveTheme.fontWeight,
                    }}
                  >
                    <div className="text-lg sm:text-xl text-white leading-snug">
                      {customPreviewTextAr.trim() || 'أبجد هوز — فخامة الهوية الرقمية'}
                    </div>
                    <div className="text-xs text-zinc-300/85 leading-relaxed line-clamp-1">
                      {font.sample}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          4. ENGLISH FONT SPECIMEN GALLERY (12 ENGLISH FONTS)
      ==================================================================== */}
      {(activeFontTab === 'both' || activeFontTab === 'english') && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-cyan-300 flex items-center gap-2">
              <span>
                {isRtl
                  ? '2. اختر الخط الإنجليزي (12 خطًا عالميًا بمعاينة حية):'
                  : '2. Select English Font Family (12 Curated Typefaces):'}
              </span>
            </h4>
            <span className="text-[11px] text-zinc-400" dir="ltr">
              Live Optical Specimen Preview
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" dir="ltr">
            {ENGLISH_FONTS.map((font) => {
              const selected = effectiveTheme.fontFamilyEn === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onUpdateField('fontFamilyEn', font.id)}
                  className={`group p-4 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                    selected
                      ? 'bg-gradient-to-b from-cyan-500/20 via-amber-500/10 to-black border-amber-400 ring-2 ring-amber-400/40 shadow-[0_16px_40px_-10px_rgba(212,175,55,0.4)] scale-[1.01]'
                      : 'bg-black/60 border-white/10 hover:border-cyan-400/45 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Top Header: Font Name + Style Tag */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs font-sans font-black text-cyan-300 truncate">
                      {font.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/10 text-[9px] font-sans font-bold text-zinc-300">
                        {isRtl ? font.styleTagAr : font.styleTagEn}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Large Live Specimen Rendered in Exact English Font */}
                  <div
                    className="py-2 px-3 rounded-2xl bg-black/55 border border-white/10 space-y-1 w-full"
                    style={{
                      fontFamily: `"${font.id}", sans-serif`,
                      fontWeight: effectiveTheme.fontWeight,
                    }}
                  >
                    <div className="text-base sm:text-lg text-white leading-snug truncate">
                      {customPreviewTextEn.trim() || 'Aa Bb Cc — VoltiX Luxury'}
                    </div>
                    <div className="text-[11px] text-zinc-300/85 leading-relaxed truncate">
                      {font.sample}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          5. VISUAL FONT SIZE & FONT WEIGHT ARCHITECTURAL CONTROLS
      ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4 border-t border-white/10">
        {/* Font Size Selector Pills */}
        <div className="space-y-2.5">
          <label className="block text-xs font-extrabold text-zinc-200">
            {isRtl ? 'حجم الخط البصري (Optical Font Size):' : 'Optical Font Size Scale:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'sm' as const, labelAr: 'صغير أنيق', labelEn: 'Small', scale: 'text-xs' },
              { id: 'md' as const, labelAr: 'متوسط متوازن', labelEn: 'Medium', scale: 'text-sm' },
              { id: 'lg' as const, labelAr: 'كبير تحريري', labelEn: 'Large', scale: 'text-base' },
              { id: 'xl' as const, labelAr: 'ملكي ضخم', labelEn: 'XL', scale: 'text-lg' },
            ].map((sz) => {
              const active = effectiveTheme.fontSize === sz.id;
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => onUpdateField('fontSize', sz.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    active
                      ? 'bg-amber-400 text-black border-amber-300 font-black shadow-lg shadow-amber-500/25'
                      : 'bg-black/55 border-white/10 text-zinc-300 hover:border-white/30'
                  }`}
                >
                  <span className={`${sz.scale} font-black leading-none`}>أب / Aa</span>
                  <span className="text-[10px] opacity-85">
                    {isRtl ? sz.labelAr : sz.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Weight Selector Pills */}
        <div className="space-y-2.5">
          <label className="block text-xs font-extrabold text-zinc-200">
            {isRtl ? 'سماكة الخط (Font Weight):' : 'Font Weight Thickness:'}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(
              [
                { w: '300', labelAr: 'رفيع', labelEn: 'Light' },
                { w: '400', labelAr: 'عادي', labelEn: 'Regular' },
                { w: '500', labelAr: 'متوسط', labelEn: 'Medium' },
                { w: '600', labelAr: 'شبه عريض', labelEn: 'SemiBold' },
                { w: '700', labelAr: 'عريض', labelEn: 'Bold' },
                { w: '800', labelAr: 'ملكي ثقيل', labelEn: 'Black' },
              ] as const
            ).map((wt) => {
              const active = effectiveTheme.fontWeight === wt.w;
              return (
                <button
                  key={wt.w}
                  type="button"
                  onClick={() => onUpdateField('fontWeight', wt.w)}
                  style={{ fontWeight: wt.w }}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                    active
                      ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/25'
                      : 'bg-black/55 border-white/10 text-zinc-300 hover:border-white/30'
                  }`}
                >
                  <span className="text-xs leading-none">{wt.w}</span>
                  <span className="text-[9px] opacity-85">
                    {isRtl ? wt.labelAr : wt.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   STICKY SIDE-BY-SIDE LIVE FONT PREVIEW INSPECTOR
   Appears in the right sticky column of /dashboard when scrolling into the
   Fonts section, replacing the Theme Preview Phone, and disappears when
   scrolling back up to the Themes section.
============================================================================ */
export function StickyFontPreviewInspector({
  effectiveTheme,
  isRtl,
  displayName,
  customPreviewTextAr = '',
  setCustomPreviewTextAr,
  customPreviewTextEn = '',
  setCustomPreviewTextEn,
  onUpdateField,
  onScrollToThemes,
}: BilingualTypographyStudioProps & {
  onScrollToThemes?: () => void;
}) {
  const activeArMeta =
    ARABIC_FONTS.find((f) => f.id === effectiveTheme.fontFamilyAr) || ARABIC_FONTS[0];
  const activeEnMeta =
    ENGLISH_FONTS.find((f) => f.id === effectiveTheme.fontFamilyEn) || ENGLISH_FONTS[0];

  const liveHeadlineAr =
    customPreviewTextAr.trim() ||
    displayName ||
    'هوية رقمية ملكية فائقة الفخامة';
  const liveHeadlineEn =
    customPreviewTextEn.trim() ||
    'VOLTIX SPATIAL LUXURY IDENTITY 2.5';

  const arSizeClass =
    effectiveTheme.fontSize === 'xl'
      ? 'text-2xl sm:text-[26px]'
      : effectiveTheme.fontSize === 'lg'
      ? 'text-xl sm:text-2xl'
      : effectiveTheme.fontSize === 'sm'
      ? 'text-base sm:text-lg'
      : 'text-lg sm:text-xl';

  const enSizeClass =
    effectiveTheme.fontSize === 'xl'
      ? 'text-lg sm:text-xl'
      : effectiveTheme.fontSize === 'lg'
      ? 'text-base sm:text-lg'
      : effectiveTheme.fontSize === 'sm'
      ? 'text-xs sm:text-sm'
      : 'text-sm sm:text-base';

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
      {/* Top Floating Control Bar (matches Theme Preview bar position) */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-3.5 px-4 py-2.5 rounded-2xl bg-black/75 border border-amber-400/30 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" />
          <span className="text-xs font-black text-white">
            {isRtl ? 'معاينة الخطوط الحية' : 'Live Font Preview'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[9px] font-black text-amber-300">
            {isRtl ? 'ثابتة بجانب الخطوط' : 'Sticky Mode'}
          </span>
        </div>

        {onScrollToThemes && (
          <button
            type="button"
            onClick={onScrollToThemes}
            className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/35 text-[10px] font-black text-zinc-300 hover:text-amber-200 transition-all"
          >
            {isRtl ? '↑ معاينة الثيمات' : '↑ Theme Preview'}
          </button>
        )}
      </div>

      {/* Main Sticky Font Specimen Frame */}
      <div
        className="w-full max-w-[420px] rounded-[2.3rem] border border-amber-400/35 bg-[#07070c]/95 backdrop-blur-3xl p-4 sm:p-5 shadow-[0_30px_90px_rgba(0,0,0,0.92),0_0_55px_rgba(245,158,11,0.12)] relative overflow-hidden flex flex-col gap-3.5"
        style={{
          boxShadow: `0 30px 90px rgba(0,0,0,0.92), 0 0 45px ${effectiveTheme.accentColor}22`,
        }}
      >
        {/* Ambient Theme Glow */}
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-500"
          style={{ background: effectiveTheme.accentColor }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
          style={{ background: effectiveTheme.glowColor }}
        />

        {/* Active Font Pair Summary Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 shadow-md"
              style={{
                background: `${effectiveTheme.accentColor}20`,
                borderColor: `${effectiveTheme.accentColor}50`,
                color: effectiveTheme.accentColor,
              }}
            >
              <Type className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {isRtl ? 'الثنائي المطبعي النشط الآن' : 'Active Font Pairing'}
              </div>
              <div className="text-xs font-black text-white truncate">
                {activeArMeta.label} + {activeEnMeta.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-mono font-bold text-zinc-200">
              W:{effectiveTheme.fontWeight}
            </span>
            <span className="px-2 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono font-black text-amber-300 uppercase">
              {effectiveTheme.fontSize}
            </span>
          </div>
        </div>

        {/* 1. Arabic Font Live Specimen Stage */}
        <div
          dir="rtl"
          className="relative z-10 rounded-2xl bg-black/75 border border-amber-400/25 p-4 space-y-2.5 shadow-inner transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] font-black text-amber-300">
              <Sparkles className="w-3 h-3" />
              الخط العربي: {activeArMeta.label}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {activeArMeta.styleTagAr}
            </span>
          </div>

          <div
            style={{
              fontFamily: `'${effectiveTheme.fontFamilyAr}', sans-serif`,
              fontWeight: effectiveTheme.fontWeight,
            }}
            className={`${arSizeClass} text-white leading-snug tracking-tight transition-all duration-300 break-words`}
          >
            {liveHeadlineAr}
          </div>

          <p
            style={{
              fontFamily: `'${effectiveTheme.fontFamilyAr}', sans-serif`,
              fontWeight: effectiveTheme.fontWeight === '800' ? '600' : effectiveTheme.fontWeight,
            }}
            className="text-xs text-zinc-300 leading-relaxed"
          >
            صُممت هذه الهوية لتمنح حضورك الرقمي فخامة استثنائية ووضوحاً بصرياً فائقاً على جميع الشاشات.
          </p>

          <div
            style={{
              fontFamily: `'${effectiveTheme.fontFamilyAr}', sans-serif`,
              fontWeight: effectiveTheme.fontWeight,
            }}
            className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300/90"
          >
            <span>أ ب ت ث ج ح خ د ذ ر ز س ش ص ض</span>
            <span className="font-mono">٠١٢٣٤٥٦٧٨٩</span>
          </div>
        </div>

        {/* 2. English Font Live Specimen Stage */}
        <div
          dir="ltr"
          className="relative z-10 rounded-2xl bg-black/75 border border-indigo-400/25 p-4 space-y-2 text-left shadow-inner transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-[10px] font-black text-indigo-300">
              EN: {activeEnMeta.label}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {isRtl ? activeEnMeta.styleTagAr : activeEnMeta.styleTagEn}
            </span>
          </div>

          <div
            style={{
              fontFamily: `'${effectiveTheme.fontFamilyEn}', sans-serif`,
              fontWeight: effectiveTheme.fontWeight,
            }}
            className={`${enSizeClass} text-white leading-snug tracking-wide transition-all duration-300 break-words`}
          >
            {liveHeadlineEn}
          </div>

          <div
            style={{
              fontFamily: `'${effectiveTheme.fontFamilyEn}', sans-serif`,
              fontWeight: effectiveTheme.fontWeight,
            }}
            className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-indigo-300/90"
          >
            <span>ABCDEFG HIJKLMN OPQRST UVWXYZ</span>
            <span>0123456789</span>
          </div>
        </div>

        {/* 3. Live Mini Profile & Link Card Simulation in Selected Fonts */}
        <div
          className="relative z-10 rounded-2xl p-3.5 border transition-all"
          style={{
            background: effectiveTheme.cardBg || 'rgba(255,255,255,0.04)',
            borderColor: effectiveTheme.cardBorder || 'rgba(255,255,255,0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-zinc-400">
              {isRtl ? 'محاكاة الخط داخل بطاقة الرابط:' : 'Live Link Card Typography:'}
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-[9px] font-black"
              style={{
                background: `${effectiveTheme.accentColor}25`,
                color: effectiveTheme.accentColor,
              }}
            >
              LIVE CARD
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                style={{
                  fontFamily: `'${effectiveTheme.fontFamilyAr}', '${effectiveTheme.fontFamilyEn}', sans-serif`,
                  fontWeight: effectiveTheme.fontWeight,
                  color: effectiveTheme.textColor,
                }}
                className="text-sm truncate"
              >
                {displayName || 'سلطان العتيبي'} • Official Hub
              </div>
              <div
                style={{
                  fontFamily: `'${effectiveTheme.fontFamilyEn}', '${effectiveTheme.fontFamilyAr}', sans-serif`,
                  color: effectiveTheme.secondaryTextColor,
                }}
                className="text-[11px] truncate mt-0.5"
              >
                @voltix.vip — Spatial Luxury Architecture
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-md"
              style={{
                background: effectiveTheme.accentColor,
                color: '#000',
                fontFamily: `'${effectiveTheme.fontFamilyEn}', sans-serif`,
              }}
            >
              ↗
            </div>
          </div>
        </div>

        {/* 4. Instant Custom Text Input + Quick Size/Weight Bar inside Sticky Panel */}
        <div className="relative z-10 space-y-2.5 pt-1 border-t border-white/10">
          {setCustomPreviewTextAr && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPreviewTextAr}
                onChange={(e) => setCustomPreviewTextAr(e.target.value)}
                placeholder={isRtl ? 'اكتب نصاً لتجربته بالخطوط فوراً...' : 'Type custom text to test live...'}
                className="flex-1 bg-black/70 border border-white/10 focus:border-amber-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
              {(customPreviewTextAr || customPreviewTextEn) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomPreviewTextAr?.('');
                    setCustomPreviewTextEn?.('');
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                  title={isRtl ? 'إعادة ضبط النص' : 'Reset text'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Quick Size & Weight Switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdateField('fontSize', sz)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    effectiveTheme.fontSize === sz
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              {(['400', '500', '600', '700', '800'] as const).map((wt) => (
                <button
                  key={wt}
                  type="button"
                  onClick={() => onUpdateField('fontWeight', wt)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    effectiveTheme.fontWeight === wt
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {wt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


