import React from "react";

export default function Sparkline({ data, width = 180, height = 75, strokeWidth = 2, isPositive = true }) {
  if (!data || data.length === 0) return (
    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "10px 0" }}>No chart data available.</div>
  );

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Map data values to SVG coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // Leave margin at top and bottom for circles
    const y = height - 8 - ((val - min) / range) * (height - 16);
    return { x, y };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const strokeColor = isPositive ? "var(--color-success)" : "var(--color-danger)";
  const gradientId = `gradient-${isPositive ? "pos" : "neg"}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      {/* Min/Max value indicator strip */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "4px" }}>
        <span>Min: <strong style={{ color: "var(--text-primary)" }}>${min.toFixed(2)}</strong></span>
        <span>Max: <strong style={{ color: "var(--text-primary)" }}>${max.toFixed(2)}</strong></span>
      </div>

      <div style={{ position: "relative", height: `${height}px`, width: "100%" }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Subtle Grid Guidelines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="var(--border-glass)" strokeDasharray="2,4" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="var(--border-glass)" strokeDasharray="2,4" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="var(--border-glass)" strokeDasharray="2,4" />

          {/* Area under line */}
          <path d={fillD} fill={`url(#${gradientId})`} />
          
          {/* Main sparkline path */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* End point dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={strokeWidth * 1.5}
              fill={strokeColor}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
