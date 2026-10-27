'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Check, X, Loader2, Save } from 'lucide-react';
import { getThemeById } from '@/lib/themes';

interface PaymentRow {
  id: string;
  kind: string;
  themeId: string | null;
  amount: number;
  method: string;
  reference: string;
  status: string;
  createdAt: string;
  user: { username: string; email: string; premiumUntil: string | null };
}

const METHOD_LABELS: Record<string, string> = {
  vodafone_cash: 'فودافون كاش',
  instapay: 'إنستاباي',
  other: 'أخرى',
};

function itemLabel(r: PaymentRow) {
  if (r.kind === 'THEME') return `ثيم: ${getThemeById(r.themeId || '').nameAr}`;
  return r.kind === 'PREMIUM_YEARLY' ? 'بريميوم سنوي' : 'بريميوم شهري';
}

export function PaymentsAdminPanel() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingText, setSavingText] = useState(false);
  const [savedText, setSavedText] = useState(false);

  const load = async () => {
    const data = await fetch('/api/admin/payments').then((r) => r.json()).catch(() => null);
    if (data && !data.error) {
      setRows(data.requests);
      setInstructions(data.paymentInstructions);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (row: PaymentRow, action: 'approve' | 'reject') => {
    const verb = action === 'approve' ? 'تفعيل' : 'رفض';
    if (!confirm(`${verb} طلب @${row.user.username} (${itemLabel(row)} — ${row.amount} ج.م)؟`)) return;
    setBusyId(row.id);
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data.error || 'Error');
    setBusyId(null);
    load();
  };

  const saveInstructions = async () => {
    setSavingText(true);
    await fetch('/api/admin/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentInstructions: instructions }),
    });
    setSavingText(false);
    setSavedText(true);
    setTimeout(() => setSavedText(false), 2000);
  };

  const pending = rows.filter((r) => r.status === 'PENDING');
  const revenue = rows.filter((r) => r.status === 'APPROVED').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            المدفوعات وتفعيل الثيمات
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            تأكد إن التحويل وصلك فعلًا قبل ما تفعّل أي طلب.
          </p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30">
            <div className="text-lg font-black text-amber-300">{pending.length}</div>
            <div className="text-[10px] text-zinc-400">قيد المراجعة</div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-lg font-black text-emerald-300">{revenue} ج.م</div>
            <div className="text-[10px] text-zinc-400">إجمالي المفعّل</div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
        <h3 className="text-sm font-bold">طرق الدفع اللي بتظهر للمشتري</h3>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={'مثال:\nفودافون كاش: 010xxxxxxxx\nإنستاباي: name@instapay\nبعد التحويل اكتب الرقم اللي حوّلت منه.'}
          className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:border-amber-400/60"
        />
        <button
          onClick={saveInstructions}
          disabled={savingText}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-60"
        >
          {savingText ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedText ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {savedText ? 'اتحفظ' : 'حفظ'}
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-500">مفيش طلبات دفع لسه.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-xs text-start">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="p-3 text-start">المستخدم</th>
                <th className="p-3 text-start">الطلب</th>
                <th className="p-3 text-start">المبلغ</th>
                <th className="p-3 text-start">الدفع</th>
                <th className="p-3 text-start">التاريخ</th>
                <th className="p-3 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 align-middle">
                  <td className="p-3">
                    <div className="font-bold">@{r.user.username}</div>
                    <div dir="ltr" className="text-zinc-500 text-end">{r.user.email}</div>
                  </td>
                  <td className="p-3">{itemLabel(r)}</td>
                  <td className="p-3 font-black text-amber-300">{r.amount} ج.م</td>
                  <td className="p-3">
                    <div>{METHOD_LABELS[r.method] || r.method}</div>
                    <div dir="ltr" className="font-mono text-zinc-400 text-end">{r.reference}</div>
                  </td>
                  <td className="p-3 text-zinc-400">{new Date(r.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-3">
                    {r.status === 'PENDING' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => review(r, 'approve')}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black font-black disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> تفعيل
                        </button>
                        <button
                          onClick={() => review(r, 'reject')}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 font-black disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> رفض
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full font-bold ${
                          r.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                        }`}
                      >
                        {r.status === 'APPROVED' ? 'مفعّل' : 'مرفوض'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
