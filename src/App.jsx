import React, { useState, useEffect } from "react";
import { INITIAL_STOCKS, MOCK_INDICES, AVAILABLE_INDICATORS } from "./data/mockStocks";
import Dashboard from "./components/Dashboard";
import Watchlist from "./components/Watchlist";
import AlertsHub from "./components/AlertsHub";
import Auth from "./components/Auth";
import SmartBuy from "./components/SmartBuy";
import AdminPanel from "./components/AdminPanel";
import { TrendingUp, Bell, Star, LayoutDashboard, Sun, Moon, AlertTriangle, X, LogOut, BrainCircuit, User, ShieldAlert, Key, Lock } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("foxstock-theme") || "dark");
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [indices, setIndices] = useState(MOCK_INDICES);
  
  // Seed Database of users (Admin pre-seeded)
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("foxstock-users");
    const parsed = savedUsers ? JSON.parse(savedUsers) : [];
    const adminExists = parsed.some(u => u.email.toLowerCase() === "admin@foxstock.com");
    if (!adminExists) {
      const defaultAdmin = {
        email: "admin@foxstock.com",
        password: "admin123",
        role: "admin",
        status: "active",
        verificationCode: "",
        blocked: false,
        favorites: ["AAPL", "MSFT", "TSLA", "NVDA"],
        alerts: []
      };
      const newUsers = [defaultAdmin, ...parsed];
      localStorage.setItem("foxstock-users", JSON.stringify(newUsers));
      return newUsers;
    }
    return parsed;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("foxstock-current-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // User Preferences
  const [favorites, setFavorites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [visibleIndicators, setVisibleIndicators] = useState(() => {
    const saved = localStorage.getItem("foxstock-indicators");
    return saved ? JSON.parse(saved) : AVAILABLE_INDICATORS.map(i => i.id);
  });

  // Change Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassInput, setOldPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmNewPassInput, setConfirmNewPassInput] = useState("");
  const [passModalError, setPassModalError] = useState("");
  const [passModalSuccess, setPassModalSuccess] = useState("");

  // Daily Picks Database shared by all accounts
  const [dailyPicks, setDailyPicks] = useState(() => {
    const saved = localStorage.getItem("foxstock-daily-picks");
    if (saved) return JSON.parse(saved);
    return {
      prompt: "As a global stock market trading expert analyze the stocks that dropped more than 25-30% in the past month / week and you would buy today for a target of 30% price increase in the next 6 month with a low-medium risk",
      count: 5,
      picks: INITIAL_STOCKS.slice(0, 5).map(s => ({
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price: s.price,
        change: s.change,
        changePercent: s.changePercent,
        peRatio: s.peRatio,
        suitabilityScore: 92,
        aiRationale: `${s.name} represents a solid asymmetric opportunity. Solid quantitative indicators combined with defensive valuation metrics present a strong risk-reward ratio fitting the strategy.`,
        drawdown: 18
      })),
      generatedAt: new Date().toLocaleDateString()
    };
  });

  const [notifications, setNotifications] = useState([]);

  // Sync state on user login/switch
  useEffect(() => {
    if (currentUser) {
      setFavorites(currentUser.favorites || []);
      setAlerts(currentUser.alerts || []);
    } else {
      setFavorites([]);
      setAlerts([]);
    }
  }, [currentUser]);

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

  useEffect(() => {
    localStorage.setItem("foxstock-indicators", JSON.stringify(visibleIndicators));
  }, [visibleIndicators]);

  // Auth Functions
  const handleRegister = (email, password, verificationCode) => {
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newUser = {
      email,
      password,
      role: "user",
      status: "pending",
      verificationCode,
      blocked: false,
      favorites: ["AAPL", "MSFT", "TSLA", "NFLX"],
      alerts: []
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
    return true;
  };

  const handleVerifyCode = (email, code) => {
    let verified = false;
    const nextUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase() && u.verificationCode === code) {
        verified = true;
        return { ...u, status: "active", verificationCode: "" };
      }
      return u;
    });

    if (verified) {
      setUsers(nextUsers);
      localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
    }
    return verified;
  };

  const handleForgotPassword = (email, tempPass) => {
    let success = false;
    const nextUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        success = true;
        return { ...u, password: tempPass };
      }
      return u;
    });

    if (success) {
      setUsers(nextUsers);
      localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
    }
    return success;
  };

  const handleLogin = (email, password) => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser || foundUser.password !== password) {
      return { error: "Invalid email or password." };
    }

    if (foundUser.blocked) {
      return { error: "Your account has been blocked by an administrator." };
    }

    if (foundUser.status === "pending") {
      return { error: "Please verify your email address to activate your account." };
    }

    setCurrentUser(foundUser);
    localStorage.setItem("foxstock-current-user", JSON.stringify(foundUser));
    return { success: true };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("foxstock-current-user");
    setActiveTab("dashboard");
  };

  // Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPassModalError("");
    setPassModalSuccess("");

    if (!oldPassInput || !newPassInput || !confirmNewPassInput) {
      setPassModalError("Please fill in all fields.");
      return;
    }

    if (oldPassInput !== currentUser.password) {
      setPassModalError("Incorrect current password.");
      return;
    }

    if (newPassInput !== confirmNewPassInput) {
      setPassModalError("New passwords do not match.");
      return;
    }

    if (newPassInput.length < 6) {
      setPassModalError("New password must be at least 6 characters.");
      return;
    }

    // Update in database and state
    const updatedUser = { ...currentUser, password: newPassInput };
    setCurrentUser(updatedUser);
    localStorage.setItem("foxstock-current-user", JSON.stringify(updatedUser));

    setUsers((prevUsers) => {
      const nextUsers = prevUsers.map((u) => u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u);
      localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
      return nextUsers;
    });

    setPassModalSuccess("Password changed successfully!");
    setOldPassInput("");
    setNewPassInput("");
    setConfirmNewPassInput("");

    setTimeout(() => {
      setShowPasswordModal(false);
      setPassModalSuccess("");
    }, 1500);
  };

  // Helper database synchronizer (avoids infinite loops)
  const syncPreferencesToDb = (nextFavorites, nextAlerts) => {
    if (!currentUser) return;
    const updatedUser = { 
      ...currentUser, 
      favorites: nextFavorites || favorites, 
      alerts: nextAlerts || alerts 
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem("foxstock-current-user", JSON.stringify(updatedUser));

    setUsers((prevUsers) => {
      const nextUsers = prevUsers.map((u) => u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u);
      localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
      return nextUsers;
    });
  };

  // Admin Actions
  const handleToggleBlockUser = (email) => {
    if (email.toLowerCase() === "admin@foxstock.com") return;
    
    setUsers((prevUsers) => {
      const nextUsers = prevUsers.map((u) => 
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, blocked: !u.blocked } : u
      );
      localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
      return nextUsers;
    });

    // Force logout if blocked
    const updatedUsersList = JSON.parse(localStorage.getItem("foxstock-users") || "[]");
    const checkBlocked = updatedUsersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (checkBlocked && checkBlocked.blocked && currentUser?.email.toLowerCase() === email.toLowerCase()) {
      handleLogout();
    }
  };

  const handleToggleUserRole = (email) => {
    if (email.toLowerCase() === "admin@foxstock.com") return;
    
    setUsers((prevUsers) => {
      const nextUsers = prevUsers.map((u) => 
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u
      );
      localStorage.setItem("foxstock-users", JSON.stringify(nextUsers));
      return nextUsers;
    });
  };

  // Smart Buy picks saver
  const handleSaveDailyPicks = (picksData) => {
    setDailyPicks(picksData);
    localStorage.setItem("foxstock-daily-picks", JSON.stringify(picksData));

    const newNotif = {
      id: Date.now().toString(),
      type: "success",
      text: "Daily Picks recommendation database successfully updated."
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Real-time market simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          const volatility = 0.002;
          const direction = Math.random() > 0.48 ? 1 : -1;
          const changePercent = Math.random() * volatility * direction;
          const priceDiff = stock.price * changePercent;
          const newPrice = Math.max(1, stock.price + priceDiff);
          const newChange = stock.change + priceDiff;
          const newChangePercent = (newChange / (newPrice - newChange)) * 100;
          
          const newHistory = [...stock.history.slice(1), parseFloat(newPrice.toFixed(2))];

          // 52 Week boundaries safety check
          const updatedLow52 = Math.min(stock.low52, newPrice);
          const updatedHigh52 = Math.max(stock.high52, newPrice);

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
                const newNotification = {
                  id: Date.now() + Math.random().toString(36).substr(2, 5),
                  type: alert.type === "price_below" ? "danger" : "success",
                  text: `ALERT: ${stock.symbol} condition triggered! Value is ${
                    alert.type.includes("pe") ? "P/E " : "$"
                  }${newPrice.toFixed(2)}.`
                };
                setNotifications((prev) => [newNotification, ...prev]);

                // Auto-deactivate alert trigger
                setAlerts((prevAlerts) => {
                  const nextAlerts = prevAlerts.map((a) => (a.id === alert.id ? { ...a, active: false } : a));
                  syncPreferencesToDb(favorites, nextAlerts);
                  return nextAlerts;
                });
              }
            }
          });

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            low52: parseFloat(updatedLow52.toFixed(2)),
            high52: parseFloat(updatedHigh52.toFixed(2)),
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

    }, 5000);

    return () => clearInterval(interval);
  }, [alerts, favorites]);

  // Live Yahoo Finance fetching
  const fetchLivePrices = async (customFavorites) => {
    const activeFavs = customFavorites || favorites;
    const symbols = Array.from(new Set(["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "AMZN", "NFLX", "META", ...activeFavs]));
    
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
            const updatedLow52 = Math.min(stock.low52, liveData.price);
            const updatedHigh52 = Math.max(stock.high52, liveData.price);

            return {
              ...stock,
              price: liveData.price,
              change: liveData.change,
              changePercent: liveData.changePercent,
              low52: parseFloat(updatedLow52.toFixed(2)),
              high52: parseFloat(updatedHigh52.toFixed(2)),
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

  // Run live fetches on mount and setup recurring refresh tied to favorites array
  useEffect(() => {
    fetchLivePrices(favorites);
    const liveInterval = setInterval(() => fetchLivePrices(favorites), 30000);
    return () => clearInterval(liveInterval);
  }, [favorites]);

  // Fetch custom stock range on demand
  const handleChangeStockRange = async (symbol, range) => {
    let interval = "1d";
    if (range === "1d") interval = "2m";
    else if (range === "5d") interval = "15m";
    else if (range === "1y" || range === "2y") interval = "1wk";
    else if (range === "5y" || range === "10y") interval = "1mo";

    const urls = [
      `/api-yahoo/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`,
      `https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/${symbol}%3Frange%3D${range}%26interval%3D${interval}`,
      `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
    ];

    let success = false;
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (result) {
          const rawQuote = result.indicators?.quote?.[0]?.close || [];
          const cleanHistory = rawQuote.filter(v => v !== null && v !== undefined).slice(-45);

          setStocks((prevStocks) =>
            prevStocks.map((stock) => {
              if (stock.symbol === symbol) {
                return {
                  ...stock,
                  activeRange: range,
                  history: cleanHistory.map(h => parseFloat(h.toFixed(2)))
                };
              }
              return stock;
            })
          );
          success = true;
          break;
        }
      } catch (e) {
        // silently try next url
      }
    }

    if (!success) {
      console.warn(`Failed to fetch dynamic history range ${range} for stock ${symbol}`);
    }
  };

  // Alert State Handlers (Autosyncs to database immediately)
  const handleAddAlert = (newAlert) => {
    setAlerts((prev) => {
      const nextAlerts = [
        ...prev,
        {
          id: Date.now().toString(),
          symbol: newAlert.symbol,
          type: newAlert.type,
          value: newAlert.value,
          active: true
        }
      ];
      syncPreferencesToDb(favorites, nextAlerts);
      return nextAlerts;
    });
  };

  const handleRemoveAlert = (alertId) => {
    setAlerts((prev) => {
      const nextAlerts = prev.filter((a) => a.id !== alertId);
      syncPreferencesToDb(favorites, nextAlerts);
      return nextAlerts;
    });
  };

  const handleToggleAlertStatus = (alertId) => {
    setAlerts((prev) => {
      const nextAlerts = prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a));
      syncPreferencesToDb(favorites, nextAlerts);
      return nextAlerts;
    });
  };

  const handleTriggerAIRatingUpdate = () => {
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

    const newNotif = {
      id: Date.now().toString(),
      type: "info",
      text: "Daily Ratings Consensus successfully regenerated."
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleToggleFavorite = (symbol) => {
    setFavorites((prev) => {
      const nextFavorites = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      syncPreferencesToDb(nextFavorites, alerts);
      return nextFavorites;
    });
  };

  const handleToggleIndicator = (indicatorId) => {
    setVisibleIndicators((prev) =>
      prev.includes(indicatorId)
        ? prev.filter((i) => i !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  const handleDismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddCustomStock = (symbol, name) => {
    const sym = symbol.toUpperCase();
    const exists = stocks.some(s => s.symbol === sym);
    
    if (!exists) {
      const newStock = {
        symbol: sym,
        name: name || sym,
        sector: "Market Asset",
        price: 100.00,
        change: 0.00,
        changePercent: 0.00,
        peRatio: 24.5,
        forwardPe: 20.8,
        low52: 80.00,
        high52: 120.00,
        analystTarget: 118.00,
        consensus: "Buy",
        ratingScore: 4.1,
        quarterlyRevenue: [
          { quarter: "Q2 25", revenue: 8.5 },
          { quarter: "Q3 25", revenue: 9.1 },
          { quarter: "Q4 25", revenue: 9.9 },
          { quarter: "Q1 26", revenue: 10.4 }
        ],
        history: [95, 96, 95, 96, 97, 98, 97, 98, 99, 100, 101, 100, 99, 100, 101, 100, 99, 98, 99, 100, 101, 100, 99, 98, 97, 98, 99, 100, 101, 100],
        aiSummary: `${name || sym} is a dynamically tracked US market equity asset. Technical indicators, daily consensus ratings, and historical sparklines are calculated in real-time.`
      };
      setStocks(prev => [...prev, newStock]);
    }

    if (!favorites.includes(sym)) {
      setFavorites((prev) => {
        const nextFavorites = [...prev, sym];
        syncPreferencesToDb(nextFavorites, alerts);
        return nextFavorites;
      });
      // Fetch prices immediately
      fetchLivePrices([...favorites, sym]);
    }
  };

  // Render Auth screen if not logged in
  if (!currentUser) {
    return (
      <Auth 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        onVerifyCode={handleVerifyCode} 
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  const isAdmin = currentUser.role === "admin";

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
        flexWrap: "wrap",
        gap: "12px",
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

        {/* Navigation tabs */}
        <nav style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <button 
            className={activeTab === "dashboard" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("dashboard")}
            style={{ padding: "8px 14px", borderRadius: "10px", gap: "6px", fontSize: "0.85rem" }}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button 
            className={activeTab === "watchlist" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("watchlist")}
            style={{ padding: "8px 14px", borderRadius: "10px", gap: "6px", fontSize: "0.85rem" }}
          >
            <Star size={14} /> Watchlist
          </button>
          <button 
            className={activeTab === "smart_buy" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("smart_buy")}
            style={{ padding: "8px 14px", borderRadius: "10px", gap: "6px", fontSize: "0.85rem" }}
          >
            <BrainCircuit size={14} /> Smart Buy
          </button>
          <button 
            className={activeTab === "alerts" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setActiveTab("alerts")}
            style={{ padding: "8px 14px", borderRadius: "10px", gap: "6px", fontSize: "0.85rem" }}
          >
            <Bell size={14} /> Alerts & AI
          </button>
          
          {/* Admin panel tab */}
          {isAdmin && (
            <button 
              className={activeTab === "admin" ? "btn-primary" : "btn-secondary"} 
              onClick={() => setActiveTab("admin")}
              style={{ padding: "8px 14px", borderRadius: "10px", gap: "6px", fontSize: "0.85rem", border: "1px solid rgba(139, 92, 246, 0.4)" }}
            >
              <ShieldAlert size={14} color="var(--color-primary)" /> Admin Panel
            </button>
          )}
        </nav>

        {/* User profile controls & theme */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "6px 12px", 
            borderRadius: "8px", 
            background: "rgba(255,255,255,0.03)", 
            border: "1px solid var(--border-glass)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)"
          }}>
            <User size={12} />
            <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.email}
            </span>
          </div>

          <button 
            onClick={() => setShowPasswordModal(true)}
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
            title="Change Password"
          >
            <Key size={16} />
          </button>

          <button 
            onClick={handleLogout}
            style={{ 
              background: "none", 
              border: "1px solid var(--color-danger)", 
              color: "var(--color-danger)", 
              padding: "8px", 
              borderRadius: "10px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px"
            }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>

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
        </div>
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
            onAddCustomStock={handleAddCustomStock}
            onChangeStockRange={handleChangeStockRange}
          />
        )}

        {activeTab === "smart_buy" && (
          <SmartBuy 
            stocks={stocks}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            currentUser={currentUser}
            dailyPicks={dailyPicks}
            onSaveDailyPicks={handleSaveDailyPicks}
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

        {activeTab === "admin" && isAdmin && (
          <AdminPanel 
            users={users}
            onToggleBlockUser={handleToggleBlockUser}
            onToggleUserRole={handleToggleUserRole}
          />
        )}
      </main>

      {/* Change Password glassmorphic Modal popup */}
      {showPasswordModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.6)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 2000,
          backdropFilter: "blur(8px)"
        }}>
          <div className="glass-panel" style={{ 
            width: "100%", 
            maxWidth: "380px", 
            padding: "32px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
                <Lock size={18} /> Change Account Password
              </h3>
              <button 
                onClick={() => { setShowPasswordModal(false); setPassModalError(""); setPassModalSuccess(""); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {passModalError && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "10px", borderRadius: "6px", fontSize: "0.8rem" }}>
                <AlertTriangle size={14} />
                <span>{passModalError}</span>
              </div>
            )}

            {passModalSuccess && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", padding: "10px", borderRadius: "6px", fontSize: "0.8rem" }}>
                <span>{passModalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "left" }}>Current Password</label>
                <input 
                  type="password" 
                  value={oldPassInput} 
                  onChange={(e) => setOldPassInput(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-glass)", backgroundColor: "var(--bg-secondary)", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "left" }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassInput} 
                  onChange={(e) => setNewPassInput(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-glass)", backgroundColor: "var(--bg-secondary)", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "left" }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmNewPassInput} 
                  onChange={(e) => setConfirmNewPassInput(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-glass)", backgroundColor: "var(--bg-secondary)", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", borderRadius: "6px", fontSize: "0.85rem", marginTop: "8px" }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

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
