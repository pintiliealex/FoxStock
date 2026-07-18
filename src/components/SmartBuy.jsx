import React, { useState } from "react";
import { Sparkles, Settings, ArrowUpRight, Plus, Check, Play, BrainCircuit, Terminal, Star } from "lucide-react";
import Sparkline from "./Sparkline";

export default function SmartBuy({ stocks, favorites, onToggleFavorite }) {
  const [prompt, setPrompt] = useState(
    "As a global stock market trading expert analyze the stocks that dropped more than 25-30% in the past month / week and you would buy today for a target of 30% price increase in the next 6 month with a low-medium risk"
  );
  const [recommendCount, setRecommendCount] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Mock generator creating reasoned reports based on current stock data & prompt terms
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setRecommendations([]);
    setLogs([]);

    const logSteps = [
      "Initializing Deep Market AI Agent...",
      "Analyzing natural language prompt criteria...",
      "Scanning database for asset metrics (P/E, Forward P/E, 52-Week ranges)...",
      "Evaluating risk profile (beta parameters, volatility vectors)...",
      "Calculating historic drawdown differentials...",
      "Generating action consensus profiles..."
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (index === logSteps.length - 1) {
          generateReport();
        }
      }, (index + 1) * 400);
    });
  };

  const generateReport = () => {
    // Rank stocks based on some logic. E.g. sorting by combination of analyst consensus, PE ratio, and drawdown
    // Let's calculate a custom suitability score based on prompt keywords
    const lowerPrompt = prompt.toLowerCase();
    
    const ratedStocks = stocks.map(stock => {
      // Find drawdown percent from 52w high
      const drawdown = ((stock.high52 - stock.price) / stock.high52) * 100;
      let score = 50; // base score

      // Customize scoring based on prompt keywords
      if (lowerPrompt.includes("drop") || lowerPrompt.includes("down")) {
        score += drawdown * 1.2;
      }
      if (lowerPrompt.includes("low-medium risk") || lowerPrompt.includes("low risk")) {
        score += (50 - stock.peRatio) * 0.5; // favor lower PE
      }
      if (lowerPrompt.includes("target") || lowerPrompt.includes("increase")) {
        score += stock.ratingScore * 10; // favor high analyst consensus
      }

      // Add a slight random factor to make it feel dynamic
      score += Math.random() * 15;

      // Custom tailored AI Rationale generation
      let rationale = "";
      if (drawdown > 15) {
        rationale = `${stock.name} matches criteria perfectly, exhibiting a significant drawdown of ${drawdown.toFixed(1)}% from its 52-week high of $${stock.high52.toFixed(2)}. Despite short-term correction, solid core fundamentals (P/E of ${stock.peRatio}) and strong analyst consensus target of $${stock.analystTarget.toFixed(2)} make it a highly asymmetric buy for the target horizon.`;
      } else {
        rationale = `Positioned excellently as a premium defensive pick. With an analyst score of ${stock.ratingScore}/5.0 and forward P/E sitting at ${stock.forwardPe}, this equity is highly resilient against market macro-fluctuations, aligned with the low-to-medium risk profiles specified.`;
      }

      return {
        ...stock,
        suitabilityScore: Math.min(99, Math.max(40, Math.round(score))),
        aiRationale: rationale,
        drawdown: parseFloat(drawdown.toFixed(1))
      };
    });

    // Sort by suitability score descending and take the requested count (5 or 10)
    const sorted = ratedStocks.sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, recommendCount);
    
    setIsAnalyzing(false);
    setRecommendations(sorted);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "24px 0", textAlign: "left" }}>
      
      {/* Title block */}
      <div>
        <h1 style={{ fontSize: "2rem" }}>AI Smart Buy Recommendations</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Prompt the AI Trading Agent to scan the market and select undervalued assets fitting your custom strategy.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
        
        {/* Settings & Prompt Card */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
            <BrainCircuit size={18} /> Configure AI Agent Instruction Prompt
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>
              Strategy Description / Instruction Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid var(--border-glass)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                outline: "none",
                resize: "none",
                lineHeight: "1.5"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Recommendation Count:</span>
              <select
                value={recommendCount}
                onChange={(e) => setRecommendCount(parseInt(e.target.value))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.85rem"
                }}
              >
                <option value={5}>Top 5 Recommendations</option>
                <option value={10}>Top 10 Recommendations</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              className="btn-primary"
              disabled={isAnalyzing}
              style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px" }}
            >
              <Sparkles size={16} /> {isAnalyzing ? "Agent Analyzing..." : "Generate Picks"}
            </button>
          </div>
        </div>

        {/* Live console logging for authentic feel */}
        {isAnalyzing && (
          <div className="glass-panel" style={{ padding: "20px", backgroundColor: "#0c0e16", border: "1px solid var(--border-focus)", fontFamily: "monospace", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontSize: "0.85rem", marginBottom: "12px", fontWeight: "600" }}>
              <Terminal size={14} /> AI AGENT RUNTIME CONSOLE LOGS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", color: "#a7f3d0" }}>
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
              <div className="pulsing-indicator" style={{ display: "inline-block", width: "4px", height: "12px", backgroundColor: "var(--color-primary)" }} />
            </div>
          </div>
        )}

        {/* Recommended stock results list */}
        {recommendations.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--color-secondary)" /> AI Recommendations Report
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {recommendations.map((rec, index) => {
                const isFavorited = favorites.includes(rec.symbol);
                const isPos = rec.change >= 0;
                
                return (
                  <div 
                    key={rec.symbol}
                    className="glass-panel"
                    style={{ 
                      padding: "24px", 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                      gap: "20px",
                      position: "relative",
                      borderLeft: `4px solid var(--color-primary)`
                    }}
                  >
                    {/* Rank Badge */}
                    <div style={{ 
                      position: "absolute", 
                      top: "0", 
                      left: "0", 
                      backgroundColor: "var(--color-primary)", 
                      color: "#fff", 
                      fontSize: "0.75rem", 
                      fontWeight: "700", 
                      padding: "4px 10px", 
                      borderRadius: "0 0 8px 0" 
                    }}>
                      Rank #{index + 1}
                    </div>

                    {/* Stock overview */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h4 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#fff", margin: 0 }}>{rec.symbol}</h4>
                          <span style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
                            {rec.sector}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{rec.name}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                        <span style={{ fontSize: "1.6rem", fontWeight: "700" }}>${rec.price.toFixed(2)}</span>
                        <span style={{ color: isPos ? "var(--color-success)" : "var(--color-danger)", fontWeight: "600", fontSize: "0.85rem" }}>
                          {isPos ? "+" : ""}{rec.changePercent.toFixed(2)}%
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(139, 92, 246, 0.08)", padding: "8px 12px", borderRadius: "8px", width: "fit-content" }}>
                        <BrainCircuit size={14} color="var(--color-primary)" />
                        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-primary)" }}>
                          Match Score: {rec.suitabilityScore}%
                        </span>
                      </div>
                    </div>

                    {/* AI rationale details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Agent Evaluation & Rationale
                      </span>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: "1.6", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "6px", borderLeft: "2px solid var(--color-secondary)" }}>
                        {rec.aiRationale}
                      </p>
                    </div>

                    {/* Indicator Summary & Watchlist Action */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", justifyContent: "space-between" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>P/E Ratio</span>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{rec.peRatio}</span>
                        </div>
                        <div style={{ padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>52W Drawdown</span>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-danger)" }}>-{rec.drawdown}%</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                        <button
                          onClick={() => onToggleFavorite(rec.symbol)}
                          className={isFavorited ? "btn-secondary" : "btn-primary"}
                          style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.85rem", gap: "6px", borderRadius: "8px" }}
                        >
                          {isFavorited ? (
                            <><Check size={14} /> Watchlisted</>
                          ) : (
                            <><Star size={14} /> Add to Watchlist</>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
