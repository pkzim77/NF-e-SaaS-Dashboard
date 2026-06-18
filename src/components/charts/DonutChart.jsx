import { brlShort } from '../../utils/format';

export default function DonutChart({ data }) {
  const total = data.reduce((a, b) => a + b.v, 0);
  const R = 58;
  const C = 2 * Math.PI * R;

  const fractions = data.map((d) => d.v / total);
  const offsets = fractions.map((_, i) => fractions.slice(0, i).reduce((a, b) => a + b, 0));

  const segments = data.map((d, i) => {
    const f = d.v / total;
    return (
      <circle
        key={i}
        cx={75}
        cy={75}
        r={R}
        fill="none"
        stroke={d.color}
        strokeWidth={20}
        strokeDasharray={`${(f * C).toFixed(1)} ${C.toFixed(1)}`}
        strokeDashoffset={(-offsets[i] * C).toFixed(1)}
        transform="rotate(-90 75 75)"
        strokeLinecap="butt"
      />
    );
  });

  return (
    <svg viewBox="0 0 150 150" width={150} height={150}>
      {segments}
      <text x={75} y={70} textAnchor="middle" fontSize={11} fill="var(--text-3)" fontFamily="Figtree,sans-serif" fontWeight={600}>
        Total ano
      </text>
      <text x={75} y={90} textAnchor="middle" fontSize={16} fontWeight={800} fill="var(--text)" fontFamily="JetBrains Mono,monospace">
        {brlShort(total)}
      </text>
    </svg>
  );
}
