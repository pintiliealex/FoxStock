import React, { useState } from "react";
import { TrendingUp, Mail, Lock, UserPlus, LogIn, AlertCircle, Sparkles, Key, Check } from "lucide-react";

export default function Auth({ onLogin, onRegister, onVerifyCode, onForgotPassword }) {
  const [authMode, setAuthMode] = useState("login"); // login, register, verify, forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  
  const [pendingEmail, setPendingEmail] = useState("");
  const [mockMailNotice, setMockMailNotice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMockMailNotice("");

    if (authMode === "login") {
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }
      const res = onLogin(email, password);
      if (res.error) {
        setError(res.error);
      }
    } 
    
    else if (authMode === "register") {
      if (!email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      // Generate a mock code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const success = onRegister(email, password, generatedCode);
      if (!success) {
        setError("An account with this email already exists.");
      } else {
        setPendingEmail(email);
        setAuthMode("verify");
        setMockMailNotice(`MOCK EMAIL SENT to ${email}: Your 6-digit activation code is [ ${generatedCode} ]`);
      }
    } 
    
    else if (authMode === "verify") {
      if (!verificationInput) {
        setError("Please enter the activation code.");
        return;
      }
      const success = onVerifyCode(pendingEmail, verificationInput);
      if (success) {
        setAuthMode("login");
        setEmail(pendingEmail);
        setPassword("");
        setPendingEmail("");
        setMockMailNotice("Account activated successfully! You can now log in.");
      } else {
        setError("Invalid activation code. Please try again.");
      }
    } 
    
    else if (authMode === "forgot") {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }

      // Generate temporary password
      const tempPass = Math.random().toString(36).substring(2, 10);
      const success = onForgotPassword(email, tempPass);

      if (success) {
        setMockMailNotice(`MOCK EMAIL SENT to ${email}: Your new temporary password is [ ${tempPass} ]`);
        setAuthMode("login");
        setPassword("");
      } else {
        setError("No account found with this email address.");
      }
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "90vh", 
      padding: "20px" 
    }}>
      <div className="glass-panel" style={{ 
        width: "100%", 
        maxWidth: "420px", 
        padding: "40px 32px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "24px" 
      }}>
        
        {/* Branding header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ 
            width: "48px", 
            height: "48px", 
            borderRadius: "12px", 
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(139, 92, 246, 0.3)"
          }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <span style={{ fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Fox<span style={{ color: "var(--color-primary)" }}>Stock</span>
          </span>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center" }}>
            {authMode === "login" && "Log in to your market dashboard"}
            {authMode === "register" && "Create your quantitative analytics account"}
            {authMode === "verify" && "Verify your registered email address"}
            {authMode === "forgot" && "Reset your account password"}
          </p>
        </div>

        {/* Mock email notification banner */}
        {mockMailNotice && (
          <div style={{ 
            backgroundColor: "rgba(59, 130, 246, 0.12)", 
            color: "var(--color-info)", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            fontSize: "0.85rem",
            fontWeight: "600",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            lineHeight: "1.4"
          }}>
            <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-info)", opacity: 0.8, marginBottom: "4px" }}>
              📨 Mock Mail Transfer Protocol
            </span>
            {mockMailNotice}
          </div>
        )}

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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {authMode !== "verify" && (
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
                    padding: "10px 12px 10px 36px",
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

          {(authMode === "login" || authMode === "register") && (
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
                    padding: "10px 12px 10px 36px",
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

          {authMode === "register" && (
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
                    padding: "10px 12px 10px 36px",
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

          {authMode === "verify" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textAlign: "left" }}>
                Activation Code
              </label>
              <div style={{ position: "relative" }}>
                <Key size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="text" 
                  placeholder="123456" 
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
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
              padding: "12px", 
              fontSize: "0.9rem",
              borderRadius: "8px"
            }}
          >
            {authMode === "login" && <><LogIn size={16} /> Sign In</>}
            {authMode === "register" && <><UserPlus size={16} /> Register</>}
            {authMode === "verify" && <><Check size={16} /> Activate Account</>}
            {authMode === "forgot" && <><Sparkles size={16} /> Send Temp Password</>}
          </button>
        </form>

        {authMode === "login" && (
          <div style={{ textAlign: "right", marginTop: "-8px" }}>
            <button 
              onClick={() => {
                setAuthMode("forgot");
                setError("");
              }}
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer" }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)" }} />

        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {authMode === "login" && (
            <>
              New to FoxStock?{" "}
              <button 
                onClick={() => { setAuthMode("register"); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: "600", cursor: "pointer" }}
              >
                Create one now
              </button>
            </>
          )}
          
          {(authMode === "register" || authMode === "forgot" || authMode === "verify") && (
            <>
              Already verified?{" "}
              <button 
                onClick={() => { setAuthMode("login"); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: "600", cursor: "pointer" }}
              >
                Sign In
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
