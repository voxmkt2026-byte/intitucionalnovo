'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AdminTheme = 'light' | 'dark';

interface ThemeCtxValue {
  theme: AdminTheme;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({ theme: 'light', toggle: () => {} });

export function useAdminTheme() { return useContext(ThemeCtx); }

export default function AdminThemeProvider({ children }: { children: ReactNode }) {
  // Default = light; hydrate from localStorage on mount
  const [theme, setTheme] = useState<AdminTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('titanium-admin-theme') as AdminTheme | null;
    if (saved === 'dark' || saved === 'light') setTheme(saved);
  }, []);

  function toggle() {
    setTheme(t => {
      const next: AdminTheme = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('titanium-admin-theme', next);
      return next;
    });
  }

  // Before mount, render light (SSR default) to avoid hydration mismatch
  const appliedTheme = mounted ? theme : 'light';

  return (
    <ThemeCtx.Provider value={{ theme: appliedTheme, toggle }}>
      <div
        data-admin-theme={appliedTheme}
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--admin-bg)',
          color: 'var(--admin-text)',
          transition: 'background-color 0.25s ease, color 0.25s ease',
        }}
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}
