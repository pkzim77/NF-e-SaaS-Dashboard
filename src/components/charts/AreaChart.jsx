export default function AreaChart({ data }) {
  const W = 720;
  const H = 210;
  const pad = 14;
  const max = Math.max(...data.map((d) => d.v)) * 1.12;
  const sx = (W - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => [pad + i * sx, H - pad - (d.v / max) * (H - pad * 2)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L ${pad + (data.length - 1) * sx} ${H - pad} L ${pad} ${H - pad} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={210} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="ffArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {gridLines.map((g, i) => (
        <line
          key={'g' + i}
          x1={pad}
          x2={W - pad}
          y1={(pad + g * (H - pad * 2)).toFixed(1)}
          y2={(pad + g * (H - pad * 2)).toFixed(1)}
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      <path d={area} fill="url(#ffArea)" />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <circle
          key={'c' + i}
          cx={p[0].toFixed(1)}
          cy={p[1].toFixed(1)}
          r={4}
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
