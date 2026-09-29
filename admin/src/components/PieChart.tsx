import { useState } from 'react';

export interface PieDatum {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieDatum[];
  size?: number;
}

const THICKNESS = 0.36; // ring width as a fraction of the radius
const GAP_DEG = 2; // visual gap between slices
const POP_OUT = 6; // how far a selected slice moves outward

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const o1 = polar(cx, cy, rOuter, start);
  const o2 = polar(cx, cy, rOuter, end);
  const i1 = polar(cx, cy, rInner, end);
  const i2 = polar(cx, cy, rInner, start);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

/**
 * Donut chart with a clickable legend — the web counterpart of
 * mobile/src/components/admin/pie-chart.tsx. Selecting a slice (or its legend
 * row) pops it out and fades the rest; selecting it again clears the selection.
 */
export default function PieChart({ data, size = 170 }: PieChartProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const toggle = (key: string) => setSelected((cur) => (cur === key ? null : key));

  const c = size / 2;
  const rOuter = c - POP_OUT;
  const rInner = rOuter * (1 - THICKNESS);
  const single = data.length === 1;

  let cursor = 0;
  const slices = data.map((d) => {
    const sweep = total ? (d.value / total) * 360 : 0;
    const start = cursor;
    cursor += sweep;
    return { ...d, start, end: start + sweep, pct: total ? Math.round((d.value / total) * 100) : 0 };
  });

  const selectedSlice = slices.find((s) => s.key === selected);

  return (
    <div className="pie">
      <div className="pie-figure" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution chart">
          {slices.map((s) => {
            const isSelected = s.key === selected;
            const faded = selected !== null && !isSelected;
            const mid = (s.start + s.end) / 2;
            const offset = isSelected ? polar(0, 0, POP_OUT, mid) : { x: 0, y: 0 };
            const style = {
              opacity: faded ? 0.45 : 1,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            };

            if (single) {
              // A full ring can't be drawn as a single arc.
              return (
                <circle
                  key={s.key}
                  className="pie-slice"
                  cx={c}
                  cy={c}
                  r={(rOuter + rInner) / 2}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={rOuter - rInner}
                  style={style}
                  onClick={() => toggle(s.key)}
                />
              );
            }

            const gap = Math.min(GAP_DEG / 2, (s.end - s.start) / 4);
            return (
              <path
                key={s.key}
                className="pie-slice"
                d={arcPath(c, c, rOuter, rInner, s.start + gap, s.end - gap)}
                fill={s.color}
                style={style}
                onClick={() => toggle(s.key)}
              />
            );
          })}
        </svg>
        <div className="pie-center">
          <div className="pie-center-value">{selectedSlice ? selectedSlice.value : total}</div>
          <div className="pie-center-label">{selectedSlice ? selectedSlice.label : 'Total'}</div>
        </div>
      </div>

      <ul className="pie-legend">
        {slices.map((s) => {
          const isSelected = s.key === selected;
          return (
            <li key={s.key}>
              <button
                type="button"
                className={`pie-legend-row${isSelected ? ' selected' : ''}${selected && !isSelected ? ' faded' : ''}`}
                aria-pressed={isSelected}
                onClick={() => toggle(s.key)}
              >
                <span className="pie-legend-dot" style={{ background: s.color }} />
                <span className="pie-legend-pct">{s.pct}%</span>
                <span className="pie-legend-label">{s.label}</span>
                <span className="pie-legend-count">{s.value.toLocaleString()}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
