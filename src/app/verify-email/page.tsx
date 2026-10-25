'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle2, MailCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setStatus('verifying');
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenToVerify }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setMessage(data.message || 'Verified!');
    } else {
      setStatus('error');
      setMessage(data.error || 'Verification failed');
    }
  };

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      handleVerify(t);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md liquid-glass rounded-3xl p-8 border border-white/15 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <MailCheck className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black">
          {isRtl ? 'تأكيد البريد الإلكتروني' : 'Email Verification'}
        </h1>

        {status === 'success' ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8" />
            <span>{message}</span>
            <Link
              href="/dashboard"
              className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs"
            >
              {isRtl ? 'العودة للوحة التحكم' : 'Go to Dashboard'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {message}
              </div>
            )}
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={isRtl ? 'أدخل رمز التأكيد...' : 'Paste verification token...'}
              className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-xs text-white"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => handleVerify(token)}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold text-xs"
            >
              {isRtl ? 'تأكيد البريد الآن' : 'Verify Email Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

