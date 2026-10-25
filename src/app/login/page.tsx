'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Globe,
  Eye,
  EyeOff,
  ShieldCheck,
  Palette,
  Type,
  Layers,
  Crown,
  QrCode,
  ExternalLink,
  Shield,
  Cpu,
  Wifi,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { SOCIAL_PLATFORMS, OfficialSocialBadge } from '@/lib/social-platforms';

const PARTICLES = [
  { id: 1, left: '10%', top: '20%', size: 3, duration: 9, delay: 0 },
  { id: 2, left: '25%', top: '65%', size: 2, duration: 12, delay: 2 },
  { id: 3, left: '40%', top: '15%', size: 4, duration: 7, delay: 1 },
  { id: 4, left: '55%', top: '80%', size: 2, duration: 11, delay: 3 },
  { id: 5, left: '70%', top: '35%', size: 3, duration: 8, delay: 0.5 },
  { id: 6, left: '85%', top: '55%', size: 4, duration: 10, delay: 2.5 },
  { id: 7, left: '15%', top: '85%', size: 2, duration: 13, delay: 4 },
  { id: 8, left: '90%', top: '18%', size: 3, duration: 9, delay: 1.5 },
  { id: 9, left: '32%', top: '42%', size: 2, duration: 14, delay: 3.5 },
  { id: 10, left: '78%', top: '75%', size: 3, duration: 8, delay: 2 },
  { id: 11, left: '5%', top: '50%', size: 2, duration: 11, delay: 0 },
  { id: 12, left: '48%', top: '92%', size: 4, duration: 10, delay: 1 },
  { id: 13, left: '62%', top: '10%', size: 2, duration: 12, delay: 4 },
  { id: 14, left: '95%', top: '40%', size: 3, duration: 7, delay: 2 },
  { id: 15, left: '20%', top: '5%', size: 3, duration: 13, delay: 3 },
  { id: 16, left: '38%', top: '78%', size: 2, duration: 9, delay: 0.5 },
  { id: 17, left: '82%', top: '90%', size: 4, duration: 11, delay: 1.5 },
  { id: 18, left: '68%', top: '60%', size: 2, duration: 8, delay: 2.5 },
];

