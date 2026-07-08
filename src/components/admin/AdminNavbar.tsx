'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// ── Nav items with SVG icons ────────────────────────────────────────────────
const NAV_LINKS = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/admin/leads',
    label: 'Leads',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/admin/cartas',
    label: 'Cartas',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
] as const;

// ── Logout icon ──────────────────────────────────────────────────────────────
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5"
         style={{ animation: 'admin-spin 0.75s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  );
}

// ── Titanium brand green ─────────────────────────────────────────────────────
const BRAND = '#0A7B3E';
const BRAND_VIVID = '#15B85C';

export default function AdminNavbar() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch { /* ignore */ }
    window.location.href = '/admin/login';
  }

  return (
    <>
      <style>{`
        @keyframes admin-spin { to { transform: rotate(360deg); } }
        .admin-nav-link { transition: all 140ms ease; }
        .admin-nav-link:hover { color: rgba(255,255,255,0.95) !important; background: rgba(255,255,255,0.06) !important; }
        .admin-logout-btn:not(:disabled):hover { color: rgba(239,68,68,0.9) !important; background: rgba(239,68,68,0.08) !important; border-color: rgba(239,68,68,0.28) !important; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(5,7,10,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Titanium brand accent bar */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${BRAND}, ${BRAND_VIVID} 55%, ${BRAND})` }} />

        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px',
        }}>

          {/* ── Logo ── */}
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Titanium "T" mark */}
            <span style={{
              width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_VIVID})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 3v18M5 3h14"/>
              </svg>
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.07em', color: '#fff', textTransform: 'uppercase' as const }}>
              TITANIUM
            </span>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
              color: BRAND_VIVID, background: `${BRAND}22`,
              border: `1px solid ${BRAND}44`, borderRadius: '4px',
              padding: '2px 6px', textTransform: 'uppercase' as const,
            }}>
              ADMIN
            </span>
          </Link>

          {/* ── Nav Links ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className="admin-nav-link"
                  style={{
                    textDecoration: 'none', padding: '6px 14px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: '7px',
                    position: 'relative' as const,
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.55 }}>{icon}</span>
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute' as const, bottom: '-1px', left: '50%',
                      transform: 'translateX(-50%)', width: '20px', height: '2px',
                      borderRadius: '2px', backgroundColor: BRAND_VIVID,
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Logout ── */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="admin-logout-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              color: loggingOut ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: loggingOut ? 'not-allowed' : 'pointer', outline: 'none',
              transition: 'all 140ms ease',
            }}
          >
            {loggingOut ? <SpinnerIcon /> : <LogoutIcon />}
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>

        </div>
      </nav>
    </>
  );
}
