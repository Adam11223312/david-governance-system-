"use client";

import { useState, useRef, useReducer } from "react";

// ==============================
// FRONTEND ONLY — DAVID DASHBOARD
// ==============================

async function callPolicyGateway(input: string) {
  try {
    const res = await fetch("/api/david/policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });

    return await res.json();
  } catch {
    const t = (input || "").toLowerCase();
    return {
      risk: t.includes("shutdown") ? 1 : 0.3,
      status: "FALLBACK",
      response: "Policy service offline (fallback mode)."
    };
  }
}

async function sendAudit(event: any) {
  try {
    await fetch("/api/david/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
  } catch {}
}

// ==============================
// UI INDICATOR
// ==============================
function DavidIndicator({ state }: any) {
  const risk = state?.risk ?? 0;

  let color = "#3b82f6";
  if (risk > 0.7) color = "#ef4444";
  else if (risk > 0.3) color = "#f59e0b";

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 90 + risk * 40,
          height: 90 + risk * 40,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 25px ${color}`
        }}
      />
    </div>
  );
}

// ==============================
// REDUCER
// ==============================
function reducer(state: any, action: any) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ==============================
// MAIN APP
// ==============================
export default function DAVID() {
  const [state, dispatch] = useReducer(reducer, {
    risk: 0.2,
    status: "NORMAL",
    backend: "CONNECTED",
    mode: "REGULATED_SYSTEM"
  });

  const [messages, setMessages] = useState([
    { role: "david", text: "DAVID SYSTEM ONLINE." }
  ]);

  const [input, setInput] = useState("");
  const queue = useRef<any[]>([]);
  const processing = useRef(false);

  function speak(text: string) {
    if (typeof window === "undefined") return;
    const s = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(s);
  }

  async function processQueue() {
    if (processing.current) return;
    processing.current = true;

    while (queue.current.length > 0) {
      const userInput = queue.current.shift();

      const result = await callPolicyGateway(userInput);

      dispatch({ type: "update", payload: result });

      await sendAudit({
        input: userInput,
        ...result,
        timestamp: new Date().toISOString()
      });

      setMessages(prev => [
        ...prev,
        { role: "user", text: userInput },
        { role: "david", text: result.response }
      ]);

      speak(result.response);
    }

    processing.current = false;
  }

  function send() {
    if (!input.trim()) return;
    queue.current.push(input);
    setInput("");
    processQueue();
  }

  return (
    <div className="p-6 grid grid-cols-3 gap-6 h-screen bg-black text-white">

      <div className="col-span-1 bg-zinc-900 p-4 rounded-xl">
        <DavidIndicator state={state} />

        <h2 className="text-xl font-bold mt-6">DAVID CORE</h2>

        <div className="text-xs text-gray-400 mt-4">
          <p>Risk: {(state.risk * 100).toFixed(0)}%</p>
          <p>Status: {state.status}</p>
          <p>Backend: {state.backend}</p>
        </div>
      </div>

      <div className="col-span-2 bg-zinc-900 p-4 rounded-xl flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded ${
                m.role === "user" ? "bg-blue-600 ml-auto" : "bg-zinc-800"
              }`}
            >
              <b>{m.role === "user" ? "YOU" : "DAVID"}:</b> {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            className="flex-1 p-2 text-black rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={send} className="bg-blue-600 px-4 rounded">
            Execute
          </button>
        </div>
      </div>

    </div>
  );
}
