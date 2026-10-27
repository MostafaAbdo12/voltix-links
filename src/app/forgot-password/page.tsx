'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowRight, ArrowLeft, Crown, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setResetUrl('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.message || data.error || 'Done');
    if (data.resetUrl) setResetUrl(data.resetUrl);
    setLoading(false);
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
            <span>SECURITY</span>
          </span>
        </div>

        <h1 className="text-2xl font-black mb-1.5 gold-gradient-text">
          {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
        </h1>
        <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
          {isRtl
            ? 'أدخل بريدك الإلكتروني المسجل لإصدار رمز ورابط آمن لإعادة تعيين كلمة المرور'
            : 'Enter your registered email to generate a secure recovery link'}
        </p>

        {message && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 text-xs space-y-2 animate-in fade-in">
            <p className="font-bold">{message}</p>
            {resetUrl && (
              <Link
                href={resetUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-black font-black text-xs mt-2 shadow-lg hover:brightness-110 transition-all"
              >
                <span>{isRtl ? 'الانتقال لصفحة تعيين كلمة المرور الجديدة' : 'Open Reset Password Link'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-200">
              {isRtl ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none group-focus-within:text-amber-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@voltix.io"
                className="w-full rounded-2xl bg-black/55 border border-white/15 pl-4 pr-11 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:bg-black/80 focus:ring-4 focus:ring-amber-400/15 focus:outline-none transition-all"
                dir="ltr"
              />
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
                  ? 'جاري التحقق...'
                  : 'Processing...'
                : isRtl
                ? 'إرسال رابط الاستعادة'
                : 'Send Recovery Link'}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            href="/login"
            className="text-xs text-zinc-400 hover:text-amber-300 font-bold transition-colors inline-flex items-center gap-1.5"
          >
            {isRtl ? (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لصفحة تسجيل الدخول</span>
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
