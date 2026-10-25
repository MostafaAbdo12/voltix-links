'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Globe,
  Eye,
  EyeOff,
  Palette,
  Type,
  Layers,
  Crown,
  QrCode,
  ShieldCheck,
  Shield,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { SOCIAL_PLATFORMS, OfficialSocialBadge } from '@/lib/social-platforms';

const PARTICLES = [
  { id: 1, left: '12%', top: '18%', size: 3, duration: 10, delay: 0 },
  { id: 2, left: '28%', top: '68%', size: 2, duration: 13, delay: 1.5 },
  { id: 3, left: '42%', top: '12%', size: 4, duration: 8, delay: 0.5 },
  { id: 4, left: '58%', top: '82%', size: 2, duration: 12, delay: 2.5 },
  { id: 5, left: '72%', top: '30%', size: 3, duration: 9, delay: 1 },
  { id: 6, left: '88%', top: '58%', size: 4, duration: 11, delay: 3 },
  { id: 7, left: '18%', top: '88%', size: 2, duration: 14, delay: 3.5 },
  { id: 8, left: '92%', top: '15%', size: 3, duration: 8, delay: 2 },
  { id: 9, left: '35%', top: '45%', size: 2, duration: 12, delay: 0 },
  { id: 10, left: '80%', top: '78%', size: 3, duration: 9, delay: 1.8 },
  { id: 11, left: '8%', top: '52%', size: 2, duration: 11, delay: 2.2 },
  { id: 12, left: '50%', top: '90%', size: 4, duration: 10, delay: 0.8 },
  { id: 13, left: '65%', top: '8%', size: 2, duration: 13, delay: 4 },
  { id: 14, left: '96%', top: '38%', size: 3, duration: 8, delay: 1.2 },
];

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, toggleLocale } = useLanguage();
  const isRtl = locale === 'ar';

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const claimed = searchParams.get('username');
    if (claimed) {
      setUsername(claimed);
      setDisplayName(claimed);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          displayName: displayName || username,
          email,
          password,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isRtl ? 'فشل إنشاء الحساب' : 'Registration failed'));
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(
        isRtl ? 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً' : 'Network error, please try again'
      );
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          '--mouse-x',
          `${((e.clientX - rect.left) / rect.width) * 100}%`
        );
        e.currentTarget.style.setProperty(
          '--mouse-y',
          `${((e.clientY - rect.top) / rect.height) * 100}%`
        );
      }}
      className="min-h-screen bg-[#040407] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-amber-400 selection:text-black"
    >
      {/* ================================================================
          MULTI-LAYER LIVING ANIMATED AURORA & COSMIC PARTICLES
      ================================================================ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-[25%] -right-[10%] w-[75vw] h-[75vw] max-w-[900px] max-h-[900px] rounded-full opacity-60 animate-aurora-flow"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(184, 134, 11, 0.12) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '18s',
          }}
        />

        <div
          className="absolute -bottom-[25%] -left-[10%] w-[70vw] h-[70vw] max-w-[850px] max-h-[850px] rounded-full opacity-50 animate-aurora-flow"
          style={{
            background:
              'radial-gradient(circle, rgba(121, 40, 202, 0.22) 0%, rgba(94, 18, 36, 0.12) 45%, transparent 70%)',
            filter: 'blur(90px)',
            animationDuration: '22s',
            animationDelay: '-7s',
          }}
        />

        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full opacity-45 animate-pulse-glow"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
            filter: 'blur(75px)',
            animationDuration: '9s',
          }}
        />

        <div
          className="absolute top-2/3 -right-[15%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full opacity-35 animate-aurora-flow"
          style={{
            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.14) 0%, transparent 65%)',
            filter: 'blur(85px)',
            animationDuration: '26s',
            animationDelay: '-12s',
          }}
        />

        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.12), transparent 70%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.2) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(212, 175, 55, 0.2) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage:
              'radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 80%)',
          }}
        />

        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full animate-float-slow"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#FDE08D',
              boxShadow:
                '0 0 10px rgba(253, 224, 141, 0.9), 0 0 20px rgba(212, 175, 55, 0.5)',
              opacity: 0.7,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-10" />

      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 py-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 via-black to-black border border-amber-400/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] group-hover:border-amber-300 transition-all overflow-hidden">
            <img
              src="/voltix-logo.png"
              alt="VoltiX Sovereign Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div dir="ltr" className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider gold-gradient-text block leading-none py-0">
                VoltiX
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded">
                STUDIO
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-400 block mt-1 font-mono leading-none">
              Sovereign Spatial Identity OS
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/35 text-xs font-bold text-zinc-300 hover:text-white transition-all"
          >
            <span>{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>

          <button
            type="button"
            onClick={toggleLocale}
            className="h-9 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-amber-400/40 text-xs font-extrabold flex items-center gap-1.5 text-zinc-200 transition-all shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Console */}
      <main className="w-full max-w-7xl mx-auto my-auto py-6 lg:py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* WING 1: SYSTEM DETAILS SHOWCASE (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[2.5rem] bg-[#0A0A0F]/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-9 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              <span>{isRtl ? 'عضوية النخبة والمبدعين' : 'VIP CREATOR MEMBERSHIP'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug gold-gradient-text">
              {isRtl
                ? 'انضم إلى مجتمع قادة الأعمال والمبدعين وامتلك هويتك الرقمية الفاخرة'
                : 'Join Elite Creators with a Sovereign Spatial Identity'}
            </h2>

            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
              {isRtl
                ? 'عند تسجيل حسابك ستحصل فورًا على رابطك الحصري المخصص، دخول كامل لمعرض الـ 40 ثيمًا أسطوريًا، وأدوات تصميم الروابط ثلاثية الأبعاد مجانًا.'
                : 'Claim your exclusive handle now. Unlock 40 royal themes showroom, 24 fonts, and authentic 3D social badges.'}
            </p>
          </div>

          {/* Live Dynamic Claim Card */}
          <div className="my-6 relative rounded-2xl p-5 bg-gradient-to-br from-[#1E1B15] via-[#0E0E14] to-[#07070B] border border-amber-400/35 shadow-[0_12px_35px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-lg flex items-center justify-center uppercase">
                  {(displayName || username || 'V').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{displayName || (isRtl ? 'اسمك المعروض' : 'Your Name')}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xs font-mono text-amber-300/90" dir="ltr">
                    voltix.io/@{username || 'yourname'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                {isRtl ? 'متاح للحجز' : 'Available'}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono pt-1">
              {isRtl
                ? '✦ يتضمن محرك الثيمات الأسطورية واستوديو الخطوط الملكية مجانًا'
                : '✦ Includes 40 Themes Showroom & 24 Royal Fonts'}
            </div>
          </div>

          {/* 4 System Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white leading-tight">
                  {isRtl ? '40 ثيمًا أسطوريًا' : '40 Spatial Themes'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {isRtl ? 'متاحة ومفتوحة بالكامل' : 'All unlocked free'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 flex items-center justify-center shrink-0">
                <Type className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white leading-tight">
                  {isRtl ? '24 خطًا ملكيًا' : '24 Royal Fonts'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {isRtl ? 'عربي وإنجليزي ملكي' : 'Arabic + English'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white leading-tight">
                  {isRtl ? '12 نمط بطاقات 3D' : '12 3D Card Types'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {isRtl ? 'سحب وإفلات وتثبيت' : 'Drag & drop reorder'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white leading-tight">
                  {isRtl ? 'كود QR بدقة 4K' : '4K Vector QR Pass'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {isRtl ? 'طباعة ومشاركة سريعة' : 'Print & share ready'}
                </div>
              </div>
            </div>
          </div>

          {/* Official Social Channels Dock Preview with Interactive Hover Animation & Tooltips */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-extrabold text-zinc-400 whitespace-nowrap">
              {isRtl ? '14 منصة تواصل رسمية مدمجة:' : '14 Official Social Channels:'}
            </span>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap py-2">
              {SOCIAL_PLATFORMS.slice(0, 7).map((plat) => (
                <div key={plat.id} className="relative group">
                  {/* Floating Platform Tooltip on Hover */}
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/95 border border-white/20 text-[10px] font-extrabold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-30 shadow-xl flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: plat.color }}
                    />
                    <span>{isRtl ? plat.nameAr.split(' ')[0] : plat.name}</span>
                  </div>

                  <OfficialSocialBadge
                    platformId={plat.id}
                    size="sm"
                    variant="gradient"
                    interactive
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WING 2: REGISTRATION MONOLITH (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[2.5rem] bg-[#08080D]/95 backdrop-blur-2xl p-6 sm:p-8 lg:p-9 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl" />

          {/* Header */}
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'إنشاء حساب ملكي مجاني' : 'CLAIM SOVEREIGN PROFILE'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              {isRtl ? 'ابدأ رحلتك المكانية مع VoltiX' : 'Build Your Sovereign Vault'}
            </h1>

            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
              {isRtl
                ? 'احجز اسم المستخدم الخاص بك الآن واستمتع بمحرك الثيمات الملكية مجانًا'
                : 'Claim your luxury username handle now and access the themes showroom'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed flex items-center gap-2 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username & Display Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-200">
                  {isRtl ? 'اسم المستخدم (Handle) *' : 'Username Handle *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    }
                    placeholder="alexander"
                    className="w-full h-12 pl-8 pr-4 rounded-xl bg-black/60 hover:bg-black/70 border border-white/15 focus:border-amber-400 focus:bg-black/85 focus:ring-4 focus:ring-amber-400/15 text-sm text-white placeholder:text-zinc-600 transition-all outline-none font-mono"
                    dir="ltr"
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 left-3 text-amber-400 font-bold font-mono text-xs">
                    @
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-200">
                  {isRtl ? 'الاسم المعروض' : 'Display Name'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={isRtl ? 'المهندس ألكسندر' : 'Alexander Sterling'}
                    className="w-full h-12 px-4 rounded-xl bg-black/60 hover:bg-black/70 border border-white/15 focus:border-amber-400 focus:bg-black/85 focus:ring-4 focus:ring-amber-400/15 text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
                  />
                  <User className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200">
                {isRtl ? 'البريد الإلكتروني *' : 'Email Address *'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@voltix.io"
                  className="w-full h-12 px-4 rounded-xl bg-black/60 hover:bg-black/70 border border-white/15 focus:border-amber-400 focus:bg-black/85 focus:ring-4 focus:ring-amber-400/15 text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200">
                {isRtl ? 'كلمة المرور (8 أحرف على الأقل) *' : 'Password (min 8 chars) *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-black/60 hover:bg-black/70 border border-white/15 focus:border-amber-400 focus:bg-black/85 focus:ring-4 focus:ring-amber-400/15 text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 left-3 p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400 hover:text-amber-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_-4px_rgba(212,175,55,0.6)] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>
                {loading
                  ? isRtl
                    ? 'جاري إنشاء الهوية...'
                    : 'Creating profile...'
                  : isRtl
                  ? 'إنشاء الهوية الملكية مجانًا'
                  : 'Claim Free Sovereign Profile'}
              </span>
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              )}
            </button>
          </form>

          {/* Login prompt */}
          <div className="mt-4 pt-3 border-t border-white/5 text-center">
            <p className="text-xs text-zinc-400">
              {isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors"
              >
                {isRtl ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto z-10 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400/70" />
          <span>VoltiX Spatial OS • 256-Bit SSL Encrypted Vault</span>
        </div>
        <span>All Rights Reserved © 2026</span>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      <RegisterFormContent />
    </Suspense>
  );
}
