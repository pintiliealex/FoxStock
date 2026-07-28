import React, { useState, useRef } from "react";

export default function Sparkline({ data, range = "1mo", width = 240, height = 110, strokeWidth = 2, isPositive = true }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length === 0) return (
    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "10px 0" }}>No chart data available.</div>
  );

  const min = Math.min(...data);
  const max = Math.max(...data);
  const rangeVal = max - min === 0 ? 1 : max - min;

  // Map data values to SVG coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - 12 - ((val - min) / rangeVal) * (height - 24);
    return { x, y, value: val };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const strokeColor = isPositive ? "var(--color-success)" : "var(--color-danger)";
  const gradientId = `gradient-${isPositive ? "pos" : "neg"}-${Math.random().toString(36).substr(2, 9)}`;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, localX / rect.width));
    const index = Math.round(pct * (data.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const getLabelForIndex = (idx) => {
    const date = new Date();
    const len = data.length;
    if (range === "1d") {
      const minutesAgo = (len - 1 - idx) * 15;
      date.setMinutes(date.getMinutes() - minutesAgo);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (range === "5d") {
      const day = Math.floor((len - 1 - idx) / 6);
      date.setDate(date.getDate() - day);
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (range === "1mo") {
      const daysAgo = len - 1 - idx;
      date.setDate(date.getDate() - daysAgo);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (range === "6mo") {
      const daysAgo = Math.round((len - 1 - idx) * 6);
      date.setDate(date.getDate() - daysAgo);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (range === "1y") {
      const daysAgo = Math.round((len - 1 - idx) * 12);
      date.setDate(date.getDate() - daysAgo);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      const yearsAgo = (len - 1 - idx) / 3;
      date.setMonth(date.getMonth() - Math.round(yearsAgo * 12));
      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", position: "relative" }}>
      {/* Min/Max indicators */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "4px" }}>
        <span>Min: <strong style={{ color: "#fff" }}>${min.toFixed(2)}</strong></span>
        {hoverIndex !== null && (
          <span style={{ color: "var(--color-primary)", fontWeight: "600" }}>
            {getLabelForIndex(hoverIndex)}
          </span>
        )}
        <span>Max: <strong style={{ color: "#fff" }}>${max.toFixed(2)}</strong></span>
      </div>

      <div 
        style={{ position: "relative", height: `${height}px`, width: "100%", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg 
          ref={svgRef}
          width="100%" 
          height={height} 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="none" 
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid Guidelines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="var(--border-glass)" strokeWidth="0.5" strokeDasharray="2,4" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="var(--border-glass)" strokeWidth="0.5" strokeDasharray="2,4" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="var(--border-glass)" strokeWidth="0.5" strokeDasharray="2,4" />

          {/* Area Fill */}
          <path d={fillD} fill={`url(#${gradientId})`} />
          
          {/* Main Path */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Highlight Hover Elements */}
          {hoverIndex !== null && points[hoverIndex] && (
            <>
              {/* Vertical Crosshair Line */}
              <line 
                x1={points[hoverIndex].x} 
                y1={0} 
                x2={points[hoverIndex].x} 
                y2={height} 
                stroke="var(--color-primary)" 
                strokeWidth="1" 
                strokeDasharray="3,3"
                opacity="0.8"
              />
              {/* Pulse Dot */}
              <circle
                cx={points[hoverIndex].x}
                cy={points[hoverIndex].y}
                r={strokeWidth * 2}
                fill={strokeColor}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </>
          )}

          {/* End Point Dot */}
          {hoverIndex === null && points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={strokeWidth * 1.5}
              fill={strokeColor}
            />
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div style={{
            position: "absolute",
            top: "8px",
            left: `${Math.max(10, Math.min(90, (points[hoverIndex].x / width) * 100))}%`,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(20, 20, 25, 0.95)",
            border: "1px solid var(--border-glass)",
            borderRadius: "6px",
            padding: "4px 8px",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            zIndex: 5,
            fontSize: "0.7rem",
            color: "#fff",
            whiteSpace: "nowrap"
          }}>
            <div style={{ fontWeight: "700" }}>${points[hoverIndex].value.toFixed(2)}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.6rem" }}>{getLabelForIndex(hoverIndex)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
