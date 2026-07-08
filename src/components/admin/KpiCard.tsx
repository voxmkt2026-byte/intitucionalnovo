// Server Component — no 'use client'

// ─── SVG Icon Library (inline, zero deps) ────────────────────────────────────
function IconToday() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconWeek() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <path d="M16 2v4M8 2v4M3 10h18M8 14h2M11 14h2M14 14h2M8 17h2M11 17h2"/>
    </svg>
  );
}
function IconMonth() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M7 15h10M7 19h6"/>
    </svg>
  );
}
function IconTotal() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M7 16l4-5 3 3 5-6"/>
    </svg>
  );
}
function IconConversion() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function IconTicket() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>
    </svg>
  );
}

const ICON_MAP: Record<string, React.ReactNode> = {
  today:      <IconToday />,
  week:       <IconWeek />,
  month:      <IconMonth />,
  total:      <IconTotal />,
  conversion: <IconConversion />,
  ticket:     <IconTicket />,
};

// ─── Component ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  iconKey?: string;
}

export default function KpiCard({ label, value, sub, color, iconKey }: KpiCardProps) {
  const brandGreen = "#0A7B3E";
  const accentColor = color ?? brandGreen;
  const icon = iconKey ? ICON_MAP[iconKey] : null;

  return (
    <div
      style={{
        backgroundColor: "#0b0f17",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "10px",
        position: "relative" as const,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Radial corner glow — Titanium Deep Emerald */}
      <div
        style={{
          position: "absolute" as const, top: 0, right: 0,
          width: "90px", height: "90px",
          background: `radial-gradient(circle at top right, ${accentColor}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top: icon box + label */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {icon && (
          <span
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "34px", height: "34px", flexShrink: 0,
              background: `${accentColor}18`,
              borderRadius: "9px",
              border: `1px solid ${accentColor}35`,
              color: accentColor,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: "11px", fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.07em",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "32px", fontWeight: 700, lineHeight: 1,
          color: accentColor,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>

      {/* Sub */}
      {sub && (
        <div
          style={{
            fontSize: "11px", color: "rgba(255,255,255,0.28)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "8px", lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
