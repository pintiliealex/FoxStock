import React, { useState } from "react";
import { Briefcase, Plus, Trash2, Edit2, TrendingUp, Sparkles, PieChart, Info, BarChart2, ShieldAlert } from "lucide-react";

export default function Portfolio({ stocks, portfolio, onUpdatePortfolio, indices }) {
  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol || "");
  const [sharesInput, setSharesInput] = useState("");
  const [costInput, setCostInput] = useState("");
  const [editingSymbol, setEditingSymbol] = useState(null);
  
  // AI Enquiry States
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Get active stock metrics
  const activeStock = stocks.find((s) => s.symbol === selectedSymbol);

  // Calculate portfolio values
  const positionsWithData = portfolio.map(pos => {
    const stock = stocks.find(s => s.symbol === pos.symbol) || { price: pos.avgCost, changePercent: 0, sector: "Unknown", name: pos.symbol };
    const currentPrice = stock.price;
    const value = pos.shares * currentPrice;
    const costBasis = pos.shares * pos.avgCost;
    const gainLoss = value - costBasis;
    const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    
    // Daily gain calculation
    const dailyChangePct = stock.changePercent || 0;
    const prevPrice = currentPrice / (1 + dailyChangePct / 100);
    const dailyGainLoss = pos.shares * (currentPrice - prevPrice);

    return {
      ...pos,
      stock,
      currentPrice,
      value,
      costBasis,
      gainLoss,
      gainLossPct,
      dailyGainLoss,
      sector: stock.sector
    };
  });

  const totalValue = positionsWithData.reduce((sum, pos) => sum + pos.value, 0);
  const totalCostBasis = positionsWithData.reduce((sum, pos) => sum + pos.costBasis, 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPct = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  
  const totalDailyGainLoss = positionsWithData.reduce((sum, pos) => sum + pos.dailyGainLoss, 0);
  const portfolioDailyChangePct = totalValue > 0 ? (totalDailyGainLoss / (totalValue - totalDailyGainLoss)) * 100 : 0;

  // Sector diversification calculation
  const sectorWeightMap = {};
  positionsWithData.forEach(pos => {
    const weight = totalValue > 0 ? (pos.value / totalValue) * 100 : 0;
    sectorWeightMap[pos.sector] = (sectorWeightMap[pos.sector] || 0) + weight;
  });

  const sectorWeights = Object.keys(sectorWeightMap).map(sector => ({
    name: sector,
    weight: sectorWeightMap[sector]
  })).sort((a, b) => b.weight - a.weight);

  // Add / Edit position handler
  const handleSavePosition = (e) => {
    e.preventDefault();
    if (!sharesInput || isNaN(parseFloat(sharesInput)) || parseFloat(sharesInput) <= 0) return;
    if (!costInput || isNaN(parseFloat(costInput)) || parseFloat(costInput) <= 0) return;

    const shares = parseFloat(sharesInput);
    const avgCost = parseFloat(costInput);

    let nextPortfolio = [...portfolio];
    const existingIdx = nextPortfolio.findIndex(p => p.symbol === selectedSymbol);

    if (existingIdx >= 0) {
      // Edit existing
      nextPortfolio[existingIdx] = { symbol: selectedSymbol, shares, avgCost };
    } else {
      // Add new
      nextPortfolio.push({ symbol: selectedSymbol, shares, avgCost });
    }

    onUpdatePortfolio(nextPortfolio);
    setSharesInput("");
    setCostInput("");
    setEditingSymbol(null);
  };

  // Remove position
  const handleRemovePosition = (symbol) => {
    const nextPortfolio = portfolio.filter(p => p.symbol !== symbol);
    onUpdatePortfolio(nextPortfolio);
    if (editingSymbol === symbol) {
      setEditingSymbol(null);
      setSharesInput("");
      setCostInput("");
    }
  };

  // Trigger edit mode
  const handleStartEdit = (pos) => {
    setEditingSymbol(pos.symbol);
    setSelectedSymbol(pos.symbol);
    setSharesInput(pos.shares.toString());
    setCostInput(pos.avgCost.toString());
  };

  // AI Insights generator
  const triggerAiEnquiry = (questionKey) => {
    setActiveQuestion(questionKey);
    setIsAiLoading(true);
    setAiResponse("");

    setTimeout(() => {
      let answer = "";
      if (portfolio.length === 0) {
        answer = "Your portfolio is currently empty. Please add some stock positions above to trigger a customized AI Analysis report.";
        setAiResponse(answer);
        setIsAiLoading(false);
        return;
      }

      switch (questionKey) {
        case "move":
          // Why did my portfolio move today?
          const sortedMovers = [...positionsWithData].sort((a, b) => Math.abs(b.dailyGainLoss) - Math.abs(a.dailyGainLoss));
          const primaryMover = sortedMovers[0];
          const isPos = totalDailyGainLoss >= 0;
          answer = `Your portfolio moved **${isPos ? "+" : ""}${portfolioDailyChangePct.toFixed(2)}%** today (${isPos ? "+" : ""}$${totalDailyGainLoss.toFixed(2)}).\n\n` +
            `The primary driver was **${primaryMover.symbol}** (${primaryMover.stock.name}), which moved **${primaryMover.stock.changePercent >= 0 ? "+" : ""}${primaryMover.stock.changePercent.toFixed(2)}%** impacting your daily balance by **${primaryMover.dailyGainLoss >= 0 ? "+" : ""}$${primaryMover.dailyGainLoss.toFixed(2)}**.\n\n` +
            `Broad market indices closed mixed: the NASDAQ was **+1.14%** and S&P 500 was **+0.66%**. Your tech concentration created alpha today.`;
          break;

        case "trade":
          // What should I sell/hold/buy?
          const buyCandidates = stocks.filter(s => s.ratingScore >= 4.4 && !portfolio.some(p => p.symbol === s.symbol)).slice(0, 2);
          const heldHoldings = positionsWithData.map(p => {
            let action = "HOLD";
            let color = "var(--text-secondary)";
            if (p.stock.ratingScore >= 4.3) { action = "BUY / ACCUMULATE"; }
            else if (p.stock.ratingScore < 3.2) { action = "TRIM / REDUCE"; }
            return `* **${p.symbol}**: ${action} (AI Score: ${p.stock.ratingScore.toFixed(1)})`;
          }).join("\n");

          answer = `### Actionable Portfolio Advice:\n\n` +
            `${heldHoldings}\n\n` +
            `**New Buying Opportunities**:\n` +
            `We recommend initiating positions in ${buyCandidates.map(c => `**${c.symbol}** (AI Score: ${c.ratingScore.toFixed(1)})`).join(" or ")} due to strong earnings momentum and low Debt-to-Equity structures.`;
          break;

        case "risk":
          // Which positions drive most of my risk?
          const volatileHoldings = [...positionsWithData].sort((a, b) => (b.stock.peRatio || 0) - (a.stock.peRatio || 0));
          const topRisk = volatileHoldings[0];
          answer = `The position driving the most volatility risk in your portfolio is **${topRisk.symbol}** (${topRisk.stock.name}) due to its elevated P/E ratio of **${topRisk.stock.peRatio}**.\n\n` +
            `* High P/E multipliers mean the asset is highly sensitive to yield fluctuations.\n` +
            `* Sector risk: Being weighted in **${topRisk.sector}** leaves you exposed to thematic swings. Consider balancing this with low-beta defensive consumer items.`;
          break;

        case "exposure":
          // Am I overexposed to one sector?
          const topSector = sectorWeights[0];
          if (topSector && topSector.weight > 40) {
            answer = `### ⚠️ Concentration Alert:\n\n` +
              `You are significantly exposed to **${topSector.name}**, which accounts for **${topSector.weight.toFixed(1)}%** of your total assets.\n\n` +
              `* To reduce industry-wide drawdown risks, we advise rebalancing capital. Try trimming exposure below 35% and moving proceeds into low-correlation sectors.`;
          } else {
            answer = `### ✅ Well Diversified:\n\n` +
              `Your largest sector is **${topSector?.name || "None"}** at **${topSector?.weight.toFixed(1) || 0}%**.\n\n` +
              `* Since no single industry exceeds 40% of the portfolio, you maintain healthy diversification parameters.`;
          }
          break;

        case "benchmarks":
          // What's my performance vs. benchmarks?
          const sp500 = indices.find(idx => idx.symbol === "S&P 500")?.changePercent || 0.66;
          const nasdaq = indices.find(idx => idx.symbol === "NASDAQ")?.changePercent || 1.14;
          const outSp = portfolioDailyChangePct > sp500;
          const outNas = portfolioDailyChangePct > nasdaq;

          answer = `### Daily Performance vs. Benchmarks:\n\n` +
            `* **Your Portfolio**: **${portfolioDailyChangePct >= 0 ? "+" : ""}${portfolioDailyChangePct.toFixed(2)}%**\n` +
            `* **S&P 500 Index**: **+${sp500}%** (${outSp ? "Outperformed ✅" : "Underperformed ❌"})\n` +
            `* **NASDAQ Index**: **+${nasdaq}%** (${outNas ? "Outperformed ✅" : "Underperformed ❌"})\n\n` +
            `Your daily performance was driven by your semiconductor allocations.`;
          break;

        default:
          answer = "Unknown enquiry requested.";
      }

      setAiResponse(answer);
      setIsAiLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", padding: "24px 0", textAlign: "left" }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "2rem" }}>Portfolio Manager</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Define your positions, track real-time returns, and receive instant AI diagnostics on risk and exposure.
        </p>
      </div>

      {/* Analytics Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Total Value</span>
          <span style={{ fontSize: "1.6rem", fontWeight: "700", display: "block", marginTop: "6px" }}>
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: "0.75rem", color: portfolioDailyChangePct >= 0 ? "var(--color-success)" : "var(--color-danger)", display: "block", marginTop: "4px", fontWeight: "600" }}>
            Daily: {portfolioDailyChangePct >= 0 ? "+" : ""}{portfolioDailyChangePct.toFixed(2)}% (${totalDailyGainLoss >= 0 ? "+" : ""}${totalDailyGainLoss.toFixed(2)})
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Cost Basis</span>
          <span style={{ fontSize: "1.6rem", fontWeight: "700", display: "block", marginTop: "6px" }}>
            ${totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
            All-Time Investment
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Total Gain / Loss</span>
          <span style={{ 
            fontSize: "1.6rem", 
            fontWeight: "700", 
            display: "block", 
            marginTop: "6px",
            color: totalGainLoss >= 0 ? "var(--color-success)" : "var(--color-danger)"
          }}>
            {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ 
            fontSize: "0.75rem", 
            color: totalGainLoss >= 0 ? "var(--color-success)" : "var(--color-danger)", 
            display: "block", 
            marginTop: "4px", 
            fontWeight: "600" 
          }}>
            {totalGainLoss >= 0 ? "+" : ""}{totalGainLossPct.toFixed(2)}% Total Return
          </span>
        </div>

      </div>

      {/* Main Grid: Management vs AI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "28px" }}>
        
        {/* Left Side: Positions Manager & Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Position Setup Form */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
              <Plus size={18} /> {editingSymbol ? "Modify Position" : "Add Position Asset"}
            </h3>

            <form onSubmit={handleSavePosition} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr", gap: "12px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Select Equity
                  </label>
                  <select 
                    value={selectedSymbol} 
                    onChange={(e) => {
                      setSelectedSymbol(e.target.value);
                      if (editingSymbol && editingSymbol !== e.target.value) {
                        setEditingSymbol(null);
                        setSharesInput("");
                        setCostInput("");
                      }
                    }}
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

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Shares
                  </label>
                  <input 
                    type="number"
                    step="any"
                    placeholder="10"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
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

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Avg Cost ($)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder={activeStock ? activeStock.price.toFixed(2) : "150.00"}
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
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

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                  <Plus size={16} /> {editingSymbol ? "Update Quantity" : "Add to Portfolio"}
                </button>
                {editingSymbol && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setEditingSymbol(null);
                      setSharesInput("");
                      setCostInput("");
                    }}
                    style={{ padding: "10px 16px", borderRadius: "8px" }}
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Positions Table Card */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Briefcase size={18} /> Active Holdings ({portfolio.length})
            </h3>
            
            {portfolio.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No active stock holdings. Enter your shares and cost basis above to begin tracking.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {positionsWithData.map((pos) => (
                  <div 
                    key={pos.symbol} 
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
                    <div style={{ textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#fff" }}>{pos.symbol}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{pos.sector}</span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                        {pos.shares} shares @ ${pos.avgCost.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                          ${pos.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          color: pos.gainLoss >= 0 ? "var(--color-success)" : "var(--color-danger)",
                          fontWeight: "600"
                        }}>
                          {pos.gainLoss >= 0 ? "+" : ""}{pos.gainLossPct.toFixed(2)}%
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => handleStartEdit(pos)}
                          style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "4px" }}
                          title="Edit Position"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleRemovePosition(pos.symbol)}
                          style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "4px" }}
                          title="Remove Position"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Sector Diversification & AI Advisor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Diversification panel */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <PieChart size={18} /> Sector Allocations
            </h3>

            {portfolio.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Add positions to view asset weight distributions.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {sectorWeights.map((sec, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ fontWeight: "500" }}>{sec.name}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{sec.weight.toFixed(1)}%</span>
                    </div>
                    {/* Weight Bar */}
                    <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          height: "100%", 
                          width: `${sec.weight}%`, 
                          background: "linear-gradient(to right, var(--color-primary), var(--color-secondary))"
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Advisor Panel */}
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)" }}>
              <Sparkles size={18} /> AI Portfolio Advisor
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "-6px" }}>
              Select a diagnostic inquiry question to run a real-time risk analysis on your current allocations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              <button 
                onClick={() => triggerAiEnquiry("move")}
                style={{
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: activeQuestion === "move" ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.01)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.2s"
                }}
              >
                ❓ "Why did my portfolio move today?"
              </button>

              <button 
                onClick={() => triggerAiEnquiry("trade")}
                style={{
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: activeQuestion === "trade" ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.01)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.2s"
                }}
              >
                ❓ "What should I sell/hold/buy?"
              </button>

              <button 
                onClick={() => triggerAiEnquiry("risk")}
                style={{
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: activeQuestion === "risk" ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.01)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.2s"
                }}
              >
                ❓ "Which positions drive most of my risk?"
              </button>

              <button 
                onClick={() => triggerAiEnquiry("exposure")}
                style={{
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: activeQuestion === "exposure" ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.01)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.2s"
                }}
              >
                ❓ "Am I overexposed to one sector?"
              </button>

              <button 
                onClick={() => triggerAiEnquiry("benchmarks")}
                style={{
                  textAlign: "left",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: activeQuestion === "benchmarks" ? "rgba(139, 92, 246, 0.08)" : "rgba(255,255,255,0.01)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.2s"
                }}
              >
                ❓ "What's my performance vs. benchmarks?"
              </button>

            </div>

            {/* AI Advisor Response Area */}
            {activeQuestion && (
              <div 
                style={{ 
                  marginTop: "12px", 
                  padding: "16px", 
                  borderRadius: "10px", 
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--border-glass)",
                  borderLeft: "3px solid var(--color-secondary)"
                }}
              >
                {isAiLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <div className="spinner" style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.1)",
                      borderTop: "2px solid var(--color-secondary)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                    <span>Analyzing portfolio metrics and generating response...</span>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--text-primary)" }}>
                    {aiResponse.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("### ")) {
                        return <h4 key={pIdx} style={{ fontSize: "0.95rem", fontWeight: "700", margin: "12px 0 6px 0", color: "var(--color-primary)" }}>{para.replace("### ", "")}</h4>;
                      }
                      if (para.startsWith("* ")) {
                        return (
                          <ul key={pIdx} style={{ margin: "4px 0", paddingLeft: "20px" }}>
                            {para.split("\n").map((li, lIdx) => (
                              <li key={lIdx} style={{ margin: "2px 0" }}>
                                {li.replace("* ", "").replace(/\*\*(.*?)\*\*/g, "$1")}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      // Replace bold markdown with styling
                      const formattedText = para.split(/\*\*(.*?)\*\*/g).map((chunk, cIdx) => 
                        cIdx % 2 === 1 ? <strong key={cIdx} style={{ color: "#fff" }}>{chunk}</strong> : chunk
                      );
                      return <p key={pIdx} style={{ margin: "8px 0" }}>{formattedText}</p>;
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
