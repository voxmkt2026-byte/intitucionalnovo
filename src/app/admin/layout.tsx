import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import AdminNavbar from "@/components/admin/AdminNavbar";

// ─── Design tokens — light (default) and dark ────────────────────────────────
const ADMIN_CSS = `
  [data-admin-theme="light"] {
    --admin-bg:           #F8F7F4;
    --admin-bg2:          #EFEDE8;
    --admin-surface:      #FFFFFF;
    --admin-border:       #E5E2DC;
    --admin-border-2:     #EFEDE8;
    --admin-text:         #1A1A1A;
    --admin-text-soft:    #4A4A4A;
    --admin-text-mute:    #8A8A8A;
    --admin-nav-bg:       rgba(255,255,255,0.92);
    --admin-nav-border:   #E5E2DC;
    --admin-card-shadow:  0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06);
    --admin-brand:        #0A7B3E;
    --admin-brand-mid:    #0D9E50;
    --admin-brand-vivid:  #15B85C;
    --admin-brand-tint:   rgba(10,123,62,0.09);
    --admin-brand-tint2:  rgba(10,123,62,0.2);
    --admin-skeleton:     #EFEDE8;
    --admin-hover:        #FAFAF8;
    --admin-input-bg:     #FFFFFF;
    --admin-input-border: #E5E2DC;
    --admin-toggle-off:   #E5E2DC;
    --admin-icon-mute:    #8A8A8A;
    --admin-badge-bg:     rgba(10,123,62,0.1);
    --admin-badge-text:   #0A7B3E;
    --admin-badge-border: rgba(10,123,62,0.22);
  }
  [data-admin-theme="dark"] {
    --admin-bg:           #05070a;
    --admin-bg2:          #080c12;
    --admin-surface:      #0b0f17;
    --admin-border:       rgba(255,255,255,0.08);
    --admin-border-2:     rgba(255,255,255,0.05);
    --admin-text:         #FFFFFF;
    --admin-text-soft:    rgba(255,255,255,0.65);
    --admin-text-mute:    rgba(255,255,255,0.35);
    --admin-nav-bg:       rgba(5,7,10,0.9);
    --admin-nav-border:   rgba(255,255,255,0.07);
    --admin-card-shadow:  0 1px 3px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.2);
    --admin-brand:        #15B85C;
    --admin-brand-mid:    #0D9E50;
    --admin-brand-vivid:  #0A7B3E;
    --admin-brand-tint:   rgba(21,184,92,0.1);
    --admin-brand-tint2:  rgba(21,184,92,0.22);
    --admin-skeleton:     rgba(255,255,255,0.06);
    --admin-hover:        #0d111a;
    --admin-input-bg:     #0b0f17;
    --admin-input-border: rgba(255,255,255,0.1);
    --admin-toggle-off:   rgba(255,255,255,0.12);
    --admin-icon-mute:    rgba(255,255,255,0.35);
    --admin-badge-bg:     rgba(21,184,92,0.12);
    --admin-badge-text:   #15B85C;
    --admin-badge-border: rgba(21,184,92,0.28);
  }

  /* Smooth theme transition on all admin elements */
  [data-admin-theme] * {
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }
  [data-admin-theme] svg { transition: none; }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Inject theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: ADMIN_CSS }} />
      <AdminThemeProvider>
        {/* Shared navbar across ALL admin pages */}
        <AdminNavbar />
        {children}
      </AdminThemeProvider>
    </>
  );
}
