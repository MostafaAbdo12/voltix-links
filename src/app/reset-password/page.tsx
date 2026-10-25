'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, Lock, CheckCircle2, Eye, EyeOff, Crown, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to reset password');
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push('/login'), 1800);
  };

  return (
    <div className="min-h-screen bg-[#030306] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-b from-amber-500/20 via-amber-600/5 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 cyber-grid-floor opacity-25" />

      <div className="w-full max-w-md relative rounded-[2.5rem] bg-[#07070C]/90 backdrop-blur-2xl p-7 sm:p-9 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black/80 border border-amber-400/40 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/voltix-logo.png"
                alt="VoltiX Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div dir="ltr" className="text-left">
              <span className="font-black text-lg gold-gradient-text block leading-none">
                VoltiX
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
                Sovereign Vault
              </span>
            </div>
          </Link>

          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3 h-3" />
            <span>SECURE PASS</span>
          </span>
        </div>

        <h1 className="text-2xl font-black mb-1.5 gold-gradient-text">
          {isRtl ? 'تعيين كلمة مرور جديدة' : 'Reset Password'}
        </h1>
        <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
          {isRtl
            ? 'أدخل رمز الاستعادة وكلمة المرور الجديدة لتأمين حسابك الملكي'
            : 'Enter your reset token and new sovereign password'}
        </p>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-bold animate-in fade-in">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-emerald-300">
              {isRtl
                ? 'تم تغيير كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...'
                : 'Password updated! Redirecting to login...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200">
                {isRtl ? 'رمز الاستعادة (Reset Token)' : 'Reset Token'}
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-2xl bg-black/55 border border-white/15 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:bg-black/80 focus:ring-4 focus:ring-amber-400/15 focus:outline-none transition-all font-mono"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200">
                {isRtl ? 'كلمة المرور الجديدة (8 أحرف على الأقل)' : 'New Password (min 8 chars)'}
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none group-focus-within:text-amber-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl bg-black/55 border border-white/15 pl-12 pr-11 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:bg-black/80 focus:ring-4 focus:ring-amber-400/15 focus:outline-none transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 left-3.5 p-1.5 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-white/10 transition-all"
                  title={
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_10px_32px_-5px_rgba(212,175,55,0.65)] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>
                {loading
                  ? isRtl
                    ? 'جاري التحديث...'
                    : 'Updating...'
                  : isRtl
                  ? 'حفظ كلمة المرور الجديدة'
                  : 'Save New Password'}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            href="/login"
            className="text-xs text-zinc-400 hover:text-amber-300 font-bold transition-colors inline-flex items-center gap-1.5"
          >
            {isRtl ? (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لتسجيل الدخول</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030306]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
