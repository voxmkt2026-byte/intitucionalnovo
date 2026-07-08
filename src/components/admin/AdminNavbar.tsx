'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/leads',     label: 'Leads'     },
  { href: '/admin/cartas',    label: 'Cartas'    },
] as const;

// ── Inline SVGs ────────────────────────────────────────────────
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
        .admin-nav-link:hover { color: rgba(255,255,255,0.9) !important; background: rgba(255,255,255,0.05) !important; }
        .admin-logout-btn:not(:disabled):hover { color: rgba(239,68,68,0.9) !important; background: rgba(239,68,68,0.08) !important; border-color: rgba(239,68,68,0.28) !important; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(5,7,10,0.88)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px',
        }}>

          {/* ── Logo ─── */}
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.09em', color: '#fff', textTransform: 'uppercase' as const }}>
              TITANIUM
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
              color: '#10b981', background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.28)', borderRadius: '4px',
              padding: '2px 6px', textTransform: 'uppercase' as const,
            }}>
              ADMIN
            </span>
          </Link>

          {/* ── Nav Links ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className="admin-nav-link"
                  style={{
                    textDecoration: 'none', padding: '6px 15px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.48)',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    position: 'relative' as const,
                  }}
                >
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute' as const, bottom: '-1px', left: '50%',
                      transform: 'translateX(-50%)', width: '20px', height: '2px',
                      borderRadius: '2px', backgroundColor: '#10b981',
                    }}/>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Logout ─── */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="admin-logout-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              color: loggingOut ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: loggingOut ? 'not-allowed' : 'pointer', outline: 'none',
              transition: 'all 140ms ease',
            }}
          >
            {loggingOut ? <SpinnerIcon/> : <LogoutIcon/>}
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>

        </div>
      </nav>
    </>
  );
}
