'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  Share2,
  FlaskConical,
} from 'lucide-react';

export interface AnalyticsStatsData {
  days: number;
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  ctr: number;
  dailySeries: { date: string; views: number; clicks: number }[];
  topLinks: { id: string; title: string; url: string; clicksCount: number }[];
  countries: { country: string; count: number }[];
  devices: { device: string; count: number }[];
  sources: { source: string; count: number }[];
}

const DEMO_SANDBOX_DATA: AnalyticsStatsData = {
  days: 30,
  totalViews: 14820,
  totalClicks: 6490,
  uniqueVisitors: 9840,
  ctr: 43.8,
  dailySeries: Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(5, 10),
    views: 600 + ((i * 173) % 550),
    clicks: 240 + ((i * 97) % 280),
  })),
  topLinks: [
    { id: 'd1', title: 'Official 3D Design Portfolio 2026', url: 'https://auralinks.io', clicksCount: 2840 },
    { id: 'd2', title: 'Book a Private Strategy Session', url: 'https://auralinks.io/book', clicksCount: 1920 },
    { id: 'd3', title: 'Liquid Glass UI Kit Download', url: 'https://auralinks.io/kit', clicksCount: 1150 },
    { id: 'd4', title: 'Exclusive Creator Community', url: 'https://discord.gg/aura', clicksCount: 580 },
  ],
  countries: [
    { country: 'SA (Saudi Arabia)', count: 6240 },
    { country: 'AE (United Arab Emirates)', count: 3190 },
    { country: 'KW (Kuwait)', count: 1850 },
    { country: 'US (United States)', count: 1620 },
    { country: 'GB (United Kingdom)', count: 1120 },
  ],
  devices: [
    { device: 'mobile', count: 10840 },
    { device: 'desktop', count: 3120 },
    { device: 'tablet', count: 860 },
  ],
  sources: [
    { source: 'Instagram', count: 5420 },
    { source: 'X (Twitter)', count: 3890 },
    { source: 'TikTok', count: 2910 },
    { source: 'Direct', count: 1840 },
    { source: 'Google', count: 760 },
  ],
};

/** Turns an ISO country code (from Vercel's geo header) into "🇸🇦 Saudi Arabia". */
function formatCountry(code: string, isRtl: boolean): string {
  const cc = code.slice(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc) || cc === 'XX') return isRtl ? 'غير معروف' : 'Unknown';
  const flag = String.fromCodePoint(...Array.from(cc).map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
  try {
    const name = new Intl.DisplayNames([isRtl ? 'ar' : 'en'], { type: 'region' }).of(cc);
    return `${flag} ${name || cc}`;
  } catch {
    return `${flag} ${cc}`;
  }
}

