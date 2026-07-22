import React, { useState, useEffect } from "react";
import { INITIAL_STOCKS, MOCK_INDICES, AVAILABLE_INDICATORS } from "./data/mockStocks";
import Dashboard from "./components/Dashboard";
import Watchlist from "./components/Watchlist";
import AlertsHub from "./components/AlertsHub";
import Auth from "./components/Auth";
import SmartBuy from "./components/SmartBuy";
import AdminPanel from "./components/AdminPanel";
import { TrendingUp, Bell, Star, LayoutDashboard, Sun, Moon, AlertTriangle, X, LogOut, BrainCircuit, User, ShieldAlert, Key, Lock } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("foxstock-theme") || "dark");
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [indices, setIndices] = useState(MOCK_INDICES);
  
  // Seed Database of users from Supabase on mount
  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("foxstock-current-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [dbStatus, setDbStatus] = useState("online");
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date().toLocaleTimeString());

  // User Preferences
  const [favorites, setFavorites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [visibleIndicators, setVisibleIndicators] = useState(() => {
    const saved = localStorage.getItem("foxstock-indicators");
    return saved ? JSON.parse(saved) : AVAILABLE_INDICATORS.map(i => i.id);
  });

  // Triggered Alerts Logs List
  const [triggeredAlertLogs, setTriggeredAlertLogs] = useState(() => {
    if (currentUser) {
      return currentUser.triggeredAlerts || [];
    }
    return [];
  });

  // Change Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassInput, setOldPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmNewPassInput, setConfirmNewPassInput] = useState("");
  const [passModalError, setPassModalError] = useState("");
  const [passModalSuccess, setPassModalSuccess] = useState("");

  // Triggered Alerts Tray display
  const [showAlertsInbox, setShowAlertsInbox] = useState(false);

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

  // Base64url Encoder/Decoder helpers for safe IIS URL path parameter transmissions
  const toBase64Url = (str) => {
    const bytes = new TextEncoder().encode(str);
    const binString = String.fromCharCode(...bytes);
    const base64 = btoa(binString);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  const fromBase64Url = (base64url) => {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  // Cloud Database Sync helpers (uses Supabase public.foxstock_users table)
  const syncUsersFromCloud = async () => {
    setDbStatus("syncing");
    try {
      const { data, error } = await supabase
        .from('foxstock_users')
        .select('*');
      
      if (error) throw error;

      if (data) {
        // Map database attributes back to local state names
        const formattedUsers = data.map(dbRow => ({
          ...dbRow,
          verificationCode: dbRow.verification_code || "",
          triggeredAlerts: dbRow.triggered_alerts || []
        }));

        setUsers(formattedUsers);
        setDbStatus("online");
        setLastSyncTime(new Date().toLocaleTimeString());

        // Sync local current user session if active
        if (currentUser) {
          const freshCurrentUser = formattedUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (freshCurrentUser) {
            if (freshCurrentUser.blocked) {
              handleLogout();
              return;
            }
            setFavorites(freshCurrentUser.favorites || []);
            setAlerts(freshCurrentUser.alerts || []);
            setTriggeredAlertLogs(freshCurrentUser.triggeredAlerts || []);
            setCurrentUser(freshCurrentUser);
            localStorage.setItem("foxstock-current-user", JSON.stringify(freshCurrentUser));
          }
        }
      }
    } catch (e) {
      console.warn("Failed to sync from Supabase:", e);
      setDbStatus("error");
    }
  };

  const pushUsersToCloud = async (nextUsers) => {
    // Legacy helper; Supabase operations now perform inline writes directly
  };

  // Sync cloud database on mount and every 10 seconds to pull registrations from mobile/other devices
  useEffect(() => {
    syncUsersFromCloud();
    const syncInterval = setInterval(syncUsersFromCloud, 10000);
    return () => clearInterval(syncInterval);
  }, []);

  // Handle automatic account activation and login when redirected from verification email
  useEffect(() => {
    const handleAuthRedirect = async (session) => {
      if (!session || !session.user) return;
      const email = session.user.email.toLowerCase();

      try {
        // Fetch current profile
        const { data: profile, error } = await supabase
          .from('foxstock_users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error) throw error;

        if (profile && profile.status === "pending") {
          // Update status to active in Supabase DB
          const { error: updateError } = await supabase
            .from('foxstock_users')
            .update({ status: "active", verification_code: "" })
            .eq('email', email);

          if (updateError) throw updateError;

          await syncUsersFromCloud();

          // Set user in React state & localStorage
          const activatedUser = {
            ...profile,
            status: "active",
            verification_code: "",
            verificationCode: "",
            triggeredAlerts: profile.triggered_alerts || []
          };
          setCurrentUser(activatedUser);
          localStorage.setItem("foxstock-current-user", JSON.stringify(activatedUser));
        } else if (profile && (!currentUser || currentUser.email.toLowerCase() !== email)) {
          // Normal login fallback if redirected and already active
          const activeUser = {
            ...profile,
            verificationCode: profile.verification_code || "",
            triggeredAlerts: profile.triggered_alerts || []
          };
          setCurrentUser(activeUser);
          localStorage.setItem("foxstock-current-user", JSON.stringify(activeUser));
        }
      } catch (e) {
        console.error("Redirect auth error:", e);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleAuthRedirect(session);
    });

    // Listen for sign in events (like email confirmation redirect redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        handleAuthRedirect(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);


  // Sync state on user login/switch
  useEffect(() => {
    if (currentUser) {
      const userFavs = currentUser.favorites || [];
      setFavorites(userFavs);
      setAlerts(currentUser.alerts || []);
      setTriggeredAlertLogs(currentUser.triggeredAlerts || []);
      
      // Ensure all favorites exist in the stocks array immediately!
      if (userFavs.length > 0) {
        setStocks((prevStocks) => {
          let updatedStocks = [...prevStocks];
          let modified = false;
          
          userFavs.forEach((fav) => {
            const exists = updatedStocks.some((s) => s.symbol === fav);
            if (!exists) {
              const newStock = {
                symbol: fav,
                name: fav,
                sector: "Market Asset",
                price: 100.00,
                change: 0.00,
                changePercent: 0.00,
                peRatio: 24.5,
                forwardPe: 20.8,
                industryPe: 25.8,
                low52: 80.00,
                high52: 120.00,
                ath: 120.00,
                athDate: "2024-07-15",
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
                aiSummary: `${fav} is a dynamically tracked US market equity asset. Technical indicators, daily consensus ratings, and historical sparklines are calculated in real-time.`
              };
              updatedStocks.push(newStock);
              modified = true;
            }
          });
          
          return modified ? updatedStocks : prevStocks;
        });
      }
    } else {
      setFavorites([]);
      setAlerts([]);
      setTriggeredAlertLogs([]);
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
  const handleRegister = async (email, password, verificationCode) => {
    try {
      // 1. Sign up user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (signUpError) throw signUpError;

      // 2. Create the associated profile row in public.foxstock_users
      const newUser = {
        email: email.toLowerCase(),
        password: "(managed)",
        role: "user",
        status: "pending",
        verification_code: verificationCode,
        blocked: false,
        favorites: ["AAPL", "MSFT", "TSLA", "NFLX"],
        alerts: [],
        triggered_alerts: []
      };

      const { error: insertError } = await supabase
        .from('foxstock_users')
        .insert([newUser]);

      if (insertError) throw insertError;

      await syncUsersFromCloud();
      return { success: true };
    } catch (e) {
      console.error("Register error:", e);
      return { error: e.message || "Registration failed." };
    }
  };

  const handleVerifyCode = async (email, code) => {
    try {
      // Verify OTP code natively through Supabase Auth
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: code,
        type: 'signup'
      });

      if (verifyError) throw verifyError;

      // Update local profile status
      const { error: updateError } = await supabase
        .from('foxstock_users')
        .update({ status: "active", verification_code: "" })
        .eq('email', email.toLowerCase());

      if (updateError) throw updateError;

      await syncUsersFromCloud();
      return true;
    } catch (e) {
      console.error("Verify code error:", e);
      return false;
    }
  };

  const handleForgotPassword = async (email, tempPass) => {
    try {
      // Triggers native Supabase reset password email flow
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: window.location.origin
      });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Forgot password error:", e);
      return false;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      // Authenticate natively using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (authError) {
        const errorMsg = (authError.message === "{}" || !authError.message)
          ? "Failed to connect to the authentication server. Please check your network connection."
          : authError.message;
        return { error: errorMsg };
      }

      // Fetch user profile properties from public.foxstock_users
      const { data, error } = await supabase
        .from('foxstock_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (data && data.blocked) {
        // Sign out if blocked
        await supabase.auth.signOut();
        return { error: "Your account has been blocked by an administrator." };
      }

      const formattedUser = {
        ...(data || {
          email: email.toLowerCase(),
          role: "user",
          status: "active",
          favorites: ["AAPL", "MSFT", "TSLA", "NFLX"],
          alerts: [],
          triggered_alerts: []
        }),
        verificationCode: (data && data.verification_code) || "",
        triggeredAlerts: (data && data.triggered_alerts) || []
      };

      setCurrentUser(formattedUser);
      localStorage.setItem("foxstock-current-user", JSON.stringify(formattedUser));
      return { success: true };
    } catch (e) {
      console.error("Login error:", e);
      return { error: "Failed to connect to authentication server." };
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem("foxstock-current-user");
    setActiveTab("dashboard");
    setShowAlertsInbox(false);
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassModalError("");
    setPassModalSuccess("");

    if (!oldPassInput || !newPassInput || !confirmNewPassInput) {
      setPassModalError("Please fill in all fields.");
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

    try {
      // Validate current password by attempting a temporary sign-in check
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: oldPassInput
      });

      if (verifyError) {
        setPassModalError("Incorrect current password.");
        return;
      }

      // Update password natively in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassInput
      });

      if (error) throw error;

      const updatedUser = { ...currentUser, password: "(managed)" };
      setCurrentUser(updatedUser);
      localStorage.setItem("foxstock-current-user", JSON.stringify(updatedUser));

      await syncUsersFromCloud();

      setPassModalSuccess("Password changed successfully!");
      setOldPassInput("");
      setNewPassInput("");
      setConfirmNewPassInput("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setPassModalSuccess("");
      }, 1500);
    } catch (err) {
      setPassModalError("Failed to update password in database.");
    }
  };

  // Helper database synchronizer (avoids infinite loops)
  const syncPreferencesToDb = async (nextFavorites, nextAlerts, nextTriggeredAlerts) => {
    if (!currentUser) return;
    
    const favs = nextFavorites || favorites;
    const alts = nextAlerts || alerts;
    const trig = nextTriggeredAlerts || triggeredAlertLogs;

    try {
      const { error } = await supabase
        .from('foxstock_users')
        .update({
          favorites: favs,
          alerts: alts,
          triggered_alerts: trig
        })
        .eq('email', currentUser.email.toLowerCase());

      if (error) throw error;

      const updatedUser = { 
        ...currentUser, 
        favorites: favs, 
        alerts: alts,
        triggeredAlerts: trig
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem("foxstock-current-user", JSON.stringify(updatedUser));
      
      setUsers(prev => prev.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? {
        ...u,
        favorites: favs,
        alerts: alts,
        triggeredAlerts: trig
      } : u));
    } catch (e) {
      console.warn("Failed to sync preferences to Supabase:", e);
    }
  };

  // Admin Actions
  const handleToggleBlockUser = async (email) => {
    if (email.toLowerCase() === "admin@foxstock.com") return;
    
    try {
      const userToToggle = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userToToggle) return;

      const newBlockedStatus = !userToToggle.blocked;

      const { error } = await supabase
        .from('foxstock_users')
        .update({ blocked: newBlockedStatus })
        .eq('email', email.toLowerCase());

      if (error) throw error;

      await syncUsersFromCloud();
    } catch (e) {
      console.error("Toggle block error:", e);
    }
  };

  const handleToggleUserRole = async (email) => {
    if (email.toLowerCase() === "admin@foxstock.com") return;
    
    try {
      const userToToggle = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userToToggle) return;

      const newRole = userToToggle.role === "admin" ? "user" : "admin";

      const { error } = await supabase
        .from('foxstock_users')
        .update({ role: newRole })
        .eq('email', email.toLowerCase());

      if (error) throw error;

      await syncUsersFromCloud();
    } catch (e) {
      console.error("Toggle role error:", e);
    }
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

  // Shared Alert checking & trigger logging (Fixed race conditions & state deletes)
  const checkAndTriggerAlerts = (symbol, currentPrice, peRatio) => {
    setAlerts((prevAlerts) => {
      let triggeredAny = false;
      const nextAlerts = prevAlerts.map((alert) => {
        if (alert.symbol === symbol && alert.active) {
          let triggered = false;
          if (alert.type === "price_below" && currentPrice <= alert.value) {
            triggered = true;
          } else if (alert.type === "price_above" && currentPrice >= alert.value) {
            triggered = true;
          } else if (alert.type === "pe_below" && peRatio <= alert.value) {
            triggered = true;
          }

          if (triggered) {
            triggeredAny = true;
            return { ...alert, active: false };
          }
        }
        return alert;
      });

      if (triggeredAny) {
        const triggeredAlerts = prevAlerts.filter(a => a.active).map(a => {
          const nextA = nextAlerts.find(na => na.id === a.id);
          if (a.active && nextA && !nextA.active) {
            return {
              id: Date.now() + Math.random().toString(36).substr(2, 5),
              symbol: a.symbol,
              type: a.type,
              limitValue: a.value,
              triggerValue: currentPrice,
              triggeredAt: new Date().toLocaleTimeString(),
              read: false
            };
          }
          return null;
        }).filter(Boolean);

        if (triggeredAlerts.length > 0) {
          setTriggeredAlertLogs((prevLogs) => {
            const nextLogs = [...triggeredAlerts, ...prevLogs];
            
            if (currentUser) {
              syncPreferencesToDb(favorites, nextAlerts, nextLogs);
            }
            return nextLogs;
          });

          triggeredAlerts.forEach(log => {
            const newNotification = {
              id: log.id,
              type: "danger",
              text: `ALERT: ${log.symbol} price parameter met! Triggered value is $${log.triggerValue.toFixed(2)}.`
            };
            setNotifications((prev) => [newNotification, ...prev]);
          });
        }
      }

      return nextAlerts;
    });
  };

  // Mark specific triggered alert as read
  const handleMarkAlertAsRead = (logId) => {
    setTriggeredAlertLogs((prevLogs) => {
      const nextLogs = prevLogs.map((log) => log.id === logId ? { ...log, read: true } : log);
      const targetLog = prevLogs.find(l => l.id === logId);
      
      setAlerts((prevAlerts) => {
        const nextAlerts = prevAlerts.map(alert => {
          if (targetLog && alert.symbol === targetLog.symbol && alert.type === targetLog.type) {
            return { ...alert, active: false };
          }
          return alert;
        });
        
        syncPreferencesToDb(favorites, nextAlerts, nextLogs);
        return nextAlerts;
      });
      
      return nextLogs;
    });
  };

  // Mark all unread alerts as read
  const handleMarkAllAlertsAsRead = () => {
    setTriggeredAlertLogs((prevLogs) => {
      const nextLogs = prevLogs.map((log) => ({ ...log, read: true }));
      
      setAlerts((prevAlerts) => {
        const nextAlerts = prevAlerts.map(alert => {
          const wasTriggered = prevLogs.some(log => !log.read && log.symbol === alert.symbol && log.type === alert.type);
          if (wasTriggered) {
            return { ...alert, active: false };
          }
          return alert;
        });
        
        syncPreferencesToDb(favorites, nextAlerts, nextLogs);
        return nextAlerts;
      });
      
      return nextLogs;
    });
  };

  const isMarketOpen = () => {
    // Get Eastern Time (New York timezone)
    const options = { timeZone: "America/New_York", hour12: false };
    const dateStr = new Date().toLocaleString("en-US", options);
    const estDate = new Date(dateStr);
    
    const day = estDate.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = estDate.getHours();
    const minute = estDate.getMinutes();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Market hours check (9:30 AM to 4:00 PM EST)
    const timeInMinutes = hour * 60 + minute;
    const marketOpenMinutes = 9 * 60 + 30;  // 9:30 AM
    const marketCloseMinutes = 16 * 60;     // 4:00 PM

    return timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes;
  };

  // Real-time market simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Do not run simulation updates on weekends or outside market hours
      if (!isMarketOpen()) return;

      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          const volatility = 0.002;
          const direction = Math.random() > 0.48 ? 1 : -1;
          const changePercent = Math.random() * volatility * direction;
          const priceDiff = stock.price * changePercent;
          const newPrice = Math.max(1, stock.price + priceDiff);
          
          // Anchored to prevClose baseline to prevent compounding runway changes
          const prevClose = stock.prevClose || (stock.price - stock.change);
          const newChange = newPrice - prevClose;
          const newChangePercent = (newChange / prevClose) * 100;
          
          const activeRange = stock.activeRange || "1mo";
          const newHistory = [...stock.history];
          if (activeRange === "1d") {
            newHistory.shift();
            newHistory.push(parseFloat(newPrice.toFixed(2)));
          } else {
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1] = parseFloat(newPrice.toFixed(2));
            }
          }

          // 52 Week boundaries safety check
          let updatedLow52 = typeof stock.low52 === "number" ? stock.low52 : newPrice;
          let updatedHigh52 = typeof stock.high52 === "number" ? stock.high52 : newPrice;
          if (newPrice < updatedLow52 || newPrice > updatedHigh52) {
            updatedLow52 = newPrice * 0.85;
            updatedHigh52 = newPrice * 1.15;
          } else {
            updatedLow52 = Math.min(updatedLow52, newPrice);
            updatedHigh52 = Math.max(updatedHigh52, newPrice);
          }

          // Check alerts dynamically
          checkAndTriggerAlerts(stock.symbol, newPrice, stock.peRatio);

          const currentAth = typeof stock.ath === "number" ? stock.ath : newPrice;
          const updatedAth = newPrice > currentAth ? newPrice : currentAth;
          const updatedAthDate = newPrice > currentAth ? new Date().toISOString().split('T')[0] : (stock.athDate || "2024-07-15");

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            changePercent: parseFloat(newChangePercent.toFixed(2)),
            prevClose: parseFloat(prevClose.toFixed(2)),
            low52: parseFloat(updatedLow52.toFixed(2)),
            high52: parseFloat(updatedHigh52.toFixed(2)),
            ath: parseFloat(updatedAth.toFixed(2)),
            athDate: updatedAthDate,
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
          `/api-yahoo/v8/finance/chart/${sym}?range=1y&interval=1d`,
          `https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/${sym}%3Frange%3D1y%26interval%3D1d`,
          `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=1y&interval=1d`
        ];

        for (const url of urls) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            const result = data?.chart?.result?.[0];
            if (result) {
              const currentPrice = result.meta.regularMarketPrice;
              const rawQuote = result.indicators?.quote?.[0]?.close || [];
              const cleanHistory = rawQuote.filter(v => v !== null && v !== undefined);
              
              // Anchor daily previous close to correctly compute daily change and % instead of 1-year changes
              const prevClose = result.meta.previousClose || (cleanHistory.length > 1 ? cleanHistory[cleanHistory.length - 2] : currentPrice);
              const change = currentPrice - prevClose;
              const changePercent = (change / prevClose) * 100;

              const low52 = cleanHistory.length > 0 ? Math.min(...cleanHistory) : currentPrice * 0.82;
              const high52 = cleanHistory.length > 0 ? Math.max(...cleanHistory) : currentPrice * 1.18;

              return {
                symbol: sym,
                price: parseFloat(currentPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                prevClose: parseFloat(prevClose.toFixed(2)),
                low52: parseFloat(low52.toFixed(2)),
                high52: parseFloat(high52.toFixed(2)),
                fullHistory: cleanHistory.map(h => parseFloat(h.toFixed(2)))
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
            const activeRange = stock.activeRange || "1mo";
            let sliceHistory = stock.history;

            // Only overwrite history if the range fits the daily 1-year chart feed
            if (["5d", "1mo", "6mo", "1y"].includes(activeRange)) {
              if (liveData.fullHistory && liveData.fullHistory.length > 0) {
                if (activeRange === "1mo") {
                  sliceHistory = liveData.fullHistory.slice(-30);
                } else if (activeRange === "5d") {
                  sliceHistory = liveData.fullHistory.slice(-5);
                } else if (activeRange === "6mo") {
                  sliceHistory = liveData.fullHistory.slice(-126);
                } else if (activeRange === "1y") {
                  sliceHistory = liveData.fullHistory.slice(-252);
                }
              }
            } else {
              // For 1D, 2Y, 5Y, 10Y ranges: keep existing history, just update the very last price tick in-place!
              if (sliceHistory && sliceHistory.length > 0) {
                const nextHist = [...sliceHistory];
                nextHist[nextHist.length - 1] = liveData.price;
                sliceHistory = nextHist;
              }
            }

            // Check alerts dynamically
            checkAndTriggerAlerts(stock.symbol, liveData.price, stock.peRatio);

            const currentAth = typeof stock.ath === "number" ? stock.ath : liveData.price;
            const updatedAth = liveData.price > currentAth ? liveData.price : currentAth;
            const updatedAthDate = liveData.price > currentAth ? new Date().toISOString().split('T')[0] : (stock.athDate || "2024-07-15");

            return {
              ...stock,
              price: liveData.price,
              change: liveData.change,
              changePercent: liveData.changePercent,
              prevClose: liveData.prevClose,
              low52: liveData.low52,
              high52: liveData.high52,
              ath: parseFloat(updatedAth.toFixed(2)),
              athDate: updatedAthDate,
              history: sliceHistory
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
    else if (range === "6mo") interval = "1d";
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
      syncPreferencesToDb(favorites, nextAlerts, null);
      return nextAlerts;
    });
  };

  const handleRemoveAlert = (alertId) => {
    setAlerts((prev) => {
      const nextAlerts = prev.filter((a) => a.id !== alertId);
      syncPreferencesToDb(favorites, nextAlerts, null);
      return nextAlerts;
    });
  };

  const handleToggleAlertStatus = (alertId) => {
    setAlerts((prev) => {
      const nextAlerts = prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a));
      syncPreferencesToDb(favorites, nextAlerts, null);
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
      syncPreferencesToDb(nextFavorites, alerts, null);
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
        industryPe: 25.8,
        low52: 80.00,
        high52: 120.00,
        ath: 120.00,
        athDate: "2024-07-15",
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
        syncPreferencesToDb(nextFavorites, alerts, null);
        return nextFavorites;
      });
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
  const unreadAlertsCount = triggeredAlertLogs.filter((l) => !l.read).length;

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
        <nav style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
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

          {/* Triggered Alerts inbox header tab */}
          {unreadAlertsCount > 0 && (
            <button 
              className="btn-primary pulsing-glow" 
              onClick={() => setShowAlertsInbox(true)}
              style={{ 
                padding: "8px 14px", 
                borderRadius: "10px", 
                gap: "6px", 
                fontSize: "0.85rem", 
                background: "linear-gradient(135deg, var(--color-danger), #ef4444)",
                border: "none",
                color: "#fff",
                fontWeight: "600",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Bell size={14} className="bell-shake" />
              <span>{unreadAlertsCount} Unread Alerts</span>
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
            onSyncDatabase={syncUsersFromCloud}
            dbStatus={dbStatus}
            lastSyncTime={lastSyncTime}
            dbKey="foxstock_users_registry_2026_v1"
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

      {/* Triggered Alerts Inbox Modal Tray */}
      {showAlertsInbox && (
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
            maxWidth: "460px", 
            padding: "32px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px",
            maxHeight: "85vh"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
                <Bell size={18} /> Triggered Market Alerts ({unreadAlertsCount})
              </h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button 
                  onClick={handleMarkAllAlertsAsRead}
                  className="btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.75rem", borderRadius: "6px" }}
                >
                  Mark All Read
                </button>
                <button 
                  onClick={() => setShowAlertsInbox(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: 0 }} />

            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "10px", 
              overflowY: "auto", 
              maxHeight: "50vh",
              paddingRight: "4px"
            }}>
              {triggeredAlertLogs.filter(l => !l.read).length === 0 ? (
                <div style={{ padding: "24px", color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center" }}>
                  All triggered alerts have been read.
                </div>
              ) : (
                triggeredAlertLogs.filter(l => !l.read).map((log) => {
                  const typeLabel = log.type === "price_below" ? "dropped below" : log.type === "price_above" ? "rose above" : "P/E fell below";
                  const priceSymbol = log.type.includes("pe") ? "" : "$";

                  return (
                    <div 
                      key={log.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: "14px 18px", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        gap: "12px",
                        backgroundColor: "rgba(239, 68, 68, 0.04)",
                        border: "1px solid rgba(239, 68, 68, 0.15)"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#fff" }}>
                          {log.symbol}
                        </span>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                          Price {typeLabel} {priceSymbol}{log.limitValue.toFixed(2)} (Triggered at: {priceSymbol}{log.triggerValue.toFixed(2)})
                        </p>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                          Time: {log.triggeredAt}
                        </span>
                      </div>

                      <button 
                        onClick={() => handleMarkAlertAsRead(log.id)}
                        className="btn-secondary"
                        style={{ 
                          padding: "6px 10px", 
                          fontSize: "0.75rem", 
                          borderRadius: "6px",
                          flexShrink: 0
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => setShowAlertsInbox(false)}
              className="btn-primary" 
              style={{ width: "100%", justifyContent: "center", padding: "10px", borderRadius: "6px", fontSize: "0.85rem" }}
            >
              Close Tray
            </button>
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
