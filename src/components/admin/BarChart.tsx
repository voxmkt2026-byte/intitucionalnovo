// Server Component — no 'use client'

interface BarChartProps {
  title: string;
  data: Record<string, number>;
  color?: string;
  maxItems?: number;
}

export default function BarChart({ title, data, color = '#10b981', maxItems = 10 }: BarChartProps) {
  const entries = Object.entries(data).slice(0, maxItems);
  const maxValue = entries.reduce((acc, [, v]) => Math.max(acc, v), 0) || 1;

  return (
    <div style={{
      backgroundColor: '#0b0f17',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    }}>
      {/* Title */}
      <h3 style={{
        margin: 0,
        fontSize: '14px', fontWeight: 600,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: '0.03em',
        textTransform: 'uppercase' as const,
      }}>
        {title}
      </h3>

      {/* Bars */}
      {entries.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>
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
                  fontSize: '12px', color: 'rgba(255,255,255,0.5)',
                  textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' as const,
                }}>
                  {key}
                </span>

                {/* Bar track */}
                <div style={{
                  flex: 1, height: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '999px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    borderRadius: '999px',
                    transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
                    boxShadow: `0 0 8px ${color}55`,
                  }}/>
                </div>

                {/* Count */}
                <span style={{
                  width: '36px', flexShrink: 0, textAlign: 'right' as const,
                  fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  color: 'rgba(255,255,255,0.75)',
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
