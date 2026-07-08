'use client';

import { useState, useEffect, useRef } from 'react';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  segment: string;
  credit: string;
  months: number;
  lp: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  fbc: string;
  fbp: string;
  fbp: string;
  gclid: string;
  status: string;
  notes: string;
  revenue: number | null;
  created_at: string;
  updated_at: string;
}

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: number, updates: { status?: string; notes?: string; revenue?: number | null }) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Novo:        '#3b82f6',
  Qualificado: '#eab308',
  Vendido:     '#0A7B3E',
  Perdido:     '#ef4444',
};

const STATUS_BG: Record<string, string> = {
  Novo:        'rgba(59,130,246,0.12)',
  Qualificado: 'rgba(234,179,8,0.12)',
  Vendido:     'rgba(10,123,62,0.12)',
  Perdido:     'rgba(239,68,68,0.12)',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
      color: 'var(--admin-text-mute)', textTransform: 'uppercase' as const,
      marginBottom: '12px', paddingBottom: '8px',
      borderBottom: '1px solid var(--admin-border)',
    }}>
      {children}
    </div>
  );
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px', marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', color: 'var(--admin-text-mute)', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: '13px', color: 'var(--admin-text)',
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-all' as const, lineHeight: 1.5,
      }}>
        {value || <span style={{ color: 'var(--admin-text-mute)' }}>—</span>}
      </span>
    </div>
  );
}

