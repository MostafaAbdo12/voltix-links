'use client';

import React, { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import type { ThemeConfig } from '@/lib/themes';

interface SubscribeFormProps {
  userId: string;
  title?: string;
  theme: ThemeConfig;
  isRtl: boolean;
  isPreview?: boolean;
}

export function SubscribeForm({ userId, title, theme, isRtl, isPreview = false }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const heading = title?.trim() || (isRtl ? 'اشترك ليصلك كل جديد' : 'Subscribe for updates');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || (isRtl ? 'حدث خطأ' : 'Something went wrong'));
        return;
      }
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(isRtl ? 'تعذر الاتصال' : 'Network error');
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mt-8 p-5 rounded-3xl border space-y-3"
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.cardBorder,
        color: theme.textColor,
        backdropFilter: `blur(${theme.glassBlur}px)`,
      }}
    >
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Mail className="w-4 h-4" style={{ color: theme.accentColor }} />
        <span>{heading}</span>
      </h3>

      {status === 'done' ? (
        <p className="text-xs flex items-center gap-1.5" style={{ color: theme.accentColor }}>
          <Check className="w-4 h-4" />
          {isRtl ? 'تم الاشتراك بنجاح، شكرًا لك!' : "You're subscribed, thank you!"}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isRtl ? 'بريدك الإلكتروني' : 'your@email.com'}
            dir="ltr"
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-black/30 border text-sm outline-none"
            style={{ borderColor: theme.cardBorder, color: theme.textColor }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2.5 rounded-2xl text-sm font-bold transition-transform hover:scale-105 disabled:opacity-60"
            style={{ backgroundColor: theme.accentColor, color: theme.bgColor }}
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : isRtl ? 'اشترك' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
    </div>
  );
}
