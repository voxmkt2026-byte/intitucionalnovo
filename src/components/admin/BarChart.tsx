// Server Component — no 'use client'

interface BarChartProps {
  title: string;
  data: Record<string, number>;
  color?: string;
  maxItems?: number;
}

export default function BarChart({ title, data, color = 'var(--admin-brand)', maxItems = 10 }: BarChartProps) {
  const entries = Object.entries(data).slice(0, maxItems);
  const maxValue = entries.reduce((acc, [, v]) => Math.max(acc, v), 0) || 1;

  return (
    <div style={{
      backgroundColor: 'var(--admin-surface)',
      border: '1px solid var(--admin-border)',
      borderRadius: '14px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
      boxShadow: 'var(--admin-card-shadow)',
    }}>
      {/* Title */}
      <h3 style={{
        margin: 0,
        fontSize: '11px', fontWeight: 600,
        color: 'var(--admin-text-mute)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
      }}>
        {title}
      </h3>

      {/* Bars */}
      {entries.length === 0 ? (
        <p style={{ color: 'var(--admin-text-mute)', fontSize: '13px', margin: 0 }}>
          Sem dados
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
          {entries.map(([key, value]) => {
            const pct = (value / maxValue) * 100;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Label */}
                <span style={{
                  width: '110px', flexShrink: 0,
                  fontSize: '12px', color: 'var(--admin-text-soft)',
                  textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' as const,
                }}>
                  {key}
                </span>

                {/* Track */}
                <div style={{
                  flex: 1, height: '8px',
                  background: 'var(--admin-border-2, var(--admin-border))',
                  borderRadius: '999px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    borderRadius: '999px',
                  }} />
                </div>

                {/* Count */}
                <span style={{
                  width: '36px', flexShrink: 0, textAlign: 'right' as const,
                  fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  color: 'var(--admin-text)',
                }}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
