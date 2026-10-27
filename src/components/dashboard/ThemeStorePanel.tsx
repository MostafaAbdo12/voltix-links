'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Lock, Check, Clock, X, Loader2, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { getThemeById } from '@/lib/themes';
import { TemplateThumb } from '@/components/profile/TemplateThumb';
import type { PageTemplateId } from '@/lib/themes';

const TEMPLATE_LABELS: Record<PageTemplateId, [string, string]> = {
  maison: ['تصميم مجلة فاخرة', 'Luxury editorial'],
  'black-card': ['بطاقة VIP معدنية', 'Metal VIP card'],
  bento: ['مربعات زي آيفون', 'Bento widgets'],
  ios: ['شكل تطبيق آيفون', 'iOS app style'],
  poster: ['بوستر جريء', 'Bold poster'],
  sticker: ['ستيكرز مرحة', 'Playful stickers'],
  hud: ['واجهة لعبة', 'Game HUD'],
};

interface StoreData {
  premiumThemes: { themeId: string; price: number; isNew: boolean }[];
  plans: { kind: 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY'; price: number; days: number; nameAr: string; nameEn: string }[];
  ownedThemeIds: string[];
  premiumUntil: string | null;
  premiumActive: boolean;
  isOwner?: boolean;
  requests: { id: string; kind: string; themeId: string | null; amount: number; status: string; createdAt: string }[];
  paymentInstructions: string;
}

type Purchase = { kind: 'THEME'; themeId: string; price: number } | { kind: 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY'; price: number };

interface ThemeStorePanelProps {
  isRtl?: boolean;
  focusThemeId?: string | null;
  onPreviewTheme?: (themeId: string) => void;
}

export function ThemeStorePanel({ isRtl = true, focusThemeId, onPreviewTheme }: ThemeStorePanelProps) {
  const [data, setData] = useState<StoreData | null>(null);
  const [checkout, setCheckout] = useState<Purchase | null>(null);

  const load = () =>
    fetch('/api/store')
      .then((r) => r.json())
      .then((d) => !d.error && setData(d));

  useEffect(() => {
    load();
  }, []);

  // Opening the store from a locked theme jumps straight to its checkout
  useEffect(() => {
    if (!data || !focusThemeId) return;
    const item = data.premiumThemes.find((t) => t.themeId === focusThemeId);
    if (item && !data.premiumActive && !data.ownedThemeIds.includes(item.themeId)) {
      setCheckout({ kind: 'THEME', themeId: item.themeId, price: item.price });
    }
  }, [data, focusThemeId]);

  if (!data) return <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />;

  const pendingFor = (kind: string, themeId?: string) =>
    data.requests.some((r) => r.status === 'PENDING' && r.kind === kind && (kind !== 'THEME' || r.themeId === themeId));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span>{isRtl ? 'متجر الثيمات' : 'Theme Store'}</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {isRtl
            ? 'اشترِ ثيمًا واحدًا يبقى معك للأبد، أو اشترك في بريميوم وافتح كل الثيمات المدفوعة'
            : 'Buy a single theme forever, or go Premium to unlock every paid theme'}
        </p>
      </div>

      {data.isOwner && (
        <div className="p-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-sm font-bold text-emerald-200 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          {isRtl
            ? 'إنت مالك المنصة، فكل الثيمات المدفوعة مفتوحة لك مجانًا. ده نفس اللي المستخدمين بيشوفوه في المتجر.'
            : 'You own the platform, so every paid theme is unlocked for free. This is the store your users see.'}
        </div>
      )}

      {/* Premium plans */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data.plans.map((plan) => {
          const yearly = plan.kind === 'PREMIUM_YEARLY';
          const pending = pendingFor(plan.kind);
          return (
            <div
              key={plan.kind}
              className={`relative p-5 rounded-3xl border space-y-3 ${
                yearly ? 'bg-gradient-to-br from-amber-500/15 to-amber-900/10 border-amber-400/50' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {yearly && (
                <span className="absolute -top-2.5 start-5 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  {isRtl ? 'الأوفر' : 'Best value'}
                </span>
              )}
              <div className="flex items-center gap-2 font-black">
                <Crown className="w-4 h-4 text-amber-400" />
                {isRtl ? plan.nameAr : plan.nameEn}
              </div>
              <div className="text-3xl font-black">
                {plan.price} <span className="text-sm text-zinc-400">{isRtl ? 'ج.م' : 'EGP'}</span>
              </div>
              <p className="text-xs text-zinc-400">
                {isRtl
                  ? `كل الثيمات المدفوعة (${data.premiumThemes.length} ثيم) + أي ثيم جديد ننزله`
                  : `All ${data.premiumThemes.length} paid themes + every new release`}
              </p>
              {data.premiumActive ? (
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {data.isOwner
                    ? isRtl ? 'مفتوح لك كمالك' : 'Unlocked for the owner'
                    : <>
                        {isRtl ? 'مفعّل حتى ' : 'Active until '}
                        {new Date(data.premiumUntil!).toLocaleDateString(isRtl ? 'ar-EG' : 'en')}
                      </>}
                </p>
              ) : (
                <button
                  disabled={pending}
                  onClick={() => setCheckout({ kind: plan.kind, price: plan.price })}
                  className="w-full py-2.5 rounded-2xl text-sm font-black bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-60"
                >
                  {pending ? (isRtl ? 'قيد المراجعة…' : 'Under review…') : isRtl ? 'اشترك الآن' : 'Subscribe'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Paid themes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.premiumThemes.map(({ themeId, price, isNew }, i) => {
          const theme = getThemeById(themeId);
          const owned = data.premiumActive || data.ownedThemeIds.includes(themeId);
          const pending = pendingFor('THEME', themeId);
          return (
            <div key={themeId} className="relative space-y-2">
              {isNew && (
                <span className="absolute z-10 top-2 end-2 px-2 py-0.5 rounded-full bg-fuchsia-500 text-white text-[10px] font-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isRtl ? 'جديد' : 'New'}
                </span>
              )}
              <button
                type="button"
                onClick={() => onPreviewTheme?.(themeId)}
                className={`block w-full text-start rounded-3xl overflow-hidden border transition-all hover:-translate-y-1 ${
                  focusThemeId === themeId ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/10 hover:border-amber-400/50'
                }`}
              >
                <TemplateThumb theme={theme} height={280} />
                <span className="block px-3.5 py-2.5 bg-black/60">
                  <span className="block font-black text-sm">{isRtl ? theme.nameAr : theme.nameEn}</span>
                  <span className="block text-[11px] text-zinc-400">
                    {theme.template ? TEMPLATE_LABELS[theme.template][isRtl ? 0 : 1] : ''}
                  </span>
                </span>
              </button>
              <a
                href={`/preview/${themeId}`}
                className="w-full py-2 rounded-xl text-xs font-black border border-amber-400/40 text-amber-200 hover:bg-amber-400/10 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                {isRtl ? 'جرّبه على صفحتي' : 'Try it on my page'}
              </a>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black">
                  {price} <span className="text-[11px] text-zinc-400">{isRtl ? 'ج.م' : 'EGP'}</span>
                </span>
                {owned ? (
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {isRtl ? 'متاح لك' : 'Unlocked'}
                  </span>
                ) : (
                  <button
                    disabled={pending}
                    onClick={() => setCheckout({ kind: 'THEME', themeId, price })}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-white/10 hover:bg-amber-400 hover:text-black disabled:opacity-60 flex items-center gap-1"
                  >
                    {pending ? <Clock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {pending ? (isRtl ? 'قيد المراجعة' : 'Pending') : isRtl ? 'شراء' : 'Buy'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* My requests */}
      {data.requests.length > 0 && (
        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2">
          <h3 className="text-sm font-bold">{isRtl ? 'طلباتي' : 'My requests'}</h3>
          {data.requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">
                {r.kind === 'THEME' ? getThemeById(r.themeId || '').nameAr : r.kind === 'PREMIUM_YEARLY' ? (isRtl ? 'بريميوم سنوي' : 'Premium Yearly') : isRtl ? 'بريميوم شهري' : 'Premium Monthly'}
                <span className="text-zinc-500"> · {r.amount} {isRtl ? 'ج.م' : 'EGP'}</span>
              </span>
              <StatusBadge status={r.status} isRtl={isRtl} />
            </div>
          ))}
        </div>
      )}

      {checkout && (
        <CheckoutModal
          purchase={checkout}
          instructions={data.paymentInstructions}
          isRtl={isRtl}
          onClose={() => setCheckout(null)}
          onSubmitted={() => {
            setCheckout(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status, isRtl }: { status: string; isRtl: boolean }) {
  const map: Record<string, [string, string, string]> = {
    PENDING: ['قيد المراجعة', 'Pending', 'bg-amber-500/15 text-amber-300'],
    APPROVED: ['تم التفعيل', 'Approved', 'bg-emerald-500/15 text-emerald-300'],
    REJECTED: ['مرفوض', 'Rejected', 'bg-red-500/15 text-red-300'],
  };
  const [ar, en, cls] = map[status] || map.PENDING;
  return <span className={`px-2 py-0.5 rounded-full font-bold ${cls}`}>{isRtl ? ar : en}</span>;
}

function CheckoutModal({
  purchase,
  instructions,
  isRtl,
  onClose,
  onSubmitted,
}: {
  purchase: Purchase;
  instructions: string;
  isRtl: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [method, setMethod] = useState<'vodafone_cash' | 'instapay' | 'other'>('vodafone_cash');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const title =
    purchase.kind === 'THEME'
      ? `${isRtl ? 'شراء ثيم' : 'Buy theme'}: ${isRtl ? getThemeById(purchase.themeId).nameAr : getThemeById(purchase.themeId).nameEn}`
      : purchase.kind === 'PREMIUM_YEARLY'
      ? isRtl ? 'اشتراك بريميوم سنوي' : 'Premium Yearly'
      : isRtl ? 'اشتراك بريميوم شهري' : 'Premium Monthly';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: purchase.kind,
        themeId: purchase.kind === 'THEME' ? purchase.themeId : undefined,
        method,
        reference,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Error');
      return;
    }
    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
        className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-amber-400/30 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-black">{title}</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-3xl font-black text-amber-300">
          {purchase.price} <span className="text-sm text-zinc-400">{isRtl ? 'ج.م' : 'EGP'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm whitespace-pre-line leading-relaxed">
          {instructions ||
            (isRtl
              ? 'طرق الدفع لم تُضف بعد. تواصل مع الإدارة.'
              : 'Payment details have not been added yet. Please contact support.')}
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-zinc-300">{isRtl ? 'دفعت بإيه؟' : 'How did you pay?'}</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['vodafone_cash', 'فودافون كاش', 'Vodafone Cash'],
                ['instapay', 'إنستاباي', 'InstaPay'],
                ['other', 'طريقة أخرى', 'Other'],
              ] as const
            ).map(([id, ar, en]) => (
              <button
                type="button"
                key={id}
                onClick={() => setMethod(id)}
                className={`py-2 rounded-xl text-xs font-bold border ${
                  method === id ? 'bg-amber-400 text-black border-amber-400' : 'border-white/10 text-zinc-300'
                }`}
              >
                {isRtl ? ar : en}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-zinc-300">
            {isRtl ? 'الرقم اللي حوّلت منه أو رقم العملية' : 'Number you paid from, or transaction ID'}
          </label>
          <input
            required
            minLength={3}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            dir="ltr"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-amber-400/60"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-2xl font-black bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isRtl ? 'دفعت، فعّل طلبي' : "I've paid, activate it"}
        </button>
        <p className="text-[11px] text-zinc-500 text-center">
          {isRtl ? 'هنراجع التحويل ونفعّل طلبك في أقرب وقت' : "We'll verify the transfer and activate it shortly"}
        </p>
      </form>
    </div>
  );
}