function SignalBadge({ label, value, present }: { label: string; value?: string; present: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
        backgroundColor: present ? '#0A7B3E' : 'var(--admin-border)',
        boxShadow: present ? '0 0 6px rgba(10,123,62,0.6)' : 'none',
      }}/>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: present ? 'var(--admin-text)' : 'var(--admin-text-mute)' }}>
          {label}
        </div>
        {present && value && (
          <div style={{ fontSize: '11px', color: 'var(--admin-text-mute)', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>
            {value.substring(0, 48)}{value.length > 48 ? '…' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

function formatBRL(value: string): string {
  const num = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function LeadDrawer({ lead, onClose, onUpdate }: LeadDrawerProps) {
  const [localNotes, setLocalNotes] = useState('');
  const [localStatus, setLocalStatus] = useState('');
  const [localRevenue, setLocalRevenue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync state when lead changes
  useEffect(() => {
    if (lead) {
      setLocalNotes(lead.notes ?? '');
      setLocalStatus(lead.status ?? 'Novo');
      setLocalRevenue(lead.revenue ? String(lead.revenue) : '');
    }
  }, [lead]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (lead) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lead]);

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    try {
      const parsedRevenue = localRevenue ? parseFloat(localRevenue.replace(',', '.')) : null;
      const finalRevenue = isNaN(parsedRevenue as any) ? null : parsedRevenue;
      
      onUpdate(lead.id, { 
        notes: localNotes, 
        status: localStatus,
        revenue: localStatus === 'Vendido' ? finalRevenue : null
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const isOpen = lead !== null;

  return (
    <>
      <style>{`
        @keyframes drawer-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawer-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .drawer-textarea:focus { outline: none; border-color: var(--admin-brand-mid) !important; }
        .drawer-select:focus { outline: none; border-color: var(--admin-brand-mid) !important; }
        .drawer-select option { background: var(--admin-surface); color: var(--admin-text); }
        .drawer-save-btn:not(:disabled):hover { background: var(--admin-brand-tint) !important; border-color: var(--admin-brand-tint2) !important; color: var(--admin-brand) !important; }
        .drawer-close:hover { background: var(--admin-bg2) !important; }
      `}</style>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed' as const, inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            animation: 'drawer-fade-in 200ms ease forwards',
          }}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={lead ? `Detalhes de ${lead.name}` : ''}
        style={{
          position: 'fixed' as const, top: 0, right: 0, bottom: 0, zIndex: 101,
          width: '420px', maxWidth: '95vw',
          backgroundColor: 'var(--admin-surface)',
          borderLeft: '1px solid var(--admin-border)',
          overflowY: 'auto' as const,
          display: 'flex', flexDirection: 'column' as const,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(.22,1,.36,1)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.4)',
        }}
      >
        {lead && (
          <>
            {/* ── Header ──────────────────────────────── */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--admin-border)',
              display: 'flex', alignItems: 'flex-start', gap: '12px', flexShrink: 0,
              position: 'sticky' as const, top: 0, zIndex: 10,
              backgroundColor: 'var(--admin-surface)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', lineHeight: 1.3 }}>
                  {lead.name}
                </h2>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px', fontWeight: 600,
                  color: STATUS_COLORS[lead.status] ?? '#fff',
                  background: STATUS_BG[lead.status] ?? 'rgba(255,255,255,0.08)',
                  border: `1px solid ${STATUS_COLORS[lead.status] ?? '#fff'}33`,
                  borderRadius: '5px', padding: '2px 8px',
                  letterSpacing: '0.04em',
                }}>
                  {lead.status || 'Novo'}
                </span>
              </div>

              <button
                onClick={onClose}
                className="drawer-close"
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--admin-bg2)', border: '1px solid var(--admin-border)',
                  color: 'var(--admin-text-mute)', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 140ms ease',
                }}
                aria-label="Fechar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── Body ──────────────────────────────── */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '28px' }}>

              {/* Section: Dados do Lead */}
              <section>
                <SectionTitle>Dados do Lead</SectionTitle>

                <DataRow
                  label="Telefone"
                  value={
                    <a
                      href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {lead.phone}
                    </a>
                  }
                />
                <DataRow label="E-mail" value={lead.email} />
                <DataRow label="Segmento" value={`${lead.segment === 'imovel' ? '🏠' : '🚗'} ${lead.segment}`} />
                <DataRow label="Crédito" value={formatBRL(lead.credit)} />
                <DataRow label="Prazo" value={lead.months ? `${lead.months} meses` : undefined} />
                <DataRow label="Landing Page" value={lead.lp} mono />
                <DataRow label="UTM Source" value={lead.utm_source} />
                <DataRow label="UTM Medium" value={lead.utm_medium} />
                <DataRow label="UTM Campaign" value={lead.utm_campaign} />
                <DataRow label="Criado em" value={formatDate(lead.created_at)} />
              </section>

              {/* Section: Sinais de Atribuição */}
              <section>
                <SectionTitle>Sinais de Atribuição</SectionTitle>
                <SignalBadge label="fbc (Meta Click ID)" value={lead.fbc} present={!!lead.fbc} />
                <SignalBadge label="fbp (Meta Browser ID)" present={!!lead.fbp} />
                <SignalBadge label="gclid (Google Click ID)" value={lead.gclid} present={!!lead.gclid} />
              </section>

              {/* Section: Status */}
              <section>
                <SectionTitle>Status</SectionTitle>
                <select
                  className="drawer-select"
                  value={localStatus}
                  onChange={e => setLocalStatus(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
                    color: STATUS_COLORS[localStatus] ?? 'var(--admin-text)',
                    background: STATUS_BG[localStatus] ?? 'var(--admin-brand-tint)',
                    border: `1px solid ${STATUS_COLORS[localStatus] ?? 'var(--admin-border)'}44`,
                    cursor: 'pointer', marginBottom: '4px',
                    transition: 'border-color 140ms ease',
                    fontWeight: 600,
                  }}
                >
                  {['Novo', 'Qualificado', 'Vendido', 'Perdido'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                
                {localStatus === 'Vendido' && (
                  <div style={{ marginTop: '12px', animation: 'drawer-fade-in 200ms ease forwards' }}>
                    <label style={{ fontSize: '11px', color: 'var(--admin-text-mute)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                      Valor da Venda (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="drawer-select"
                      placeholder="Ex: 50000.00"
                      value={localRevenue}
                      onChange={e => setLocalRevenue(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
                        color: 'var(--admin-text)', background: 'var(--admin-input-bg)',
                        border: '1px solid var(--admin-input-border)',
                        transition: 'border-color 140ms ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}
              </section>

              {/* Section: Notas */}
              <section>
                <SectionTitle>Notas</SectionTitle>
                <textarea
                  className="drawer-textarea"
                  value={localNotes}
                  onChange={e => setLocalNotes(e.target.value)}
                  placeholder="Adicione notas sobre este lead..."
                  rows={5}
                  style={{
                    width: '100%', boxSizing: 'border-box' as const,
                    padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
                    color: 'var(--admin-text)', background: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-input-border)',
                    resize: 'vertical' as const, lineHeight: 1.6, fontFamily: 'inherit',
                    transition: 'border-color 140ms ease',
                    marginBottom: '12px',
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="drawer-save-btn"
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                    color: savedFlash ? 'var(--admin-brand)' : (saving ? 'var(--admin-text-mute)' : 'var(--admin-text)'),
                    background: savedFlash ? 'var(--admin-brand-tint)' : 'var(--admin-bg2)',
                    border: savedFlash ? '1px solid var(--admin-brand-tint2)' : '1px solid var(--admin-border)',
                    transition: 'all 200ms ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  {saving ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                           style={{ animation: 'admin-spin 0.75s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                      </svg>
                      Salvando...
                    </>
                  ) : savedFlash ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Salvo!
                    </>
                  ) : (
                    'Salvar Notas & Status'
                  )}
                </button>
              </section>

            </div>
          </>
        )}
      </div>
      <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
