import React, { useState, useEffect } from "react";
import { INITIAL_STOCKS, MOCK_INDICES, AVAILABLE_INDICATORS } from "./data/mockStocks";
import Dashboard from "./components/Dashboard";
import Watchlist from "./components/Watchlist";
import AlertsHub from "./components/AlertsHub";
import { TrendingUp, Bell, Star, LayoutDashboard, Sun, Moon, AlertTriangle, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("foxstock-theme") || "dark");
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [indices, setIndices] = useState(MOCK_INDICES);
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("foxstock-favorites");
    return saved ? JSON.parse(saved) : ["AAPL", "MSFT", "TSLA", "NVDA"];
  });

  const [visibleIndicators, setVisibleIndicators] = useState(() => {
    const saved = localStorage.getItem("foxstock-indicators");
    return saved ? JSON.parse(saved) : AVAILABLE_INDICATORS.map(i => i.id);
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem("foxstock-alerts");
    return saved ? JSON.parse(saved) : [
      { id: "1", symbol: "AAPL", type: "price_below", value: 185.00, active: true },
      { id: "2", symbol: "NVDA", type: "price_above", value: 890.00, active: true }
    ];
  });

  const [notifications, setNotifications] = useState([]);

  // Theme Syncing
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    localStorage.setItem("foxstock-theme", theme);
  }, [theme]);

  // Persist State
  useEffect(() => {
    localStorage.setItem("foxstock-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("foxstock-indicators", JSON.stringify(visibleIndicators));
  }, [visibleIndicators]);

  useEffect(() => {
    localStorage.setItem("foxstock-alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Live Yahoo Finance fetching
  const fetchLivePrices = async () => {
    const symbols = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "AMZN", "NFLX", "META"];
    try {
      const promises = symbols.map(async (sym) => {
        const urls = [
          `/api-yahoo/v8/finance/chart/${sym}`,
          `https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/${sym}`,
          `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${sym}`
        ];

        for (const url of urls) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            const result = data?.chart?.result?.[0];
            if (result) {
              const currentPrice = result.meta.regularMarketPrice;
              const prevClose = result.meta.chartPreviousClose || currentPrice;
              const change = currentPrice - prevClose;
              const changePercent = (change / prevClose) * 100;
              const rawQuote = result.indicators?.quote?.[0]?.close || [];
              const cleanHistory = rawQuote.filter(v => v !== null && v !== undefined).slice(-30);

              return {
                symbol: sym,
                price: parseFloat(currentPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                history: cleanHistory.map(h => parseFloat(h.toFixed(2)))
              };
            }
          } catch (e) {
            // Silently try next url
          }
        }
        return null;
      });

      const updatedResults = await Promise.all(promises);
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const liveData = updatedResults.find(r => r && r.symbol === stock.symbol);
          if (liveData) {
            return {
              ...stock,
              price: liveData.price,
              change: liveData.change,
              changePercent: liveData.changePercent,
              history: liveData.history.length > 0 ? liveData.history : stock.history
            };
          }
          return stock;
        })
      );
    } catch (e) {
      console.error("Failed to execute live fetch sequence:", e);
    }
  };

  // Run live fetches on mount and setup recurring refresh
  useEffect(() => {
    fetchLivePrices();
    const liveInterval = setInterval(fetchLivePrices, 25000);
    return () => clearInterval(liveInterval);
  }, []);

  // Real-time market simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate stock price updates
      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          // Standard random walk
          const volatility = 0.003; // max 0.3% change per tick
          const direction = Math.random() > 0.48 ? 1 : -1;
          const changePercent = Math.random() * volatility * direction;
          const priceDiff = stock.price * changePercent;
          const newPrice = Math.max(1, stock.price + priceDiff);
          const newChange = stock.change + priceDiff;
          const newChangePercent = (newChange / (newPrice - newChange)) * 100;
          
          // History update (keep last 30 entries)
          const newHistory = [...stock.history.slice(1), parseFloat(newPrice.toFixed(2))];

          // Check if any active alerts are triggered for this stock
          alerts.forEach((alert) => {
            if (alert.symbol === stock.symbol && alert.active) {
              let triggered = false;
              if (alert.type === "price_below" && newPrice <= alert.value) {
                triggered = true;
              } else if (alert.type === "price_above" && newPrice >= alert.value) {
                triggered = true;
              } else if (alert.type === "pe_below" && stock.peRatio <= alert.value) {
                triggered = true;
              }

              if (triggered) {
                // Add notification
                const newNotification = {
                  id: Date.now() + Math.random().toString(36).substr(2, 5),
                  type: alert.type === "price_below" ? "danger" : "success",
                  text: `ALERT: ${stock.symbol} condition triggered! Value is ${
                    alert.type.includes("pe") ? "P/E " : "$"
                  }${newPrice.toFixed(2)}.`
                };
                setNotifications((prev) => [newNotification, ...prev]);

                // Auto-deactivate alert trigger
                setAlerts((prevAlerts) =>
                  prevAlerts.map((a) => (a.id === alert.id ? { ...a, active: false } : a))
                );
              }
            }
          });

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            history: newHistory
          };
        });
      });

      // Simulate index updates
      setIndices((prevIndices) => {
        return prevIndices.map((idx) => {
          const volatility = 0.001;
          const direction = Math.random() > 0.49 ? 1 : -1;
          const priceDiff = idx.price * volatility * direction * Math.random();
          const newPrice = idx.price + priceDiff;
          const newChange = idx.change + priceDiff;
          const newChangePercent = (newChange / (newPrice - newChange)) * 100;

          return {
            ...idx,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            changePercent: parseFloat(newChangePercent.toFixed(2))
          };
        });
      });

    }, 4000);

    return () => clearInterval(interval);
  }, [alerts]);

  // Alert State Handlers
  const handleAddAlert = (newAlert) => {
    setAlerts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        symbol: newAlert.symbol,
        type: newAlert.type,
        value: newAlert.value,
        active: true
      }
    ]);
  };

  const handleRemoveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleToggleAlertStatus = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a))
    );
  };

  // Trigger manual AI simulation update
  const handleTriggerAIRatingUpdate = () => {
    // Randomize rating score and reasoning slightly to simulate recalculation
    setStocks((prev) =>
      prev.map((stock) => {
        const volatility = 0.2;
        const scoreDiff = (Math.random() - 0.5) * volatility;
        const nextScore = Math.max(1, Math.min(5, stock.ratingScore + scoreDiff));
        
        let consensus = "Hold";
        if (nextScore >= 4.5) consensus = "Strong Buy";
        else if (nextScore >= 4.0) consensus = "Buy";
        else if (nextScore >= 3.0) consensus = "Hold";
        else consensus = "Sell";

        return {
          ...stock,
          ratingScore: parseFloat(nextScore.toFixed(2)),
          consensus
        };
      })
    );

    // Prompt user with a notice
    const newNotif = {
      id: Date.now().toString(),
      type: "info",
      text: "Daily Ratings Consensus successfully regenerated."
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleToggleFavorite = (symbol) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleToggleIndicator = (indicatorId) => {
    setVisibleIndicators((prev) =>
      prev.includes(indicatorId)
        ? prev.filter((i) => i !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  // Close single notification
  const handleDismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Top Notification banner list */}
      <div style={{ position: "fixed", top: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 1000 }}>
        {notifications.map((notif) => (
          <div key={notif.id} className={`alert-banner ${notif.type}`}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: "600", textAlign: "left" }}>{notif.text}</div>
            <button 
              onClick={() => handleDismissNotification(notif.id)}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex" }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Main Header / Navigation bar */}
      <header className="glass-panel" style={{ 
        margin: "16px 16px 0 16px", 
        padding: "16px 24px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderRadius: "var(--radius-md)"
      }}>
        
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "10px", 
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Fox<span style={{ color: "var(--color-primary)" }}>Stock</span>
          </span>
        </div>

        {/* Desktop navigation tabs */}
        <nav style={{ display: "flex", gap: "8px" }}>
          <button 
            className={activeTab === "dashboard" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("dashboard")}
            style={{ padding: "8px 16px", borderRadius: "10px", gap: "6px", fontSize: "0.9rem" }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button 
            className={activeTab === "watchlist" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("watchlist")}
            style={{ padding: "8px 16px", borderRadius: "10px", gap: "6px", fontSize: "0.9rem" }}
          >
            <Star size={16} /> Watchlist
          </button>
          <button 
            className={activeTab === "alerts" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("alerts")}
            style={{ padding: "8px 16px", borderRadius: "10px", gap: "6px", fontSize: "0.9rem" }}
          >
            <Bell size={16} /> Alerts & AI
          </button>
        </nav>

        {/* Theme control toggle */}
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ 
            background: "none", 
            border: "1px solid var(--border-glass)", 
            color: "var(--text-primary)", 
            padding: "8px", 
            borderRadius: "10px", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px"
          }}
          title={theme === "dark" ? "Toggle Light Mode" : "Toggle Dark Mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Primary body view content */}
      <main style={{ flex: 1, padding: "0 16px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {activeTab === "dashboard" && (
          <Dashboard 
            onNavigate={setActiveTab}
            stocks={stocks}
            indices={indices}
            favorites={favorites}
            alerts={alerts}
          />
        )}

        {activeTab === "watchlist" && (
          <Watchlist 
            stocks={stocks}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            visibleIndicators={visibleIndicators}
            onToggleIndicator={handleToggleIndicator}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsHub 
            stocks={stocks}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onRemoveAlert={handleRemoveAlert}
            onToggleAlertStatus={handleToggleAlertStatus}
            onTriggerAIRatingUpdate={handleTriggerAIRatingUpdate}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="glass-panel" style={{ 
        margin: "32px 16px 16px 16px", 
        padding: "16px 24px", 
        textAlign: "center", 
        fontSize: "0.8rem", 
        color: "var(--text-muted)",
        borderRadius: "var(--radius-md)"
      }}>
        © {new Date().getFullYear()} FoxStock Inc. Premium Quantitative Analytics Engine. Simulated Data Feed Active.
      </footer>

    </div>
  );
}
