'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { personasConfig, PersonaConfig, FormField, FormStep } from '../config/personasConfig';

interface DynamicFormProps {
  personaId: string;
}

/* ── Phone Mask ── */
function maskPhone(v: string): string {
  const d = v.replace(/\D/g, '').substring(0, 11);
  if (d.length > 6) return `(${d.substring(0, 2)}) ${d.substring(2, 7)}-${d.substring(7)}`;
  if (d.length > 2) return `(${d.substring(0, 2)}) ${d.substring(2)}`;
  if (d.length > 0) return `(${d}`;
  return '';
}

/* ── Format Currency ── */
function fmtCurrency(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ── Analytics helper ── */
function track(ev: string, data: Record<string, unknown>) {
  try {
    const w = window as unknown as Record<string, unknown>;
    if (w.dataLayer) (w.dataLayer as unknown[]).push({ event: ev, ...data });
    if (w.fbq) (w.fbq as Function)('trackCustom', ev, data);
  } catch { /* silent */ }
}

/* ── Identifier Capture (Ciclo Infinito de Dados) ── */
function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

function captureIdentifiers(): Record<string, string> {
  const stored = sessionStorage.getItem('tf_ids');
  if (stored) return JSON.parse(stored);

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid') || '';

  const ids: Record<string, string> = {
    ref: 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    fbc: getCookie('_fbc') || (fbclid ? 'fb.1.' + Date.now() + '.' + fbclid : ''),
    fbp: getCookie('_fbp') || '',
    gclid: params.get('gclid') || '',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    lp: window.location.pathname.replace(/\//g, '') || 'home',
    landing_time: new Date().toISOString(),
  };

  sessionStorage.setItem('tf_ids', JSON.stringify(ids));
  return ids;
}

const WA_NUMBER = '5511930048940';

export default function DynamicForm({ personaId }: DynamicFormProps) {
  const config = personasConfig[personaId];

  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string | number>>({});
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    track('form_view', { persona: personaId, tier: config?.tier });
  }, [personaId, config?.tier]);

  if (!config) {
    return <div className="p-4 text-red-500">Persona &ldquo;{personaId}&rdquo; não configurada.</div>;
  }

  const currentStep = config.steps[step];
  const isLast = step === config.steps.length - 1;
  const isDark = config.theme === 'dark';

  const handleChange = (fieldId: string, value: string | number) => {
    setData(prev => ({ ...prev, [fieldId]: value }));
    if (!started) {
      setStarted(true);
      track('form_start', { persona: personaId, field: fieldId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track('cta_click', { persona: personaId, step: step + 1, cta: currentStep.ctaText });

    if (!isLast) {
      setStep(s => s + 1);
      return;
    }

    // Final submit
    const ids = captureIdentifiers();
    track('form_submit', { persona: personaId, tier: config.tier, ref: ids.ref });
    try {
      const w = window as unknown as Record<string, unknown>;
      if (w.gtag) (w.gtag as Function)('event', 'conversion', { send_to: 'AW-18226518834/kTjGCO35_r0cELK2ivND' });
      if (w.fbq) (w.fbq as Function)('track', 'Lead');
    } catch { /* silent */ }

    // Send to Sheets — enriched with identifiers
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.nome || '',
        email: data.email || '',
        phone: data.whatsapp || '',
        segment: personaId,
        credit: String(data.parcela || data.bem_desejado || ''),
        months: 0,
        plan: 'LP-' + personaId,
        origin: typeof window !== 'undefined' ? window.location.href : '',
        ref: ids.ref,
        fbc: ids.fbc,
        fbp: ids.fbp,
        gclid: ids.gclid,
        utm_source: ids.utm_source,
        utm_medium: ids.utm_medium,
        utm_campaign: ids.utm_campaign,
        utm_content: ids.utm_content,
        lp: ids.lp,
      }),
    }).catch(() => {});

    // WhatsApp redirect with ref
    const msg = config.whatsappTemplate
      .replace('[bem_desejado]', String(data.bem_desejado || 'consórcio'))
      .replace('[parcela]', data.parcela ? `R$ ${fmtCurrency(Number(data.parcela))}` : 'A combinar')
      + '\n\nRef: ' + ids.ref;

    const waUrl = `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;

    setSubmitted(true);
    setTimeout(() => window.open(waUrl, '_blank'), 800);
  };

  if (submitted) {
    return (
      <div className={`w-full max-w-md mx-auto p-8 rounded-2xl border text-center ${isDark ? 'bg-[#1a1a1a] border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="text-5xl mb-3">✅</div>
        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`} style={{ fontFamily: 'var(--font-jakarta)' }}>
          Proposta enviada!
        </h3>
        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
          Abrindo o WhatsApp em instantes...
        </p>
      </div>
    );
  }

  const renderField = (field: FormField) => {
    if (field.type === 'range') {
      const val = Number(data[field.id] || field.defaultValue || 0);
      return (
        <div className="py-2">
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={val}
            onChange={e => handleChange(field.id, Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-amber-500"
            style={{ background: isDark ? '#333' : '#e5e5e5' }}
          />
          <div className="flex justify-between mt-2 text-xs" style={{ color: isDark ? '#666' : '#aaa', fontFamily: 'var(--font-jakarta)' }}>
            <span>R$ {fmtCurrency(field.min!)}</span>
            <span className="text-amber-500 font-bold text-base">R$ {fmtCurrency(val)}{field.suffix || '/mês'}</span>
            <span>R$ {fmtCurrency(field.max!)}</span>
          </div>
        </div>
      );
    }

    return (
      <input
        type={field.type}
        required={field.required}
        placeholder={field.placeholder}
        value={String(data[field.id] || '')}
        onChange={e => {
          const v = field.type === 'tel' ? maskPhone(e.target.value) : e.target.value;
          handleChange(field.id, v);
        }}
        className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
          isDark
            ? 'bg-[#111] border-zinc-800 text-white placeholder-zinc-600'
            : 'bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400'
        }`}
        style={{ fontFamily: 'var(--font-jakarta)' }}
      />
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl border shadow-xl transition-all ${
      isDark ? 'bg-[#1a1a1a] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
    }`}>
      {/* Progress */}
      {config.steps.length > 1 && (
        <div className="flex gap-1 mb-5">
          {config.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-amber-500' : isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>
      )}

      <h3 className="text-xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
        {currentStep.title}
      </h3>
      {currentStep.subtitle && (
        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`} style={{ fontFamily: 'var(--font-jakarta)' }}>
          {currentStep.subtitle}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStep.fields.map(field => (
          <div key={field.id}>
            <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-amber-500 mb-1.5" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {field.label}
            </label>
            {renderField(field)}
          </div>
        ))}

        <button
          type="submit"
          className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #d4a017, #e8b82e)',
            color: '#111',
            fontFamily: 'var(--font-jakarta)',
            boxShadow: '0 4px 16px rgba(212,160,23,.2)',
          }}
        >
          {isLast && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          )}
          {currentStep.ctaText}
        </button>

        <div className={`flex items-center justify-center gap-1.5 text-[11px] pt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          <span>🔒</span>
          <span>{config.securityBadge || 'Dados protegidos.'}</span>
        </div>

        {config.proofText && step === 0 && (
          <div className={`text-center text-xs pt-2 ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>
            ✓ {config.proofText}
          </div>
        )}
      </form>
    </div>
  );
}
