import React, { useState } from "react";
import { Bell, Plus, Trash2, ShieldAlert, Cpu, Sparkles, Check, Play, Pause } from "lucide-react";

export default function AlertsHub({
  stocks,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onToggleAlertStatus,
  onTriggerAIRatingUpdate
}) {
  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol || "");
  const [alertType, setAlertType] = useState("price_below"); // price_below, price_above, pe_below
  const [thresholdValue, setThresholdValue] = useState("");
  const [ratingTargetSymbol, setRatingTargetSymbol] = useState(stocks[0]?.symbol || "");

  const activeStock = stocks.find((s) => s.symbol === selectedSymbol);
  const ratingStock = stocks.find((s) => s.symbol === ratingTargetSymbol);

  const handleSubmitAlert = (e) => {
    e.preventDefault();
    if (!thresholdValue || isNaN(parseFloat(thresholdValue))) return;

    onAddAlert({
      symbol: selectedSymbol,
      type: alertType,
      value: parseFloat(thresholdValue)
    });

    setThresholdValue("");
  };

  // Helper to format alert condition text
  const formatAlertCondition = (alert) => {
    const symbol = alert.symbol;
    const val = alert.value;
    switch (alert.type) {
      case "price_below":
        return `${symbol} price drops below $${val.toFixed(2)}`;
      case "price_above":
        return `${symbol} price rises above $${val.toFixed(2)}`;
      case "pe_below":
        return `${symbol} P/E Ratio drops below ${val}`;
      default:
        return `${symbol} condition met`;
    }
  };

  const getRatingBadgeColor = (score) => {
    if (score >= 4.5) return { bg: "rgba(16, 185, 129, 0.15)", text: "var(--color-success)", label: "Strong Buy" };
    if (score >= 4.0) return { bg: "rgba(16, 185, 129, 0.1)", text: "var(--color-success)", label: "Buy" };
    if (score >= 3.0) return { bg: "rgba(245, 158, 11, 0.15)", text: "var(--color-warning)", label: "Hold" };
    if (score >= 2.0) return { bg: "rgba(239, 68, 68, 0.1)", text: "var(--color-danger)", label: "Sell" };
    return { bg: "rgba(239, 68, 68, 0.2)", text: "var(--color-danger)", label: "Strong Sell" };
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", padding: "24px 0", textAlign: "left" }}>
      
      {/* Upper Title */}
      <div>
        <h1 style={{ fontSize: "2rem" }}>Smart Alerts & AI Insights</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Configure smart price action alerts and view deep AI research reports.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        
        {/* Module 1: Alert Form & Active Limits */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
              <Bell size={18} /> Add Price or Indicator Alert
            </h3>

            <form onSubmit={handleSubmitAlert} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Select Equity Asset
                </label>
                <select 
                  value={selectedSymbol} 
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                >
                  {stocks.map(s => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Trigger Condition
                  </label>
                  <select 
                    value={alertType} 
                    onChange={(e) => setAlertType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-glass)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  >
                    <option value="price_below">Price Drops Below</option>
                    <option value="price_above">Price Rises Above</option>
                    <option value="pe_below">P/E Drops Below</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Threshold Target
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder={activeStock ? `Current: $${activeStock.price.toFixed(2)}` : "150.00"}
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-glass)",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: "10px 16px", display: "flex", justifyContent: "center", borderRadius: "8px" }}>
                <Plus size={16} /> Create Alert Limit
              </button>

            </form>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px" }}>
              Active Limits Tracker ({alerts.length})
            </h3>
            
            {alerts.length === 0 ? (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No alert limits currently configured.</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-glass)" 
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "#fff", display: "block" }}>
                        {formatAlertCondition(alert)}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        Asset: {alert.symbol}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button 
                        onClick={() => onToggleAlertStatus(alert.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: alert.active ? "var(--color-success)" : "var(--text-muted)",
                          padding: "4px"
                        }}
                        title={alert.active ? "Pause Alert" : "Resume Alert"}
                      >
                        {alert.active ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                      
                      <button 
                        onClick={() => onRemoveAlert(alert.id)}
                        style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "4px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Module 2: AI Rating Consensus Analysis */}
        <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)" }}>
                <Sparkles size={18} /> AI Daily Ratings Consensus
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Algorithmic sentiment summaries and daily action recommendations.
              </p>
            </div>
            
            <button 
              onClick={onTriggerAIRatingUpdate}
              className="btn-secondary"
              style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Cpu size={14} /> Re-analyze
            </button>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Target Asset Report
            </label>
            <select 
              value={ratingTargetSymbol} 
              onChange={(e) => setRatingTargetSymbol(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-glass)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                outline: "none"
              }}
            >
              {stocks.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
              ))}
            </select>
          </div>

          {ratingStock && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
              
              {/* Rating Consensus Badge display */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>AI Consensus Recommendation</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: "700" }}>
                      {getRatingBadgeColor(ratingStock.ratingScore).label}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      ({ratingStock.ratingScore.toFixed(1)} / 5.0)
                    </span>
                  </div>
                </div>

                <span style={{ 
                  padding: "8px 16px", 
                  borderRadius: "20px", 
                  backgroundColor: getRatingBadgeColor(ratingStock.ratingScore).bg, 
                  color: getRatingBadgeColor(ratingStock.ratingScore).text,
                  fontWeight: "700",
                  fontSize: "0.9rem"
                }}>
                  {getRatingBadgeColor(ratingStock.ratingScore).label.toUpperCase()}
                </span>
              </div>

              {/* Rationale text box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Daily Analysis Summary</span>
                <p style={{ 
                  fontSize: "0.9rem", 
                  color: "var(--text-primary)", 
                  lineHeight: "1.6", 
                  backgroundColor: "rgba(255,255,255,0.01)", 
                  padding: "16px", 
                  borderRadius: "8px", 
                  borderLeft: "2px solid var(--color-secondary)" 
                }}>
                  {ratingStock.aiSummary}
                </p>
              </div>

              {/* Extra consensus metrics summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Valuation Index</span>
                  <span style={{ display: "block", fontSize: "1rem", fontWeight: "600", marginTop: "4px", color: ratingStock.peRatio > 40 ? "var(--color-warning)" : "var(--color-success)" }}>
                    {ratingStock.peRatio > 40 ? "Premium Valuation" : "Fair Valuation"}
                  </span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Target Growth Upside</span>
                  <span style={{ display: "block", fontSize: "1rem", fontWeight: "600", marginTop: "4px", color: ratingStock.analystTarget > ratingStock.price ? "var(--color-success)" : "var(--color-danger)" }}>
                    +{(((ratingStock.analystTarget - ratingStock.price) / ratingStock.price) * 100).toFixed(1)}% Upside
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
