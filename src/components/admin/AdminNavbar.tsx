'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAdminTheme } from '@/components/admin/AdminThemeProvider';

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
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
      </svg>
    ),
  },
  {
    href: '/admin/campanha',
    label: 'Campanha',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
] as const;

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
         style={{ animation: 'admin-spin 0.75s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  );
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const { theme, toggle } = useAdminTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const isDark = theme === 'dark';

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch { /* ignore */ }
    window.location.href = '/admin/login';
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', outline: 'none', border: '1px solid var(--admin-border)',
    backgroundColor: 'transparent', transition: 'all 140ms ease',
  };

  return (
    <>
      <style>{`
        @keyframes admin-spin { to { transform: rotate(360deg); } }
        .admin-nav-link { transition: all 140ms ease; }
        .admin-nav-link:hover { background: var(--admin-brand-tint) !important; color: var(--admin-brand) !important; }
        .admin-theme-btn:hover { background: var(--admin-brand-tint) !important; color: var(--admin-brand) !important; border-color: var(--admin-brand-tint2) !important; }
        .admin-logout-btn:hover { color: #ef4444 !important; background: rgba(239,68,68,0.08) !important; border-color: rgba(239,68,68,0.28) !important; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'var(--admin-nav-bg)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--admin-nav-border)',
      }}>
        {/* Titanium accent bar */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #0A7B3E, #15B85C 55%, #0A7B3E)' }} />

        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px',
        }}>

          {/* ── Logo ── */}
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: 'linear-gradient(135deg, #0A7B3E, #15B85C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 3v18M5 3h14"/>
              </svg>
            </span>
            <span style={{
              fontSize: '15px', fontWeight: 800, letterSpacing: '0.07em',
              color: 'var(--admin-text)', textTransform: 'uppercase' as const,
            }}>
              TITANIUM
            </span>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
              color: 'var(--admin-brand)', background: 'var(--admin-brand-tint)',
              border: '1px solid var(--admin-brand-tint2)', borderRadius: '4px',
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
                    textDecoration: 'none', padding: '6px 13px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: active ? 600 : 400,
                    color: active ? 'var(--admin-brand)' : 'var(--admin-text-mute)',
                    background: active ? 'var(--admin-brand-tint)' : 'transparent',
                    border: `1px solid ${active ? 'var(--admin-brand-tint2)' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: '7px',
                    position: 'relative' as const,
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute' as const, bottom: '-1px', left: '50%',
                      transform: 'translateX(-50%)', width: '20px', height: '2px',
                      borderRadius: '2px', backgroundColor: 'var(--admin-brand)',
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right side: Theme toggle + Logout ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="admin-theme-btn"
              title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              style={{
                ...btnBase,
                color: 'var(--admin-text-mute)',
                padding: '7px',
                borderRadius: '8px',
              }}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="admin-logout-btn"
              style={{
                ...btnBase,
                color: loggingOut ? 'var(--admin-text-mute)' : 'var(--admin-text-soft)',
                cursor: loggingOut ? 'not-allowed' : 'pointer',
              }}
            >
              {loggingOut ? <SpinnerIcon /> : <LogoutIcon />}
              {loggingOut ? 'Saindo...' : 'Sair'}
            </button>

          </div>
        </div>
      </nav>
    </>
  );
}
