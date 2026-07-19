import React from "react";
import { Users, ShieldCheck, Ban, CheckCircle, HelpCircle, UserX, UserCheck, ShieldAlert, Activity } from "lucide-react";

export default function AdminPanel({ users, onToggleBlockUser, onToggleUserRole, onSyncDatabase, dbStatus, lastSyncTime, dbKey }) {
  const totalUsers = users.length;
  const blockedUsers = users.filter((u) => u.blocked).length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const activeUsers = totalUsers - blockedUsers - pendingUsers;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "24px 0", textAlign: "left" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "2rem" }}>Admin Management Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Monitor system metrics, review registered profiles, and configure access permissions.
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Cloud Database Connection indicator */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 12px", 
            borderRadius: "8px", 
            background: "rgba(255,255,255,0.02)", 
            border: "1px solid var(--border-glass)",
            fontSize: "0.8rem"
          }}>
            <span style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: dbStatus === "online" ? "#22c55e" : dbStatus === "syncing" ? "#eab308" : "#ef4444",
              boxShadow: dbStatus === "online" ? "0 0 8px #22c55e" : dbStatus === "syncing" ? "0 0 8px #eab308" : "0 0 8px #ef4444",
              display: "inline-block"
            }}></span>
            <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>
              Cloud Database: <span style={{ color: "#fff" }}>{dbKey || "foxstock_cloud_sync_db_v3"}</span> 
              {lastSyncTime && <span style={{ opacity: 0.6 }}> (Last Sync: {lastSyncTime})</span>}
            </span>
          </div>

          {onSyncDatabase && (
            <button 
              onClick={onSyncDatabase}
              className="btn-primary"
              style={{ 
                padding: "10px 16px", 
                borderRadius: "10px", 
                fontSize: "0.85rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                border: "none",
                cursor: "pointer"
              }}
            >
              <Activity size={14} className={dbStatus === "syncing" ? "bell-shake" : ""} /> Refresh Cloud Database
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        
        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Total Registrations</span>
          <span style={{ fontSize: "1.8rem", fontWeight: "700", display: "block", marginTop: "4px" }}>{totalUsers}</span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Active Users</span>
          <span style={{ fontSize: "1.8rem", fontWeight: "700", display: "block", marginTop: "4px", color: "var(--color-success)" }}>{activeUsers}</span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Pending Activation</span>
          <span style={{ fontSize: "1.8rem", fontWeight: "700", display: "block", marginTop: "4px", color: "var(--color-warning)" }}>{pendingUsers}</span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Blocked Users</span>
          <span style={{ fontSize: "1.8rem", fontWeight: "700", display: "block", marginTop: "4px", color: "var(--color-danger)" }}>{blockedUsers}</span>
        </div>

      </div>

      {/* Users Table Card */}
      <div className="glass-panel" style={{ padding: "24px", overflowX: "auto" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} color="var(--color-primary)" /> System Account Directory
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "left" }}>
              <th style={{ padding: "12px 8px" }}>User Email</th>
              <th style={{ padding: "12px 8px" }}>System Role</th>
              <th style={{ padding: "12px 8px" }}>Account Status</th>
              <th style={{ padding: "12px 8px" }}>Watchlist Count</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              let statusLabel = "Active";
              let statusColor = "var(--color-success)";
              if (user.blocked) {
                statusLabel = "Blocked";
                statusColor = "var(--color-danger)";
              } else if (user.status === "pending") {
                statusLabel = "Pending Email";
                statusColor = "var(--color-warning)";
              }

              const isSelf = user.email === "admin@foxstock.com"; // Lock main admin from modification

              return (
                <tr key={user.email} style={{ borderBottom: "1px solid var(--border-glass)", fontSize: "0.85rem", transition: "var(--transition)" }}>
                  <td style={{ padding: "16px 8px", fontWeight: "600", color: "#fff" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "16px 8px" }}>
                    <span style={{ 
                      padding: "3px 8px", 
                      borderRadius: "4px", 
                      fontSize: "0.75rem", 
                      fontWeight: "600",
                      background: user.role === "admin" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.06)",
                      color: user.role === "admin" ? "var(--color-primary)" : "var(--text-secondary)"
                    }}>
                      {user.role ? user.role.toUpperCase() : "USER"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: statusColor, fontWeight: "600" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusColor }} />
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: "16px 8px", color: "var(--text-secondary)" }}>
                    {user.favorites ? user.favorites.length : 0} Stocks
                  </td>
                  <td style={{ padding: "16px 8px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      
                      {/* Toggle Role Action */}
                      <button
                        onClick={() => onToggleUserRole(user.email)}
                        disabled={isSelf}
                        className="btn-secondary"
                        style={{ 
                          padding: "6px 12px", 
                          fontSize: "0.75rem", 
                          borderRadius: "6px",
                          opacity: isSelf ? 0.3 : 1,
                          cursor: isSelf ? "not-allowed" : "pointer"
                        }}
                      >
                        Set {user.role === "admin" ? "User" : "Admin"}
                      </button>

                      {/* Block/Unblock Action */}
                      <button
                        onClick={() => onToggleBlockUser(user.email)}
                        disabled={isSelf}
                        className="btn-primary"
                        style={{ 
                          padding: "6px 12px", 
                          fontSize: "0.75rem", 
                          borderRadius: "6px",
                          background: user.blocked ? "var(--color-success)" : "var(--color-danger)",
                          boxShadow: "none",
                          opacity: isSelf ? 0.3 : 1,
                          cursor: isSelf ? "not-allowed" : "pointer"
                        }}
                      >
                        {user.blocked ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><UserCheck size={12} /> Activate</span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Ban size={12} /> Block</span>
                        )}
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
