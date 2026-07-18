import { TrendingUp, Bell, Star, ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, Cpu, BrainCircuit } from "lucide-react";

export default function Dashboard({ 
  onNavigate, 
  stocks, 
  indices, 
  favorites, 
  alerts 
}) {
  const activeAlertsCount = alerts.filter(a => a.active).length;
  
  // Calculate top performing stock today
  const topStock = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const strongBuysCount = stocks.filter(s => s.ratingScore >= 4.5).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", padding: "24px 0" }}>
      
      {/* Hero Welcome banner */}
      <div className="glass-panel" style={{ padding: "32px", textAlign: "left", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(var(--color-primary), transparent 70%)", opacity: 0.15, pointerEvents: "none" }} />
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "1.5px", display: "inline-block", marginBottom: "8px" }}>
          Welcome back to FoxStock
        </span>
        <h1 style={{ marginBottom: "12px", background: "linear-gradient(135deg, #fff, #9ca3af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Next-Gen Market Intelligence
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", lineHeight: "1.6" }}>
          Monitor your favorite equity assets, track customized indices, configure algorithmic alert thresholds, and view AI-driven rating consensus all in one unified, real-time dashboard.
        </p>
      </div>

      {/* Indices Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {indices.map((idx) => {
          const isPos = idx.change >= 0;
          return (
            <div key={idx.symbol} className="glass-panel" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>{idx.name}</span>
                <h3 style={{ fontSize: "1.4rem", margin: "4px 0", fontWeight: "600" }}>{idx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "4px", 
                padding: "6px 12px", 
                borderRadius: "20px", 
                backgroundColor: isPos ? "var(--color-success-bg)" : "var(--color-danger-bg)", 
                color: isPos ? "var(--color-success)" : "var(--color-danger)",
                fontSize: "0.85rem",
                fontWeight: "600"
              }}>
                {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {isPos ? "+" : ""}{idx.changePercent.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Large navigation modules buttons */}
      <div>
        <h2 style={{ textAlign: "left", marginBottom: "16px", fontSize: "1.3rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={18} color="var(--color-primary)" /> Screen Modules
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
          
          <div 
            className="glass-card-interactive" 
            style={{ padding: "32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}
            onClick={() => onNavigate("watchlist")}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>Favorite Stocks & Watchlist</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                Access customized analytical metrics like P/E ratios, 52-week ranges, revenue trends, and target consensus for your tracked stocks.
              </p>
            </div>
            <div style={{ display: "flex", justifySelf: "flex-end", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: "600", fontSize: "0.9rem", marginTop: "auto" }}>
              Track {favorites.length} Stocks <ArrowUpRight size={16} />
            </div>
          </div>

          <div 
            className="glass-card-interactive" 
            style={{ padding: "32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}
            onClick={() => onNavigate("smart_buy")}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BrainCircuit size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>AI Smart Buy Selector</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                Scan the global indices, evaluate price drop metrics, and generate customized top stock picks through our smart trading agent prompts.
              </p>
            </div>
            <div style={{ display: "flex", justifySelf: "flex-end", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: "600", fontSize: "0.9rem", marginTop: "auto" }}>
              Run AI Prompts <ArrowUpRight size={16} />
            </div>
          </div>

          <div 
            className="glass-card-interactive" 
            style={{ padding: "32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}
            onClick={() => onNavigate("alerts")}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(217, 70, 239, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={24} color="var(--color-secondary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>Smart Alerts & AI Insights</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                Set limits on asset prices, customize triggers, and access qualitative AI stock ratings, reasons, and strong recommendations.
              </p>
            </div>
            <div style={{ display: "flex", justifySelf: "flex-end", alignItems: "center", gap: "6px", color: "var(--color-secondary)", fontWeight: "600", fontSize: "0.9rem", marginTop: "auto" }}>
              {activeAlertsCount} Active Triggers <ArrowUpRight size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* Mini Stats Summary Strip */}
      <div className="glass-panel" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        
        <div style={{ borderRight: "1px solid var(--border-glass)", paddingRight: "12px", textAlign: "left" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>Top Gainer Today</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>{topStock ? topStock.symbol : "N/A"}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--color-success)", fontWeight: "600" }}>
              +{topStock ? topStock.changePercent.toFixed(2) : 0}%
            </span>
          </div>
        </div>

        <div style={{ borderRight: "1px solid var(--border-glass)", paddingRight: "12px", textAlign: "left" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>AI Strong Buys</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>{strongBuysCount} Assets</span>
            <span style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: "600" }}>Consensus Buy</span>
          </div>
        </div>

        <div style={{ textAlign: "left" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>Status & Connection</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-success)", position: "relative" }} className="pulsing-indicator" />
            <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "500" }}>Simulated Real-Time</span>
          </div>
        </div>

      </div>

    </div>
  );
}