export function AnalyticsPanel({ isRtl = true }: { isRtl?: boolean }) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [stats, setStats] = useState<AnalyticsStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/analytics/stats?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (active && !data.error) {
          setStats(data);
        }
        if (active) setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days]);

  const activeData = demoMode ? DEMO_SANDBOX_DATA : stats;
  const maxDaily = Math.max(
    10,
    ...(activeData?.dailySeries.map((d) => Math.max(d.views, d.clicks)) || [10])
  );

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>{isRtl ? 'مركز التحليلات والإحصائيات الحقيقية' : 'Real-Time Analytics Center'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isRtl
              ? 'بيانات فعلية دقيقة من قاعدة البيانات مع مراعاة الخصوصية وعدم تخزين بيانات حساسة'
              : 'Live database telemetry with privacy-preserving visitor hashing'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Optional Sandbox Demo Preview Toggle */}
          <button
            type="button"
            onClick={() => setDemoMode((p) => !p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              demoMode
                ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>
              {demoMode
                ? isRtl
                  ? 'وضع بيانات العرض التجريبية (Demo)'
                  : 'Demo Preview Active'
                : isRtl
                ? 'معاينة بيانات تجريبية'
                : 'Preview Demo Data'}
            </span>
          </button>

          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                days === d
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {isRtl ? `آخر ${d} يوم` : `Last ${d}d`}
            </button>
          ))}
        </div>
      </div>

      {demoMode && (
        <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between">
          <span>
            {isRtl
              ? '⚠️ أنت تشاهد الآن بيانات تجريبية (Demo Preview) لاختبار شكل الرسوم البيانية. أوقف هذا الوضع لعرض بياناتك الفعلية.'
              : '⚠️ Viewing clearly labeled Demo Preview data. Toggle off to view your real database analytics.'}
          </span>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: isRtl ? 'إجمالي زيارات الصفحة' : 'Total Page Views',
            value: activeData?.totalViews ?? 0,
            icon: Eye,
            color: 'text-amber-400',
          },
          {
            label: isRtl ? 'الزوار الفريدون' : 'Unique Visitors',
            value: activeData?.uniqueVisitors ?? 0,
            icon: Users,
            color: 'text-cyan-400',
          },
          {
            label: isRtl ? 'إجمالي نقرات الروابط' : 'Total Link Clicks',
            value: activeData?.totalClicks ?? 0,
            icon: MousePointerClick,
            color: 'text-emerald-400',
          },
          {
            label: isRtl ? 'معدل النقر (CTR)' : 'Click-Through Rate',
            value: `${activeData?.ctr ?? 0}%`,
            icon: TrendingUp,
            color: 'text-purple-400',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-black">
                {loading && !demoMode ? '...' : kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Time-Series Chart */}
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold">
            {isRtl ? 'الأداء اليومي (الزيارات مقابل النقرات)' : 'Daily Performance (Views vs Clicks)'}
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {isRtl ? 'الزيارات' : 'Views'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              {isRtl ? 'النقرات' : 'Clicks'}
            </span>
          </div>
        </div>

        <div className="h-52 flex items-end gap-2 pt-4 overflow-x-auto">
          {(activeData?.dailySeries || []).slice(-14).map((item, i) => {
            const vHeight = Math.max(6, Math.round((item.views / maxDaily) * 100));
            const cHeight = Math.max(4, Math.round((item.clicks / maxDaily) * 100));
            return (
              <div key={i} className="flex-1 min-w-[34px] flex flex-col items-center gap-2 group">
                <div className="w-full h-40 flex items-end justify-center gap-1 relative">
                  <div
                    style={{ height: `${vHeight}%` }}
                    className="w-3 rounded-t-md bg-gradient-to-t from-amber-600 to-amber-300 transition-all group-hover:brightness-125"
                    title={`Views: ${item.views}`}
                  />
                  <div
                    style={{ height: `${cHeight}%` }}
                    className="w-3 rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-300 transition-all group-hover:brightness-125"
                    title={`Clicks: ${item.clicks}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono" dir="ltr">
                  {item.date.slice(-5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Grid: Top Links, Countries, Devices, Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performing Links */}
        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'الروابط الأكثر نقرًا' : 'Top Performing Links'}</span>
          </h3>
          <div className="space-y-3">
            {(activeData?.topLinks || []).length === 0 ? (
              <p className="text-xs text-zinc-500">
                {isRtl ? 'لا توجد نقرات مسجلة بعد' : 'No clicks recorded yet'}
              </p>
            ) : (
              activeData?.topLinks.map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{l.title}</div>
                    <div className="text-[11px] text-zinc-500 truncate" dir="ltr">
                      {l.url}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-300 font-bold text-xs shrink-0">
                    {l.clicksCount} {isRtl ? 'نقرة' : 'clicks'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Countries, Devices & Traffic Sources */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{isRtl ? 'الدول الأكثر زيارة' : 'Visitor Countries'}</span>
            </h3>
            <div className="space-y-2">
              {(activeData?.countries || []).slice(0, 5).map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{formatCountry(c.country, isRtl)}</span>
                  <span className="font-bold text-cyan-300">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? 'نوع الجهاز' : 'Device Types'}</span>
              </h3>
              {(activeData?.devices || []).map((d) => (
                <div key={d.device} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-zinc-400">{d.device}</span>
                  <span className="font-bold text-emerald-300">{d.count}</span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>{isRtl ? 'مصادر الزيارات' : 'Traffic Sources'}</span>
              </h3>
              {(activeData?.sources || []).slice(0, 4).map((s) => (
                <div key={s.source} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 truncate">{s.source}</span>
                  <span className="font-bold text-purple-300">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

