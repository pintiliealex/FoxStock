import React, { useState, useEffect } from "react";
import { Star, Plus, Trash2, Settings2, BarChart2, StarOff, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import Sparkline from "./Sparkline";
import { AVAILABLE_INDICATORS } from "../data/mockStocks";

export default function Watchlist({
  stocks,
  favorites,
  onToggleFavorite,
  visibleIndicators,
  onToggleIndicator,
  onAddCustomStock,
  onChangeStockRange
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const favoritedStocks = stocks.filter((s) => favorites.includes(s.symbol));

  const getRangePerformance = (history) => {
    if (!history || history.length < 2) return null;
    const start = history[0];
    const end = history[history.length - 1];
    const diff = end - start;
    const pct = (diff / start) * 100;
    return {
      diff,
      pct,
      isPositive: diff >= 0
    };
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      const query = searchQuery.trim();
      const urls = [
        `/api-yahoo/v1/finance/search?q=${query}`,
        `https://corsproxy.io/?url=https://query1.finance.yahoo.com/v1/finance/search?q=${query}`,
        `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v1/finance/search?q=${query}`
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          const quotes = data?.quotes || [];
          
          // filter to equities with valid symbols
          const filtered = quotes
            .filter((q) => q.quoteType === "EQUITY" && q.symbol)
            .slice(0, 6);
            
          setSearchResults(filtered);
          break;
        } catch (e) {
          // continue to next URL
        }
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Helper to render 52-week range bar
  const renderRange52 = (stock) => {
    const range = stock.high52 - stock.low52;
    const position = range === 0 ? 50 : ((stock.price - stock.low52) / range) * 100;
    const safePos = Math.max(0, Math.min(100, position));

    return (
      <div style={{ width: "100%", margin: "8px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
          <span>${stock.low52.toFixed(2)}</span>
          <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>Current: ${stock.price.toFixed(2)}</span>
          <span>${stock.high52.toFixed(2)}</span>
        </div>
        <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-glass)", borderRadius: "3px", position: "relative" }}>
          <div style={{ 
            position: "absolute", 
            left: `${safePos}%`, 
            top: "50%", 
            transform: "translate(-50%, -50%)", 
            width: "10px", 
            height: "10px", 
            borderRadius: "50%", 
            backgroundColor: "var(--color-primary)",
            boxShadow: "0 0 8px var(--color-primary)" 
          }} />
        </div>
      </div>
    );
  };

  // Helper to render quarterly revenue mini chart
  const renderRevenue = (stock) => {
    const maxRev = Math.max(...stock.quarterlyRevenue.map((r) => r.revenue));

    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "55px", marginTop: "8px" }}>
        {stock.quarterlyRevenue.map((rev) => {
          const heightPercent = (rev.revenue / maxRev) * 100;
          return (
            <div key={rev.quarter} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-primary)", fontWeight: "600", marginBottom: "2px" }}>
                ${rev.revenue.toFixed(1)}B
              </span>
              <div 
                style={{ 
                  width: "100%", 
                  height: `${Math.max(4, heightPercent * 0.25)}px`, 
                  background: "linear-gradient(to top, var(--color-primary), var(--color-secondary))",
                  borderRadius: "2px",
                  position: "relative"
                }} 
                title={`${rev.quarter}: $${rev.revenue}B`}
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "4px", transform: "scale(0.85)" }}>
                {rev.quarter}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px 0" }}>
      
      {/* Top action header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ textAlign: "left", fontSize: "2rem" }}>Market Watchlist</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "left" }}>
            Track and customize metrics for your favorited securities.
          </p>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)} 
          className="btn-secondary"
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "12px" }}
        >
          <Settings2 size={16} /> Customize Indicators
        </button>
      </div>

      {/* Indicator configuration slide-out panel */}
      {showConfig && (
        <div className="glass-panel" style={{ padding: "20px", textAlign: "left", animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "12px", color: "var(--color-primary)" }}>
            Toggle Visible Indicators
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {AVAILABLE_INDICATORS.map((ind) => (
              <label 
                key={ind.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  padding: "10px 14px", 
                  borderRadius: "10px", 
                  background: "rgba(255,255,255,0.03)", 
                  cursor: "pointer",
                  transition: "var(--transition)",
                  border: "1px solid var(--border-glass)"
                }}
              >
                <input 
                  type="checkbox" 
                  checked={visibleIndicators.includes(ind.id)}
                  onChange={() => onToggleIndicator(ind.id)}
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>{ind.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Favorite stocks list/cards */}
      {favoritedStocks.length === 0 ? (
        <div className="glass-panel" style={{ padding: "48px", textAlign: "center" }}>
          <StarOff size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3 style={{ marginBottom: "8px" }}>No favorite stocks added yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Search and add stocks below to start tracking customized indicators.
          </p>
        </div>
      ) : (
        <div className="watchlist-grid">
          {favoritedStocks.map((stock) => {
            const isPos = stock.change >= 0;
            return (
              <div 
                key={stock.symbol} 
                className="glass-panel" 
                style={{ 
                  padding: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "16px",
                  position: "relative",
                  borderLeft: `4px solid ${isPos ? "var(--color-success)" : "var(--color-danger)"}`
                }}
              >
                {/* Header info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#fff", margin: 0 }}>{stock.symbol}</h2>
                      <span style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
                        {stock.sector}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", textAlign: "left", marginTop: "2px" }}>
                      {stock.name}
                    </span>
                  </div>

                  <button 
                    onClick={() => onToggleFavorite(stock.symbol)}
                    style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "4px" }}
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Price indicators */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>${stock.price.toFixed(2)}</h3>
                  <span style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "2px", 
                    color: isPos ? "var(--color-success)" : "var(--color-danger)",
                    fontWeight: "600",
                    fontSize: "0.9rem"
                  }}>
                    {isPos ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)" }} />

                {/* Dynamic Indicators Widgets */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  {visibleIndicators.includes("peRatio") && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>P/E Ratio</span>
                      <span style={{ fontWeight: "600" }}>{stock.peRatio}</span>
                    </div>
                  )}

                  {visibleIndicators.includes("forwardPe") && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Forward P/E</span>
                      <span style={{ fontWeight: "600" }}>{stock.forwardPe}</span>
                    </div>
                  )}

                  {visibleIndicators.includes("industryPe") && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Industry P/E</span>
                      <span style={{ fontWeight: "600" }}>{stock.industryPe || "25.8"}</span>
                    </div>
                  )}

                  {visibleIndicators.includes("range52") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "left" }}>52-Week Range</span>
                      {renderRange52(stock)}
                    </div>
                  )}

                  {visibleIndicators.includes("ath") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.85rem", textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>All-Time High</span>
                        <span style={{ fontWeight: "600", color: "var(--color-success)" }}>${stock.ath ? stock.ath.toFixed(2) : (stock.price * 1.15).toFixed(2)}</span>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", alignSelf: "flex-end" }}>
                        Happened: {stock.athDate || "2024-07-15"}
                      </span>
                    </div>
                  )}

                  {visibleIndicators.includes("quarterlyRevenue") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "left" }}>Quarterly Revenues (B)</span>
                      {renderRevenue(stock)}
                    </div>
                  )}

                  {visibleIndicators.includes("sparkline") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "left" }}>Price evolution</span>
                        <select 
                          value={stock.activeRange || "1mo"} 
                          onChange={(e) => onChangeStockRange(stock.symbol, e.target.value)}
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid var(--border-glass)",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.75rem",
                            outline: "none"
                          }}
                        >
                          <option value="1d">1D</option>
                          <option value="5d">1W</option>
                          <option value="1mo">1M</option>
                          <option value="6mo">6M</option>
                          <option value="1y">1Y</option>
                          <option value="2y">2Y</option>
                          <option value="5y">5Y</option>
                          <option value="10y">10Y</option>
                        </select>
                      </div>
                      {(() => {
                        const perf = getRangePerformance(stock.history);
                        if (!perf) return null;
                        const isPeriodPos = perf.isPositive;
                        return (
                          <div style={{ 
                            fontSize: "0.75rem", 
                            color: isPeriodPos ? "var(--color-success)" : "var(--color-danger)",
                            fontWeight: "700",
                            textAlign: "left",
                            marginTop: "-4px",
                            marginBottom: "4px"
                          }}>
                            Period Return: {isPeriodPos ? "+" : ""}{perf.pct.toFixed(2)}% ({isPeriodPos ? "+" : ""}${perf.diff.toFixed(2)})
                          </div>
                        );
                      })()}
                      <div style={{ padding: "6px 0" }}>
                        {(() => {
                          const perf = getRangePerformance(stock.history);
                          const isPeriodPos = perf ? perf.isPositive : isPos;
                          return <Sparkline data={stock.history} isPositive={isPeriodPos} />;
                        })()}
                      </div>
                    </div>
                  )}

                  {visibleIndicators.includes("analystTarget") && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block", textAlign: "left" }}>Analyst Target</span>
                        <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>${stock.analystTarget.toFixed(2)}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>Consensus</span>
                        <span style={{ 
                          fontWeight: "700", 
                          color: stock.consensus.includes("Buy") ? "var(--color-success)" : "var(--color-warning)" 
                        }}>
                          {stock.consensus}
                        </span>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add new stocks module */}
      <div className="glass-panel" style={{ padding: "28px", textAlign: "left" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={18} color="var(--color-primary)" /> Search & Add Stock assets
        </h3>
        
        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "480px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by symbol or name (e.g. MSFT)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "8px",
                border: "1px solid var(--border-glass)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>

        {/* Results grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {isSearching && (
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Searching US stock market...</span>
          )}
          
          {!isSearching && searchResults.map((result) => {
            const isFavorited = favorites.includes(result.symbol);
            return (
              <div 
                key={result.symbol} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "14px 18px", 
                  borderRadius: "10px", 
                  background: "rgba(255,255,255,0.02)", 
                  border: "1px solid var(--border-glass)" 
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "700", color: "#fff" }}>{result.symbol}</span>
                    <span style={{ fontSize: "0.65rem", padding: "1px 4px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
                      {result.exchange}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {result.shortname || result.longname || result.symbol}
                  </span>
                </div>
                
                <button 
                  onClick={() => onAddCustomStock(result.symbol, result.shortname || result.longname)}
                  className={isFavorited ? "btn-secondary" : "btn-primary"}
                  disabled={isFavorited}
                  style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", gap: "4px" }}
                >
                  {isFavorited ? "Added" : <><Plus size={14} /> Add</>}
                </button>
              </div>
            );
          })}

          {!isSearching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No stocks found on US market matching "{searchQuery}"</span>
          )}
        </div>
      </div>

    </div>
  );
}
