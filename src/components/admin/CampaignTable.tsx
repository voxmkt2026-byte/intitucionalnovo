'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id:          string;
  name:        string;
  platform?:   'meta' | 'google';
  spend:       number;
  impressions: number;
  clicks:      number;
  ctr:         number;
  cpc:         number;
  reach:       number;
  leads:       number;
  cpl:         number | null;
  revenue:     number;
  roas:        number | null;
  roi:         number | null;
}

interface CampaignTotal {
  spend:       number;
  impressions: number;
  clicks:      number;
  leads:       number;
  ctr:         number;
  cpl?:        number | null;
  revenue:     number;
  roas?:       number | null;
  roi?:        number | null;
}

interface MetaInsightsData {
  campaigns:       Campaign[];
  total:           CampaignTotal;
  period:          string;
  since:           string;
  until:           string;
  accounts_found:  number;
  accounts:        { id: string; name: string }[];
  meta_available?: boolean;
  meta_error?:     string;
  meta_error_message?: string;
  google_available?: boolean;
  google_error_message?: string;
}

type Period = '7d' | '30d' | 'today';

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  }).format(v);
}
function fmtNum(v: number) {
  return new Intl.NumberFormat('pt-BR').format(v);
}
function fmtPct(v: number) {
  return `${v.toFixed(2)}%`;
}

// CPL target em BRL — abaixo é bom, acima é ruim
const CPL_TARGET = 80;

