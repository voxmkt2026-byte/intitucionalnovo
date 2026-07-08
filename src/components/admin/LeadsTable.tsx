'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import LeadDrawer from './LeadDrawer';
import type { Lead } from './LeadDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  status: string;
  segmento: string;
  utm_source: string;
  q: string;
  data_inicio: string;
  data_fim: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Novo:        '#3b82f6',
  Qualificado: '#eab308',
  Vendido:     '#10b981',
  Perdido:     '#ef4444',
};

const STATUS_BG: Record<string, string> = {
  Novo:        'rgba(59,130,246,0.1)',
  Qualificado: 'rgba(234,179,8,0.1)',
  Vendido:     'rgba(16,185,129,0.1)',
  Perdido:     'rgba(239,68,68,0.1)',
};

const INITIAL_FILTERS: Filters = {
  status: '', segmento: '', utm_source: '', q: '', data_inicio: '', data_fim: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: string): string {
  const num = parseFloat((value ?? '').replace(/[^\d.]/g, ''));
  if (isNaN(num)) return value ?? '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
  } catch { return dateStr; }
}

function segmentIcon(segment: string) {
  if (segment === 'imovel') return '🏠';
  if (segment === 'veiculos') return '🚗';
  return '📦';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InputField({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
        color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontFamily: 'inherit',
        minWidth: 0, width: '100%', boxSizing: 'border-box' as const,
      }}
    />
  );
}

function SelectField({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
        color: 'rgba(255,255,255,0.8)', background: '#0b0f17',
        border: '1px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer',
        minWidth: 0, width: '100%', boxSizing: 'border-box' as const,
      }}
    >
      {children}
    </select>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} style={{ padding: '14px 16px' }}>
              <div style={{
                height: '14px', borderRadius: '5px',
                background: 'rgba(255,255,255,0.06)',
                animation: 'skel-pulse 1.4s ease-in-out infinite',
                animationDelay: `${(i + j) * 0.05}s`,
                width: j === 0 ? '60px' : j === 1 ? '120px' : j === 4 ? '50px' : '80px',
              }}/>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SignalDots({ lead }: { lead: Lead }) {
  const signals = [
    { key: 'fbc', label: 'Meta fbc', val: lead.fbc },
    { key: 'fbp', label: 'Meta fbp', val: lead.fbp },
    { key: 'gclid', label: 'Google gclid', val: lead.gclid },
  ];
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {signals.map(({ key, label, val }) => (
        <div key={key} title={val ? `${label}: ${val.substring(0, 32)}` : `${label}: ausente`}
          style={{
            width: '8px', height: '8px', borderRadius: '50%', cursor: 'default',
            backgroundColor: val ? '#10b981' : 'rgba(255,255,255,0.12)',
            boxShadow: val ? '0 0 5px rgba(16,185,129,0.55)' : 'none',
            transition: 'transform 150ms ease',
          }}
        />
      ))}
    </div>
  );
}

