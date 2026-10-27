'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Crown, Check, X, Loader2, Eye } from 'lucide-react';
import { ProfileRenderer, type ProfileData } from './ProfileRenderer';
import { getThemeById, type ThemeConfig, type EffectsConfig } from '@/lib/themes';

interface ThemePreviewClientProps {
  profile: ProfileData;
  theme: ThemeConfig;
  effects: EffectsConfig;
  price: number | null;
  owned: boolean;
  isCurrent: boolean;
  prevThemeId: string | null;
  nextThemeId: string | null;
  position: { index: number; total: number } | null;
}

export function ThemePreviewClient({
  profile,
  theme,
  effects,
  price,
  owned,
  isCurrent,
  prevThemeId,
  nextThemeId,
  position,
}: ThemePreviewClientProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(isCurrent);
  const [hidden, setHidden] = useState(false);

  const apply = async () => {
    setApplying(true);
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileConfig: { themeId: theme.id, layout: theme.profileLayout, customThemeJson: '{}' } }),
    });
    setApplying(false);
    if (res.ok) setApplied(true);
  };

  const arrowClass =
    'w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors';

  return (
    <div className="relative">
      <ProfileRenderer profile={profile} theme={theme} effects={effects} isPreview />

      {/* Top ribbon so the visitor never mistakes this for their live page */}
      <div className="fixed top-0 inset-x-0 z-[90] flex justify-center pointer-events-none">
        <div className="mt-3 px-4 py-1.5 rounded-full bg-black/80 border border-amber-400/40 text-amber-200 text-xs font-bold backdrop-blur flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          معاينة على صفحتك — الزوار لسه شايفين ثيمك الحالي
        </div>
      </div>

      {hidden ? (
        <button
          onClick={() => setHidden(false)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-5 py-2.5 rounded-full bg-amber-400 text-black text-sm font-black shadow-2xl"
        >
          إظهار شريط المعاينة
        </button>
      ) : (
        <div dir="rtl" className="fixed bottom-0 inset-x-0 z-[90] p-3 sm:p-4">
          <div className="max-w-2xl mx-auto rounded-3xl bg-zinc-950/90 border border-amber-400/30 backdrop-blur-xl shadow-[0_-10px_60px_rgba(0,0,0,0.6)] p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center gap-3">
            {nextThemeId && (
              <Link href={`/preview/${nextThemeId}`} className={arrowClass} aria-label="الثيم التالي" title={getThemeById(nextThemeId).nameAr}>
                <ChevronRight className="w-5 h-5 text-white" />
              </Link>
            )}

            <div className="order-first sm:order-none basis-full sm:basis-auto sm:flex-1 min-w-0 text-white">
              <div className="flex items-center gap-2 font-black truncate">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{theme.nameAr}</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {position ? `${position.index} من ${position.total} • ` : ''}
                {owned ? 'متاح لك' : price !== null ? `${price} ج.م — يفضل معاك مدى الحياة` : 'مجاني'}
              </div>
            </div>

            {owned ? (
              applied ? (
                <span className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-2xl text-sm font-black bg-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> مطبّق على صفحتك
                </span>
              ) : (
                <button
                  onClick={apply}
                  disabled={applying}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-sm font-black bg-emerald-400 text-black hover:bg-emerald-300 disabled:opacity-60"
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'طبّقه على صفحتي'}
                </button>
              )
            ) : (
              <Link
                href={`/dashboard?buy=${encodeURIComponent(theme.id)}`}
                className="flex-1 sm:flex-none text-center px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-black bg-amber-400 text-black hover:bg-amber-300 whitespace-nowrap"
              >
                اشترِه — {price} ج.م
              </Link>
            )}

            {prevThemeId && (
              <Link href={`/preview/${prevThemeId}`} className={arrowClass} aria-label="الثيم السابق" title={getThemeById(prevThemeId).nameAr}>
                <ChevronLeft className="w-5 h-5 text-white" />
              </Link>
            )}
          </div>

          <div className="max-w-2xl mx-auto flex justify-between mt-2 px-2 text-[11px]">
            <Link href="/dashboard?tab=store" className="text-zinc-300 hover:text-white underline-offset-2 hover:underline">
              ← رجوع للمتجر
            </Link>
            <button onClick={() => setHidden(true)} className="text-zinc-400 hover:text-white flex items-center gap-1">
              <X className="w-3 h-3" /> إخفاء الشريط
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