function CplBadge({ cpl }: { cpl: number | null }) {
  if (cpl === null) return <span style={{ color: 'var(--admin-text-mute)', fontSize: '12px' }}>—</span>;
  const good = cpl <= CPL_TARGET;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 700,
      backgroundColor: good ? 'rgba(10,123,62,0.1)' : 'rgba(239,68,68,0.1)',
      color: good ? '#0A7B3E' : '#ef4444',
      border: `1px solid ${good ? 'rgba(10,123,62,0.25)' : 'rgba(239,68,68,0.25)'}`,
    }}>
      {good ? (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      )}
      {fmtBRL(cpl)}
    </span>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--admin-border)', minWidth: '60px' }}>
        <div style={{ height: '100%', borderRadius: '2px', background: 'var(--admin-brand)', width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '12px', color: 'var(--admin-text-soft)', whiteSpace: 'nowrap' as const }}>
        {fmtBRL(value)}
      </span>
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      padding: '16px 20px', borderRadius: '12px',
      background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
      boxShadow: 'var(--admin-card-shadow)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em',
        color: 'var(--admin-text-mute)', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--admin-text)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--admin-text-mute)', marginTop: '4px' }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CampaignTable() {
  const [data,    setData]    = useState<MetaInsightsData | null>(null);
  const [period,  setPeriod]  = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchInsights = useCallback(async (p: Period) => {
    setLoading(true);
    setError(null);
    try {
      const [metaRes, googleRes] = await Promise.allSettled([
        fetch(`/api/admin/meta-insights?period=${p}`),
        fetch(`/api/admin/google-insights?period=${p}`)
      ]);

      let combinedData: MetaInsightsData | null = null;
      let metaErrorStr = '';

      if (metaRes.status === 'fulfilled' && metaRes.value.ok) {
        combinedData = await metaRes.value.json();
        // Tag meta campaigns
        if (combinedData) combinedData.campaigns.forEach(c => c.platform = 'meta');
      } else if (metaRes.status === 'fulfilled') {
        const errJson = await metaRes.value.json().catch(() => ({}));
        metaErrorStr = errJson.error || 'Erro Meta API';
      } else {
        metaErrorStr = metaRes.reason?.message || 'Erro Meta API';
      }

      if (googleRes.status === 'fulfilled' && googleRes.value.ok) {
        const googleData = await googleRes.value.json();
        if (!combinedData) {
          combinedData = googleData;
        } else {
          // Merge Google Data
          combinedData.campaigns = [...combinedData.campaigns, ...(googleData.campaigns || [])];
          combinedData.total.spend += googleData.total?.spend || 0;
          combinedData.total.impressions += googleData.total?.impressions || 0;
          combinedData.total.clicks += googleData.total?.clicks || 0;
          combinedData.total.leads += googleData.total?.leads || 0;
          combinedData.total.revenue = (combinedData.total.revenue || 0) + (googleData.total?.revenue || 0);
          combinedData.total.ctr = combinedData.total.impressions > 0 
            ? (combinedData.total.clicks / combinedData.total.impressions) * 100 : 0;
          combinedData.total.cpl = combinedData.total.leads > 0 
            ? Math.round((combinedData.total.spend / combinedData.total.leads) * 100) / 100 : null;
          combinedData.total.roas = combinedData.total.spend > 0 
            ? Math.round((combinedData.total.revenue / combinedData.total.spend) * 100) / 100 : null;
          combinedData.total.roi = combinedData.total.spend > 0 
            ? Math.round((((combinedData.total.revenue - combinedData.total.spend) / combinedData.total.spend) * 100) * 100) / 100 : null;
          
          if (googleData.meta_error_message) {
             combinedData.google_available = false;
             combinedData.google_error_message = googleData.meta_error_message;
          }
        }
      }

      // Re-sort combined campaigns
      if (combinedData && combinedData.campaigns) {
         combinedData.campaigns.sort((a, b) => b.spend - a.spend);
      }

      if (combinedData) {
        setData(combinedData);
        if (metaErrorStr && !combinedData.meta_error_message) {
           setError(metaErrorStr); // Set error if meta completely failed and we don't have graceful degradation
        }
      } else {
        throw new Error(metaErrorStr || 'Falha ao carregar ambas as APIs');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInsights(period); }, [period, fetchInsights]);

  const maxSpend = data?.campaigns.length
    ? Math.max(...data.campaigns.map(c => c.spend))
    : 1;

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: '7d',    label: '7 dias' },
    { key: '30d',   label: '30 dias' },
  ];

  return (
    <>
      <style>{`
        .ct-row:hover td { background: var(--admin-hover) !important; }
        .ct-period:hover { background: var(--admin-brand-tint) !important; color: var(--admin-brand) !important; border-color: var(--admin-brand-tint2) !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '10px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--admin-text)' }}>
              Performance de Campanhas
            </div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-mute)', marginTop: '2px' }}>
              {data ? `Google + Meta · Contas ativas: ${data.accounts_found ?? 0} · ${data.since} → ${data.until}` : 'Google & Meta Ads Insights'}
            </div>
          </div>
          {/* Period tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className="ct-period"
                style={{
                  padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 140ms ease',
                  background: period === key ? 'var(--admin-brand-tint)' : 'var(--admin-surface)',
                  color: period === key ? 'var(--admin-brand)' : 'var(--admin-text-soft)',
                  border: period === key ? '1px solid var(--admin-brand-tint2)' : '1px solid var(--admin-border)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Missing-permissions notice */}
        {data && !loading && data.meta_available === false && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start',
            background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.22)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"
                 strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ca8a04', marginBottom: '3px' }}>
                Dados Meta Ads incompletos — leads internos exibidos
              </div>
              <div style={{ fontSize: '11px', color: 'var(--admin-text-mute)', lineHeight: 1.5 }}>
                Falha ao consultar dados da Meta Marketing API. Verifique se o <code style={{ background: 'var(--admin-border)', padding: '1px 4px', borderRadius: '3px' }}>META_MARKETING_ACCESS_TOKEN</code> possui a permissão <strong>ads_read</strong> em&nbsp;
                <a href="https://business.facebook.com" target="_blank" rel="noreferrer"
                   style={{ color: '#0A7B3E', textDecoration: 'underline' }}>business.facebook.com</a>
                &nbsp;→ Usuários do sistema.
              </div>
            </div>
          </div>
        )}

        {/* Google API warning */}
        {data && !loading && data.google_available === false && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start',
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"
                 strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', marginBottom: '3px' }}>
                Integração Google Ads pendente
              </div>
              <div style={{ fontSize: '11px', color: 'var(--admin-text-mute)', lineHeight: 1.5 }}>
                {data.google_error_message} Configure na Vercel para visualizar custos do Google.
              </div>
            </div>
          </div>
        )}

        {/* Summary cards */}
        {data && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <SummaryCard label="Receita Total" value={fmtBRL(data.total.revenue || 0)} sub="vendas concluídas" />
            <SummaryCard label="Gasto Total"   value={fmtBRL(data.total.spend)} sub="investimento" />
            <SummaryCard label="ROI Global"    value={data.total.roi != null ? fmtPct(data.total.roi) : '—'} sub="retorno" />
            <SummaryCard label="ROAS Global"   value={data.total.roas != null ? `${data.total.roas.toFixed(2)}x` : '—'} sub="multiplicador" />
            <SummaryCard label="Leads (Neon)"  value={String(data.total.leads)} sub="via utm_campaign" />
            <SummaryCard label="CPL Médio"     value={data.total.cpl != null ? fmtBRL(data.total.cpl) : '—'} sub={`target < ${fmtBRL(CPL_TARGET)}`} />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: '80px', borderRadius: '12px',
                background: 'var(--admin-skeleton)',
                animation: 'skel-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{
            padding: '20px', borderRadius: '12px', textAlign: 'center' as const,
            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
          }}>
            <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '4px', fontWeight: 600 }}>
              Erro ao carregar dados da Meta
            </div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-mute)' }}>{error}</div>
            <button
              onClick={() => fetchInsights(period)}
              style={{
                marginTop: '10px', padding: '6px 14px', borderRadius: '7px', fontSize: '12px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Campaigns table */}
        {!loading && !error && data && (
          data.campaigns.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center' as const,
              borderRadius: '12px', background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--admin-text-mute)" strokeWidth="1.5"
                   style={{ margin: '0 auto 12px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <div style={{ fontSize: '14px', color: 'var(--admin-text-mute)' }}>
                Nenhuma campanha ativa no período selecionado
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
              borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--admin-card-shadow)',
            }}>
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr>
                      {['Campanha', 'Gasto', 'Leads', 'CPL', 'Receita', 'ROAS', 'ROI', 'Cliques', 'CTR'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
                          color: 'var(--admin-text-mute)', letterSpacing: '0.08em', textTransform: 'uppercase',
                          borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map(c => (
                      <tr key={c.id} className="ct-row">
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {c.platform === 'google' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            )}
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', maxWidth: '240px',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }} title={c.name}>
                              {c.name}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)', minWidth: '160px' }}>
                          <MiniBar value={c.spend} max={maxSpend} />
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 9px', borderRadius: '5px', fontSize: '12px', fontWeight: 700,
                            background: c.leads > 0 ? 'rgba(10,123,62,0.1)' : 'var(--admin-bg2)',
                            color: c.leads > 0 ? '#0A7B3E' : 'var(--admin-text-mute)',
                            border: c.leads > 0 ? '1px solid rgba(10,123,62,0.2)' : '1px solid var(--admin-border)',
                          }}>
                            {c.leads > 0 ? c.leads : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)' }}>
                          <CplBadge cpl={c.cpl} />
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)',
                          fontSize: '13px', color: 'var(--admin-text)', fontWeight: 600 }}>
                          {c.revenue > 0 ? fmtBRL(c.revenue) : '—'}
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)',
                          fontSize: '13px', color: 'var(--admin-text)', fontWeight: 600 }}>
                          {c.roas != null ? `${c.roas.toFixed(2)}x` : '—'}
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)',
                          fontSize: '13px', color: c.roi && c.roi > 0 ? '#0A7B3E' : (c.roi && c.roi < 0 ? '#ef4444' : 'var(--admin-text-soft)') }}>
                          {c.roi != null ? fmtPct(c.roi) : '—'}
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)',
                          fontSize: '13px', color: 'var(--admin-text-soft)' }}>
                          {fmtNum(c.clicks)}
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--admin-border)',
                          fontSize: '12px', color: 'var(--admin-text-mute)' }}>
                          {fmtPct(c.ctr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
