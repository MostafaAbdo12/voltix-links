'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Download, Trash2, Globe, Check, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface SubscriberRow {
  id: string;
  email: string;
  country: string;
  createdAt: string;
}

interface DomainStatus {
  verified: boolean;
  misconfigured: boolean;
  verification: { type: string; domain: string; value: string }[];
}

const cardClass = 'p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4';
const inputClass =
  'w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-sm outline-none focus:border-amber-400/60';
const buttonClass =
  'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors disabled:opacity-50';

export function GrowthPanel({ isRtl = true }: { isRtl?: boolean }) {
  return (
    <div className="space-y-6">
      <SubscribersSection isRtl={isRtl} />
      <CustomDomainSection isRtl={isRtl} />
    </div>
  );
}

function SubscribersSection({ isRtl }: { isRtl: boolean }) {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/subscribers')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setSubscribers(data.subscribers);
          setEnabled(data.settings.enabled);
          setTitle(data.settings.title);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async (next: { enabled?: boolean; title?: string }) => {
    setSaving(true);
    const res = await fetch('/api/subscribers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    const data = await res.json().catch(() => ({}));
    if (data.settings) {
      setEnabled(data.settings.enabled);
      setTitle(data.settings.title);
    }
    setSaving(false);
  };

  const removeSubscriber = async (id: string) => {
    if (!confirm(isRtl ? 'حذف هذا المشترك؟' : 'Remove this subscriber?')) return;
    await fetch(`/api/subscribers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setSubscribers((list) => list.filter((s) => s.id !== id));
  };

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>{isRtl ? 'قائمة المشتركين' : 'Email Subscribers'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isRtl
              ? 'اعرض نموذج اشتراك في صفحتك واجمع إيميلات زوارك'
              : 'Show a subscribe form on your page and collect visitor emails'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            disabled={saving || loading}
            onChange={(e) => saveSettings({ enabled: e.target.checked })}
            className="w-4 h-4 accent-amber-400"
          />
          {isRtl ? 'إظهار النموذج في صفحتي' : 'Show form on my page'}
        </label>
      </div>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder={isRtl ? 'عنوان النموذج (مثال: اشترك ليصلك كل جديد)' : 'Form heading (e.g. Get my weekly updates)'}
          className={inputClass}
        />
        <button
          onClick={() => saveSettings({ title })}
          disabled={saving}
          className={`${buttonClass} bg-amber-400 text-black hover:bg-amber-300`}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isRtl ? 'حفظ' : 'Save'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {isRtl ? `${subscribers.length} مشترك` : `${subscribers.length} subscribers`}
        </span>
        {subscribers.length > 0 && (
          <a href="/api/subscribers?format=csv" className={`${buttonClass} bg-white/10 hover:bg-white/15`}>
            <Download className="w-3.5 h-3.5" />
            {isRtl ? 'تحميل CSV' : 'Export CSV'}
          </a>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
      ) : subscribers.length === 0 ? (
        <p className="text-xs text-zinc-500">{isRtl ? 'لا يوجد مشتركون بعد' : 'No subscribers yet'}</p>
      ) : (
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-2 text-xs">
              <span dir="ltr" className="truncate text-zinc-200">
                {s.email}
              </span>
              <div className="flex items-center gap-3 shrink-0 text-zinc-500">
                <span>{new Date(s.createdAt).toLocaleDateString(isRtl ? 'ar' : 'en')}</span>
                <button onClick={() => removeSubscriber(s.id)} className="hover:text-red-400" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDomainSection({ isRtl }: { isRtl: boolean }) {
  const [configured, setConfigured] = useState(true);
  const [domain, setDomain] = useState<string | null>(null);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await fetch('/api/domains').then((r) => r.json()).catch(() => null);
    if (data && !data.error) {
      setConfigured(data.configured);
      setDomain(data.domain);
      setStatus(data.status);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const connect = async () => {
    setBusy(true);
    setError('');
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: input }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Error');
    } else {
      setDomain(data.domain);
      setStatus(data.status);
      setInput('');
    }
    setBusy(false);
  };

  const disconnect = async () => {
    if (!confirm(isRtl ? 'فصل الدومين؟' : 'Disconnect this domain?')) return;
    setBusy(true);
    await fetch('/api/domains', { method: 'DELETE' });
    setDomain(null);
    setStatus(null);
    setBusy(false);
  };

  const isApex = domain ? domain.split('.').length === 2 : false;
  const ready = status && status.verified && !status.misconfigured;

  return (
    <div className={cardClass}>
      <div>
        <h2 className="text-lg font-black flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>{isRtl ? 'دومين خاص' : 'Custom Domain'}</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {isRtl
            ? 'اربط دومينك الخاص (مثل links.yoursite.com) ليفتح صفحتك مباشرة'
            : 'Connect your own domain (e.g. links.yoursite.com) to open your page directly'}
        </p>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
      ) : !configured ? (
        <p className="text-xs text-zinc-500">
          {isRtl ? 'هذه الميزة غير مفعّلة على المنصة حاليًا.' : 'This feature is not enabled on the platform yet.'}
        </p>
      ) : domain ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a href={`https://${domain}`} target="_blank" rel="noreferrer" dir="ltr" className="font-bold text-cyan-300 hover:underline">
              {domain}
            </a>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  ready ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {ready ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {ready ? (isRtl ? 'يعمل' : 'Active') : isRtl ? 'بانتظار إعداد DNS' : 'Waiting for DNS'}
              </span>
              <button onClick={load} disabled={busy} className={`${buttonClass} bg-white/10 hover:bg-white/15`}>
                <RefreshCw className="w-3.5 h-3.5" />
                {isRtl ? 'تحقق' : 'Check'}
              </button>
              <button onClick={disconnect} disabled={busy} className={`${buttonClass} bg-red-500/15 text-red-300 hover:bg-red-500/25`}>
                {isRtl ? 'فصل' : 'Remove'}
              </button>
            </div>
          </div>

          {!ready && (
            <div className="space-y-2 text-xs">
              <p className="text-zinc-400">
                {isRtl ? 'أضف السجلات التالية في إعدادات DNS عند مزود الدومين:' : 'Add these records at your DNS provider:'}
              </p>
              <DnsTable
                isRtl={isRtl}
                rows={[
                  isApex
                    ? { type: 'A', name: '@', value: '76.76.21.21' }
                    : { type: 'CNAME', name: domain.split('.')[0], value: 'cname.vercel-dns.com' },
                  ...(status?.verification || []).map((v) => ({ type: v.type, name: v.domain, value: v.value })),
                ]}
              />
              <p className="text-zinc-500">
                {isRtl ? 'قد يستغرق تفعيل DNS من دقائق حتى 48 ساعة.' : 'DNS changes can take from minutes up to 48 hours.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              dir="ltr"
              placeholder="links.yoursite.com"
              className={inputClass}
            />
            <button
              onClick={connect}
              disabled={busy || !input.trim()}
              className={`${buttonClass} bg-cyan-400 text-black hover:bg-cyan-300`}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isRtl ? 'ربط' : 'Connect'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

function DnsTable({ rows, isRtl }: { rows: { type: string; name: string; value: string }[]; isRtl: boolean }) {
  return (
    <div dir="ltr" className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-[11px]">
        <thead className="bg-white/5 text-zinc-400">
          <tr>
            <th className="px-3 py-2">{isRtl ? 'النوع' : 'Type'}</th>
            <th className="px-3 py-2">{isRtl ? 'الاسم' : 'Name'}</th>
            <th className="px-3 py-2">{isRtl ? 'القيمة' : 'Value'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.type}-${r.name}-${r.value}`} className="border-t border-white/5">
              <td className="px-3 py-2 font-bold">{r.type}</td>
              <td className="px-3 py-2 font-mono">{r.name}</td>
              <td className="px-3 py-2 font-mono break-all">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
