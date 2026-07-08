// Server Component — SVG Pie Chart, zero dependencies
// Uses SVG stroke-dasharray/dashoffset technique for CSS-animatable arcs.

interface PieChartProps {
  title: string;
  data: Record<string, number>;
  /** Palette rotated per slice. Defaults to Titanium brand palette. */
  colors?: string[];
  size?: number;
}

const DEFAULT_COLORS = [
  "#0A7B3E", // Deep Emerald (brand primary)
  "#15B85C", // Vivid Green
  "#3b82f6", // Blue — Novo
  "#eab308", // Amber — Qualificado
  "#ef4444", // Red — Perdido
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

/** Convert polar coords to cartesian */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Build SVG arc path between two angles */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const gap = 0.0; // no gap between slices (clean look)
  const s = polar(cx, cy, r, startAngle + gap);
  const e = polar(cx, cy, r, endAngle - gap);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export default function PieChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  size = 140,
}: PieChartProps) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .slice(0, 8);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.54; // donut hole

  return (
    <div
      style={{
        backgroundColor: "#0b0f17",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "20px",
      }}
    >
      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontSize: "11px",
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}
      >
        {title}
      </h3>

      {entries.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", margin: 0 }}>
          Sem dados
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap" as const,
          }}
        >
          {/* SVG Donut */}
          <div style={{ position: "relative" as const, flexShrink: 0 }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ display: "block", overflow: "visible" }}
            >
              {/* Background circle */}
              <circle
                cx={cx} cy={cy} r={outerR}
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />

              {/* Slices */}
              {(() => {
                const slices: React.ReactNode[] = [];
                let angle = 0;
                entries.forEach(([key, value], i) => {
                  const slice = (value / total) * 360;
                  const color = colors[i % colors.length];
                  const mid = angle + slice / 2;
                  const labelPt = polar(cx, cy, outerR * 0.72, mid);

                  slices.push(
                    <g key={key}>
                      <path
                        d={arcPath(cx, cy, outerR, angle, angle + slice)}
                        fill={color}
                        opacity={0.9}
                        style={{
                          filter: `drop-shadow(0 0 6px ${color}66)`,
                          transition: "opacity 0.2s",
                        }}
                      />
                      {/* Inner donut hole mask */}
                      <circle
                        cx={cx} cy={cy} r={innerR}
                        fill="#0b0f17"
                      />
                      {/* Percentage label on slice (only if slice >= 12°) */}
                      {slice >= 30 && (
                        <text
                          x={labelPt.x}
                          y={labelPt.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            fill: "#fff",
                            pointerEvents: "none",
                          }}
                        >
                          {Math.round((value / total) * 100)}%
                        </text>
                      )}
                    </g>,
                  );
                  angle += slice;
                });
                return slices;
              })()}

              {/* Center total label */}
              <text
                x={cx} y={cy - 6}
                textAnchor="middle"
                style={{ fontSize: "18px", fontWeight: 700, fill: "#ffffff" }}
              >
                {total}
              </text>
              <text
                x={cx} y={cy + 12}
                textAnchor="middle"
                style={{ fontSize: "9px", fontWeight: 500, fill: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}
              >
                TOTAL
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: "8px",
              flex: 1,
              minWidth: 0,
            }}
          >
            {entries.map(([key, value], i) => {
              const color = colors[i % colors.length];
              const pct = Math.round((value / total) * 100);
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: 0,
                  }}
                >
                  {/* Color dot */}
                  <span
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: color, flexShrink: 0,
                      boxShadow: `0 0 6px ${color}88`,
                    }}
                  />
                  {/* Label */}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.55)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {key}
                  </span>
                  {/* Count + pct */}
                  <span
                    style={{
                      fontSize: "12px", fontWeight: 600,
                      color: "rgba(255,255,255,0.8)",
                      flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {value}{" "}
                    <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                      {pct}%
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
