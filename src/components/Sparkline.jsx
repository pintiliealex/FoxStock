import React from "react";

export default function Sparkline({ data, width = 120, height = 48, strokeWidth = 2, isPositive = true }) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Map data values to SVG coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // In SVG, y-axis goes down, so we subtract from height
    const y = height - strokeWidth - ((val - min) / range) * (height - 2 * strokeWidth);
    return { x, y };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  // Path for gradient fill under the line
  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const strokeColor = isPositive ? "var(--color-success)" : "var(--color-danger)";
  const gradientId = `gradient-${isPositive ? "pos" : "neg"}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      
      {/* Area under line */}
      <path d={fillD} fill={`url(#${gradientId})`} />
      
      {/* Main sparkline */}
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
  );
}
