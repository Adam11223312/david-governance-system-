"use client";

import { useState, useRef, useReducer } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ------------------------------
// FRONTEND API CLIENT
// ------------------------------
async function callPolicyGateway(input) {
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

async function sendAudit(event) {
  try {
    await fetch("/api/david/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
  } catch {}
}

// ------------------------------
// UI INDICATOR
// ------------------------------
function DavidIndicator({ state }) {
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

// ------------------------------
// REDUCER
// ------------------------------
function reducer(state, action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ------------------------------
// MAIN APP
// ------------------------------
export default function DAVID() {
  const [state, dispatch] = useReducer(reducer, {
    risk: 0.2,
    status: "NORMAL",
    backend: "CONNECTED",
    mode: "REGULATED_FULL_STACK"
  });

  const [messages, setMessages] = useState([
    { role: "david", text: "DAVID SYSTEM ONLINE." }
  ]);

  const [input, setInput] = useState("");
  const queue = useRef([]);
  const processing = useRef(false);

  async function processQueue() {
    if (processing.current) return;
    processing.current = true;

    while (queue.current.length > 0) {
      const text = queue.current.shift();

      const result = await callPolicyGateway(text);

      dispatch({ type: "update", payload: result });

      await sendAudit({
        input: text,
        ...result,
        timestamp: new Date().toISOString()
      });

      setMessages(prev => [
        ...prev,
        { role: "user", text },
        { role: "david", text: result.response }
      ]);
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

      <Card className="col-span-1 bg-zinc-900 border-zinc-700">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <DavidIndicator state={state} />

          <h2 className="text-xl font-bold mt-6">DAVID CORE</h2>
          <p className="text-xs text-gray-400 text-center">
            AI GOVERNANCE SYSTEM
          </p>

          <div className="mt-4 text-xs text-gray-400">
            <p>Risk: {(state.risk * 100).toFixed(0)}%</p>
            <p>Status: {state.status}</p>
            <p>Backend: {state.backend}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 bg-zinc-900 border-zinc-700 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
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
        </CardContent>

        <div className="p-4 flex gap-2 border-t border-zinc-700">
          <Input value={input} onChange={(e) => setInput(e.target.value)} />
          <Button onClick={send}>Execute</Button>
        </div>
      </Card>

    </div>
  );
}