export default function LoginPage() {
  const router = useRouter();
  const { locale, toggleLocale } = useLanguage();
  const isRtl = locale === 'ar';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthNotice, setOauthNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isRtl ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(
        isRtl ? 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً' : 'Network error, please try again'
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const res = await fetch('/api/auth/google');
    const data = await res.json().catch(() => null);
    if (data && data.configured === false) {
      setOauthNotice(data.message);
    } else {
      window.location.href = '/api/auth/google';
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
        {/* Living Aurora Orb 1: Royal Gold/Amber Flowing */}
        <div
          className="absolute -top-[25%] -left-[10%] w-[75vw] h-[75vw] max-w-[900px] max-h-[900px] rounded-full opacity-60 animate-aurora-flow"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(184, 134, 11, 0.12) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '18s',
          }}
        />

        {/* Living Aurora Orb 2: Deep Violet / Royal Amethyst */}
        <div
          className="absolute -bottom-[25%] -right-[10%] w-[70vw] h-[70vw] max-w-[850px] max-h-[850px] rounded-full opacity-50 animate-aurora-flow"
          style={{
            background:
              'radial-gradient(circle, rgba(121, 40, 202, 0.22) 0%, rgba(94, 18, 36, 0.12) 45%, transparent 70%)',
            filter: 'blur(90px)',
            animationDuration: '22s',
            animationDelay: '-7s',
          }}
        />

        {/* Living Aurora Orb 3: Pulsing Solar Core */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full opacity-45 animate-pulse-glow"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
            filter: 'blur(75px)',
            animationDuration: '9s',
          }}
        />

        {/* Living Aurora Orb 4: Subtle Cyan Highlight */}
        <div
          className="absolute top-2/3 -left-[15%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full opacity-35 animate-aurora-flow"
          style={{
            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.14) 0%, transparent 65%)',
            filter: 'blur(85px)',
            animationDuration: '26s',
            animationDelay: '-12s',
          }}
        />

        {/* Interactive Cursor Light Field */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.12), transparent 70%)',
          }}
        />

        {/* Cyber Matrix Ground Floor with Radial Vignette */}
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

        {/* Floating Golden Stardust Particles */}
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

      {/* Top Ambient Specular Line */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-10" />

      {/* ================================================================
          TOP EXECUTIVE NAVIGATION BAR
      ================================================================ */}
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
                PRO
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
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/35 text-xs font-bold text-zinc-300 hover:text-white transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'معاينة المنصة' : 'Explore Platform'}</span>
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

      {/* ================================================================
          MAIN SPLIT ARCHITECTURAL CONSOLE (SHOWCASE + AUTH MONOLITH)
      ================================================================ */}
      <main className="w-full max-w-7xl mx-auto my-auto py-6 lg:py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* ==============================================================
            WING 1: SYSTEM ARCHITECTURE & FEATURES SHOWCASE (6 Cols)
        ============================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[2.5rem] bg-[#0A0A0F]/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-9 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle Corner Glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          {/* Top Showcase Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              <span>{isRtl ? 'نظام الهوية المكانية الفاخرة' : 'SOVEREIGN SYSTEM ARCHITECTURE'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug gold-gradient-text">
              {isRtl
                ? 'المنظومة الرقمية الأكثر تكاملاً لإدارة هويتك، روابطك، وثيماتك الفاخرة'
                : 'The Most Prestigious Digital Vault for Your Identity, Links & Themes'}
            </h2>

            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
              {isRtl
                ? 'تحكّم في صفحتك الشخصية بأعلى معايير المعمارية الرقمية (Apple VisionOS): 40 ثيمًا أسطوريًا، 24 خطًا ملكيًا، و14 منصة تواصل رسمية مدمجة بأيقوناتها ثلاثية الأبعاد.'
                : 'Orchestrate your bio identity with 40 architectural themes, 24 bilingual royal fonts, and 14 official channel presets with authentic 3D brand emblems.'}
            </p>
          </div>

          {/* Luxury Sovereign Black Pass Card (Credit Card Shape) */}
          <div className="my-6 relative rounded-2xl p-5 bg-gradient-to-br from-[#1E1B15] via-[#0E0E14] to-[#07070B] border border-amber-400/35 shadow-[0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
            {/* Holographic Specular Shine */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-amber-400/15 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black/60 border border-amber-400/40 p-1 flex items-center justify-center">
                  <img src="/voltix-logo.png" alt="VoltiX" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-widest text-amber-300 font-mono">
                    VOLTIX BLACK PASS
                  </span>
                  <span className="text-[9px] text-zinc-400 block leading-none font-mono">
                    VERIFIED VIP CREATOR
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400/80">
                <Wifi className="w-4 h-4 rotate-90" />
                <Cpu className="w-4 h-4 text-amber-300" />
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between pt-2">
              <div className="space-y-0.5">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  CREATOR VAULT
                </div>
                <div className="text-sm font-black text-white font-mono" dir="ltr">
                  voltix.io/@admin
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SSL ACTIVE</span>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars of VoltiX System (تفاصيل ومزايا النظام) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white leading-tight">
                  {isRtl ? '40 ثيمًا أسطوريًا' : '40 Sovereign Themes'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {isRtl ? 'معمارية وسريالية وخارج الصندوق' : 'Next-gen spatial styles'}
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
                  {isRtl ? '12 عربيًا + 12 إنجليزيًا بمعاينة حية' : 'Live bilingual studio'}
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
                  {isRtl ? 'نيون، زجاج سائل، وتثبيت مميز' : 'Glass, neon & spotlight'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white leading-tight">
                  {isRtl ? 'استوديو QR كود 4K' : '4K QR Studio & SEO'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {isRtl ? 'بشعارك المخصص للطباعة' : 'Custom watermark & vector'}
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

        {/* ==============================================================
            WING 2: THE SOVEREIGN AUTH MONOLITH CARD (6 Cols)
        ============================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[2.5rem] bg-[#08080D]/95 backdrop-blur-2xl p-6 sm:p-8 lg:p-9 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl" />

          {/* Monolith Header */}
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'بوابة الدخول المشفرة' : 'ENCRYPTED CREATOR LOGIN'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              {isRtl ? 'تسجيل الدخول إلى VoltiX' : 'Sign in to Your Vault'}
            </h1>

            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
              {isRtl
                ? 'أدخل بياناتك للوصول المباشر إلى استوديو إدارة هويتك الرقمية وثيماتك'
                : 'Enter your credentials to manage your spatial identity studio'}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed flex items-center gap-2 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OAuth Notice */}
          {oauthNotice && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs leading-relaxed animate-in fade-in">
              {oauthNotice}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Username or Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200">
                {isRtl ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isRtl ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or email'}
                  className="w-full h-12 px-4 rounded-xl bg-black/60 hover:bg-black/70 border border-white/15 focus:border-amber-400 focus:bg-black/85 focus:ring-4 focus:ring-amber-400/15 text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Field: Password with Interactive Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-200">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold transition-colors"
                >
                  {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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
                  title={
                    showPassword
                      ? isRtl
                        ? 'إخفاء كلمة المرور'
                        : 'Hide password'
                      : isRtl
                      ? 'إظهار كلمة المرور'
                      : 'Show password'
                  }
                  aria-label={
                    showPassword
                      ? isRtl
                        ? 'إخفاء كلمة المرور'
                        : 'Hide password'
                      : isRtl
                      ? 'إظهار كلمة المرور'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400 hover:text-amber-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Gold Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_-4px_rgba(212,175,55,0.6)] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>
                {loading
                  ? isRtl
                    ? 'جاري التحقق والدخول...'
                    : 'Authenticating...'
                  : isRtl
                  ? 'دخول إلى استوديو VoltiX'
                  : 'Enter VoltiX Studio'}
              </span>
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#08080D] text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
              {isRtl ? 'أو' : 'OR'}
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2.5 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z"
              />
            </svg>
            <span>{isRtl ? 'المتابعة بحساب Google الرسمي' : 'Continue with Google'}</span>
          </button>

          {/* Register Prompt */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-zinc-400">
              {isRtl ? 'ليس لديك حساب حتى الآن؟ ' : "Don't have an account? "}
              <Link
                href="/register"
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors"
              >
                {isRtl ? 'أنشئ هويتك الملكية مجانًا' : 'Claim Free Profile'}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* ================================================================
          FOOTER SEALS
      ================================================================ */}
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
