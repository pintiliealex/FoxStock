import React, { useState } from "react";
import { TrendingUp, Mail, Lock, UserPlus, LogIn, AlertCircle } from "lucide-react";

export default function Auth({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      
      const success = onRegister(email, password);
      if (!success) {
        setError("Account already exists with this email.");
      }
    } else {
      const success = onLogin(email, password);
      if (!success) {
        setError("Invalid email or password.");
      }
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "80vh", 
      padding: "20px" 
    }}>
      <div className="glass-panel" style={{ 
        width: "100%", 
        maxWidth: "400px", 
        padding: "40px 32px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "28px" 
      }}>
        {/* Branding header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: "52px", 
            height: "52px", 
            borderRadius: "14px", 
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
          }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <span style={{ fontSize: "1.8rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Fox<span style={{ color: "var(--color-primary)" }}>Stock</span>
          </span>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {isRegister ? "Create your quantitative analytics account" : "Log in to your market dashboard"}
          </p>
        </div>

        {/* Error messaging */}
        {error && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            backgroundColor: "var(--color-danger-bg)", 
            color: "var(--color-danger)", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            fontSize: "0.85rem",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textAlign: "left" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.9rem"
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textAlign: "left" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.9rem"
                }}
              />
            </div>
          </div>

          {isRegister && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textAlign: "left" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    color: "var(--text-primary)",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: "100%", 
              justifyContent: "center", 
              padding: "14px", 
              fontSize: "0.95rem",
              borderRadius: "8px"
            }}
          >
            {isRegister ? <><UserPlus size={18} /> Register</> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)" }} />

        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {isRegister ? "Already have an account?" : "New to FoxStock?"}{" "}
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--color-primary)", 
              fontWeight: "600", 
              cursor: "pointer",
              padding: "2px"
            }}
          >
            {isRegister ? "Sign In" : "Create one now"}
          </button>
        </div>

      </div>
    </div>
  );
}
