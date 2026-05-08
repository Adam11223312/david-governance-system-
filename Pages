"use client";
import React, { useEffect, useState } from "react";
import { Shield, Activity, Zap, Lock, Trash2 } from "lucide-react";

export default function DavidCore() {
  const [logs, setLogs] = useState([]);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);

  const colors = {
    bg: "#05070a",
    card: "#0f172a",
    accent: "#00d4ff",
    border: "#1e293b",
    success: "#10b981",
    error: "#ef4444"
  };

  const evaluateAction = (action) => {
    if (action.type === "finance" && action.amount > 100) return { status: "DENIED", reason: "Limit Exceeded" };
    if (action.type === "vehicle") return { status: "PENDING", reason: "MFA Required" };
    return { status: "AUTHORIZED", reason: "Governance Clear" };
  };

  const runAction = (type, val = 0) => {
    setLoading(true);
    setTimeout(() => {
      const action = { type, amount: val, id: Date.now() };
      const res = evaluateAction(action);
      const newLog = { ...action, res, time: new Date().toLocaleTimeString() };
      const updated = [newLog, ...logs];
      setLogs(updated);
      setDecision(res);
      localStorage.setItem("david_vault", JSON.stringify(updated));
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    const saved = localStorage.getItem("david_vault");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  return (
    <div style={{ background: colors.bg, color: "white", minHeight: "100vh", padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "30px", borderBottom: `1px solid ${colors.border}`, paddingBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", letterSpacing: "-1px" }}>DAVID <span style={{ color: colors.accent }}>CORE v4.1</span></h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.success, fontSize: "12px", marginTop: "5px" }}>
          <Activity size={14} /> SYSTEM ENCRYPTED & LIVE
        </div>
      </header>

      <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr", marginBottom: "30px" }}>
        <button onClick={() => runAction("finance", 150)} style={btn}>Finance High</button>
        <button onClick={() => runAction("finance", 50)} style={btn}>Finance Low</button>
        <button onClick={() => runAction("vehicle")} style={btn}>Vehicle Unlock</button>
        <button onClick={() => setLogs([])} style={{ ...btn, borderColor: colors.error }}>Purge Logs</button>
      </div>

      <section style={{ background: colors.card, padding: "20px", borderRadius: "12px", border: `1px solid ${colors.border}`, marginBottom: "20px" }}>
        <h2 style={{ fontSize: "14px", color: colors.accent, marginBottom: "10px" }}><Shield size={16} /> LATEST DECISION</h2>
        <pre style={{ fontSize: "13px", color: decision?.status === "DENIED" ? colors.error : colors.success }}>
          {decision ? JSON.stringify(decision, null, 2) : "> STANDBY"}
        </pre>
      </section>

      <section>
        <h2 style={{ fontSize: "14px", marginBottom: "15px", color: "#64748b" }}>AUDIT TRAIL</h2>
        {logs.map(log => (
          <div key={log.id} style={{ background: "#111", padding: "12px", borderRadius: "8px", marginBottom: "8px", borderLeft: `3px solid ${log.res.status === "AUTHORIZED" ? colors.success : colors.error}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <strong>{log.type.toUpperCase()}</strong>
              <span style={{ opacity: 0.5 }}>{log.time}</span>
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>{log.res.status} - {log.res.reason}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

const btn = {
  background: "transparent",
  border: "1px solid #1e293b",
  color: "white",
  padding: "15px 10px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "bold",
  cursor: "pointer"
};