function StatusSelect({ lead, onUpdate }: { lead: Lead; onUpdate: (id: number, updates: { status?: string }) => void }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    setSaving(true);
    onUpdate(lead.id, { status: newStatus });
    try {
      await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      onUpdate(lead.id, { status: lead.status });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {saving && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={STATUS_COLORS[lead.status] ?? '#fff'} strokeWidth="2.5"
             style={{ animation: 'admin-spin 0.75s linear infinite', flexShrink: 0 }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
        </svg>
      )}
      <select
        value={lead.status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        style={{
          padding: '3px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 600,
          color: STATUS_COLORS[lead.status] ?? '#fff',
          background: STATUS_BG[lead.status] ?? 'rgba(255,255,255,0.05)',
          border: `1px solid ${STATUS_COLORS[lead.status] ?? '#fff'}33`,
          cursor: saving ? 'not-allowed' : 'pointer', outline: 'none',
        }}
      >
        {['Novo', 'Qualificado', 'Vendido', 'Perdido'].map(s => (
          <option key={s} value={s} style={{ background: '#0b0f17', color: '#fff' }}>{s}</option>
        ))}
      </select>
    </div>
  );
}

// Mobile Card
function MobileLeadCard({ lead, onSelect, onUpdate }: {
  lead: Lead;
  onSelect: (l: Lead) => void;
  onUpdate: (id: number, updates: { status?: string; notes?: string }) => void;
}) {
  return (
    <div style={{
      background: '#0b0f17', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{lead.name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{formatDate(lead.created_at)}</div>
        </div>
        <StatusSelect lead={lead} onUpdate={onUpdate} />
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
        <span style={{
          fontSize: '12px', padding: '3px 8px', borderRadius: '5px',
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
        }}>
          {segmentIcon(lead.segment)} {formatBRL(lead.credit)}
        </span>
        {lead.utm_source && (
          <span style={{
            fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
            background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)',
          }}>
            {lead.utm_source}
          </span>
        )}
        <SignalDots lead={lead} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
           target="_blank" rel="noopener noreferrer"
           style={{
             flex: 1, textAlign: 'center' as const, padding: '7px', borderRadius: '7px', fontSize: '12px',
             background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)',
             color: '#25D366', textDecoration: 'none', fontWeight: 600,
           }}>
          WhatsApp
        </a>
        <button onClick={() => onSelect(lead)}
          style={{
            flex: 1, padding: '7px', borderRadius: '7px', fontSize: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          }}>
          📋 Notas
        </button>
      </div>
    </div>
  );
}


// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [sort, setSort] = useState<string>('created_at');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Responsive ──
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Fetch ──
  const fetchLeads = useCallback(async (p: number, f: Filters, s: string, d: 'asc' | 'desc') => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '20');
      params.set('sort', s);
      params.set('dir', d);
      if (f.q)          params.set('q', f.q);
      if (f.status)     params.set('status', f.status);
      if (f.segmento)   params.set('segmento', f.segmento);
      if (f.utm_source) params.set('utm_source', f.utm_source);
      if (f.data_inicio) params.set('data_inicio', f.data_inicio);
      if (f.data_fim)   params.set('data_fim', f.data_fim);

      const res = await fetch(`/api/admin/leads?${params.toString()}`, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json() as { leads: Lead[]; meta: Meta };
      setLeads(json.leads ?? []);
      setMeta(json.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(page, filters, sort, dir);
  }, [page, filters, sort, dir, fetchLeads]);

  // ── Optimistic update ──
  function handleUpdate(id: number, updates: { status?: string; notes?: string }) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (selectedLead?.id === id) {
      setSelectedLead(prev => prev ? { ...prev, ...updates } : prev);
    }
  }

  // ── Filter helpers ──
  function setFilter(key: keyof Filters, val: string) {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  }
  function clearFilters() { setFilters(INITIAL_FILTERS); setPage(1); }

  // ── Sort helper ──
  function handleSort(col: string) {
    if (sort === col) setDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setDir('desc'); }
  }

  const SortArrow = ({ col }: { col: string }) => {
    if (sort !== col) return <span style={{ opacity: 0.2, marginLeft: 3 }}>↕</span>;
    return <span style={{ color: '#10b981', marginLeft: 3 }}>{dir === 'asc' ? '↑' : '↓'}</span>;
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255,255,255,0.07)', userSelect: 'none', whiteSpace: 'nowrap',
    cursor: 'pointer',
  };

  const tdStyle: React.CSSProperties = {
    padding: '13px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle',
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <>
      <style>{`
        @keyframes skel-pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.9; } }
        @keyframes admin-spin  { to { transform:rotate(360deg); } }
        .lt-row:hover td { background: rgba(255,255,255,0.025) !important; }
        .lt-th:hover { color: rgba(255,255,255,0.65) !important; }
        .lt-clear:hover { border-color: rgba(239,68,68,0.4) !important; color: rgba(239,68,68,0.8) !important; }
        .lt-page-btn:not(:disabled):hover { background: rgba(255,255,255,0.1) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>

        {/* ── Filters Bar ──────────────────────────────────────────── */}
        <div style={{
          background: '#0b0f17', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', padding: '16px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(160px,1fr) 130px 130px minmax(120px,1fr) 140px 140px auto',
          gap: '10px', alignItems: 'end',
        }}>
          {/* Search */}
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', fontWeight: 500 }}>
              Pesquisar
            </div>
            <InputField value={filters.q} onChange={v => setFilter('q', v)} placeholder="Nome ou telefone…" />
          </div>

          {/* Status */}
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', fontWeight: 500 }}>
              Status
            </div>
            <SelectField value={filters.status} onChange={v => setFilter('status', v)}>
              <option value="">Todos</option>
              {['Novo','Qualificado','Vendido','Perdido'].map(s => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </div>

          {/* Segmento */}
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', fontWeight: 500 }}>
              Segmento
            </div>
            <SelectField value={filters.segmento} onChange={v => setFilter('segmento', v)}>
              <option value="">Todos</option>
              <option value="imovel">🏠 Imóvel</option>
              <option value="veiculos">🚗 Veículos</option>
            </SelectField>
          </div>

          {/* UTM Source */}
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', fontWeight: 500 }}>
              UTM Source
            </div>
            <InputField value={filters.utm_source} onChange={v => setFilter('utm_source', v)} placeholder="facebook, google…" />
          </div>

          {/* Data início */}
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', fontWeight: 500 }}>
              De
            </div>
            <InputField value={filters.data_inicio} onChange={v => setFilter('data_inicio', v)} placeholder="" type="date" />
          </div>

          {/* Data fim */}
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', fontWeight: 500 }}>
              Até
            </div>
            <InputField value={filters.data_fim} onChange={v => setFilter('data_fim', v)} placeholder="" type="date" />
          </div>

          {/* Clear */}
          <button
            onClick={clearFilters}
            className="lt-clear"
            disabled={!hasActiveFilters}
            style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              color: hasActiveFilters ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
              transition: 'all 140ms ease', whiteSpace: 'nowrap' as const,
              alignSelf: 'flex-end',
            }}
          >
            Limpar
          </button>
        </div>

        {/* ── Results count ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            {loading ? (
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>Carregando…</span>
            ) : (
              <span>
                <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{meta.total}</strong> leads encontrados
              </span>
            )}
          </div>
          {!loading && meta.totalPages > 1 && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              Página {meta.page} de {meta.totalPages}
            </div>
          )}
        </div>

        {/* ── Mobile Cards / Desktop Table ─────────────────────────── */}
        {isMobile ? (
          // MOBILE VIEW
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  background: '#0b0f17', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px', padding: '16px', height: '110px',
                  animation: 'skel-pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}/>
              ))
            ) : leads.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
              leads.map(lead => (
                <MobileLeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} onUpdate={handleUpdate} />
              ))
            )}
          </div>
        ) : (
          // DESKTOP TABLE
          <div style={{
            background: '#0b0f17', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {[
                      { label: 'Data',     col: 'created_at' },
                      { label: 'Lead',     col: 'name'       },
                      { label: 'Segmento', col: 'segment'    },
                      { label: 'Origem',   col: 'utm_source' },
                      { label: 'Sinais',   col: ''           },
                      { label: 'Status',   col: 'status'     },
                      { label: 'Ações',    col: ''           },
                    ].map(({ label, col }) => (
                      <th
                        key={label}
                        className="lt-th"
                        style={thStyle}
                        onClick={col ? () => handleSort(col) : undefined}
                        aria-sort={sort === col ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        {label}{col && <SortArrow col={col} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <SkeletonRows />
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '60px 20px' }}>
                        <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                      </td>
                    </tr>
                  ) : (
                    leads.map(lead => (
                      <tr key={lead.id} className="lt-row" style={{ transition: 'background 120ms ease' }}>
                        {/* Date */}
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.4)', fontSize: '12px', whiteSpace: 'nowrap' as const }}>
                          {formatDate(lead.created_at)}
                        </td>
                        {/* Lead */}
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '2px', lineHeight: 1.3 }}>{lead.name}</div>
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                              fontSize: '11px', color: '#25D366', textDecoration: 'none',
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            {lead.phone}
                          </a>
                        </td>
                        {/* Segmento */}
                        <td style={tdStyle}>
                          <div style={{ fontSize: '13px', marginBottom: '2px' }}>
                            {segmentIcon(lead.segment)} {lead.segment}
                          </div>
                          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                            {formatBRL(lead.credit)}
                          </div>
                        </td>
                        {/* Origem */}
                        <td style={tdStyle}>
                          {lead.utm_source ? (
                            <span style={{
                              display: 'inline-block', fontSize: '11px', fontWeight: 600,
                              padding: '2px 7px', borderRadius: '4px',
                              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                              color: '#3b82f6', marginBottom: '3px',
                            }}>
                              {lead.utm_source}
                            </span>
                          ) : null}
                          {lead.lp && (
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                              {lead.lp}
                            </div>
                          )}
                        </td>
                        {/* Sinais */}
                        <td style={tdStyle}><SignalDots lead={lead} /></td>
                        {/* Status */}
                        <td style={tdStyle}><StatusSelect lead={lead} onUpdate={handleUpdate} /></td>
                        {/* Actions */}
                        <td style={tdStyle}>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', whiteSpace: 'nowrap' as const,
                            }}
                          >
                            📋 Notas
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────── */}
        {!loading && meta.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="lt-page-btn"
              style={{
                padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'background 140ms ease',
              }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', minWidth: '80px', textAlign: 'center' as const }}>
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="lt-page-btn"
              style={{
                padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                color: page === meta.totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', transition: 'background 140ms ease',
              }}
            >
              Próximo →
            </button>
          </div>
        )}
      </div>

      {/* ── Lead Drawer ─────────────────────────────────────────── */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleUpdate}
      />
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div style={{ textAlign: 'center' as const, padding: '48px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '36px', opacity: 0.4 }}>🔍</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
        Nenhum lead encontrado
      </div>
      {hasFilters && (
        <>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Tente remover alguns filtros ou ampliar o período
          </div>
          <button
            onClick={onClear}
            style={{
              marginTop: '4px', padding: '7px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              cursor: 'pointer',
            }}
          >
            Limpar filtros
          </button>
        </>
      )}
    </div>
  );
}
