import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/15 blur-[130px]" />
      <div className="max-w-md z-10 liquid-glass rounded-3xl p-8 border border-white/15 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black gold-gradient-text">404 — VoltiX NOT FOUND</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          هذه الهوية الرقمية غير محجوزة بعد أو تم نقلها. يمكنك حجز هذا الاسم لنفسك الآن!
          <br />
          This digital identity is still available or has moved. Claim it now!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5"
          >
            <span>احجز هذا الاسم الآن / Claim Handle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold"
          >
            الصفحة الرئيسية / Home
          </Link>
        </div>
      </div>
    </div>
  );
}

