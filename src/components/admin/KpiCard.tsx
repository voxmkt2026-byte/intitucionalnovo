// Server Component — no 'use client'

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export default function KpiCard({ label, value, sub, color, icon }: KpiCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#0b0f17',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        position: 'relative' as const,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Subtle corner glow */}
      <div style={{
        position: 'absolute' as const, top: 0, right: 0,
        width: '80px', height: '80px',
        background: color
          ? `radial-gradient(circle at top right, ${color}18 0%, transparent 70%)`
          : 'radial-gradient(circle at top right, rgba(16,185,129,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Top row: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && (
          <span style={{
            fontSize: '20px', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '9px',
            border: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>
            {icon}
          </span>
        )}
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
          {label}
        </span>
      </div>

      {/* Value */}
      <div style={{
        fontSize: '36px', fontWeight: 700, lineHeight: 1,
        color: color ?? '#ffffff',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>

      {/* Sub */}
      {sub && (
        <div style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.32)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '10px',
          lineHeight: 1.5,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}
