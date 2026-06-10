import React, { useState, useCallback } from "react";
import Match3Grid from "./Match3Grid";
import AwakeningCanvas from "./AwakeningCanvas";
import { usePi } from "../context";

const LOG_CSS = (color: string) => ({ color, fontFamily: "monospace", fontSize: "11px", margin: 0 });

interface SimLog {
  text: string;
  color: string;
  ts: number;
}

export default function GenesisSimulation() {
  const [phase, setPhase] = useState<"idle" | "match3" | "validating" | "breathing" | "complete">("idle");
  const [logs, setLogs] = useState<SimLog[]>([]);
  const [score, setScore] = useState(0);
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const { user, authenticated, signIn } = usePi();

  const addLog = useCallback((text: string, color = "#888") => {
    setLogs((prev) => [...prev, { text, color, ts: Date.now() }]);
  }, []);

  const runSimulation = useCallback(async () => {
    setLogs([]);
    setPhase("match3");
    addLog("[SYSTEM] Initializing Genesis Breath Sequence...", "#FFD700");
    addLog("[SYSTEM] Player authentication confirmed.", "#50C878");
    addLog("[SYSTEM] Loading match-3 grid...", "#4A90D9");

    // Phase 1: simulate match-3 gameplay
    await new Promise((r) => setTimeout(r, 1500));
    addLog("[MATCH-3] Grid generated. Awaiting player input...", "#888");
    setPhase("validating");

    // Phase 2: validation
    await new Promise((r) => setTimeout(r, 1000));
    const mockScore = Math.floor(Math.random() * 200) + 50;
    setScore(mockScore);
    addLog(`[MATCH-3] Player achieved score: ${mockScore}`, "#F39C12");

    const payload = {
      playerAddress: user?.uid || "dev_uid",
      nonce: 1,
      gridState: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 6))),
      swapA: { row: 3, col: 4 },
      swapB: { row: 3, col: 5 },
      timestamp: Date.now(),
      clientSignature: "sim_sig_" + Date.now(),
    };

    addLog("[EDGE] Submitting match to validateMatch API...", "#4A90D9");

    try {
      const res = await fetch("/api/validateMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        addLog(`[EDGE] Match validated. Server signature: ${data.serverSignature.slice(0, 16)}...`, "#50C878");
        addLog(`[EDGE] Score confirmed: ${data.score}`, "#F39C12");
      } else {
        addLog(`[EDGE] Validation warning: ${data.error}`, "#E74C3C");
      }
    } catch (err) {
      addLog("[EDGE] API unreachable — proceeding with local simulation.", "#E74C3C");
    }

    // Phase 3: Genesis Breath
    setPhase("breathing");
    addLog("[GENESIS] Invoking genesisBreath() on HumanFactoryFacet...", "#FFD700");
    await new Promise((r) => setTimeout(r, 2000));
    addLog("[GENESIS] Avatar #0 (The Primordial Root) created.", "#FFD700");
    addLog("[GENESIS] DNA: 0xffff...ffff (perfect blend of all 11 lineages)", "#FFD700");
    addLog("[GENESIS] Vitality: 100 | Generation: 0 | Cradle: Index 12 Bridge", "#FFD700");
    addLog("[GENESIS] All 11 Ancient Cradles awakened.", "#50C878");

    setAvatarId(0);
    setPhase("complete");
    addLog("[SYSTEM] Genesis Breath Sequence complete.", "#FFD700");
    addLog("[SYSTEM] The Primordial Root lives.", "#FFD700");
  }, [user]);

  return (
    <div style={{
      background: "rgba(0,0,0,0.4)",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "20px",
      maxWidth: "540px",
      width: "100%",
    }}>
      <h3 style={{
        fontFamily: "monospace",
        fontSize: "14px",
        color: phase === "complete" ? "#FFD700" : "#e0e0e0",
        letterSpacing: "3px",
        margin: "0 0 16px 0",
        textAlign: "center",
      }}>
        {phase === "idle" ? "◈ ULTIMATE GENESIS BREATH SIMULATION" :
         phase === "match3" ? "◈ PHASE 1: MATCH-3 GRID LOADED" :
         phase === "validating" ? "◈ PHASE 2: EDGE VALIDATION" :
         phase === "breathing" ? "◈ PHASE 3: GENESIS BREATH" :
         "◈ GENESIS COMPLETE"}
      </h3>

      {/* Status indicators */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
        {["AUTH", "MATCH-3", "EDGE", "GENESIS"].map((label, i) => {
          const status =
            phase === "idle" ? "pending" :
            i === 0 ? "complete" :
            i === 1 ? "complete" :
            i === 2 && (phase === "validating" || phase === "breathing" || phase === "complete") ? "complete" :
            i === 3 && (phase === "breathing" || phase === "complete") ? "complete" :
            "pending";
          return (
            <div key={i} style={{
              padding: "4px 10px",
              borderRadius: "10px",
              fontSize: "9px",
              fontFamily: "monospace",
              letterSpacing: "1px",
              background: status === "complete" ? "rgba(80,200,120,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${
                status === "complete" ? "#50C878" : "rgba(255,255,255,0.1)"
              }`,
              color: status === "complete" ? "#50C878" : "#555",
            }}>
              {status === "complete" ? "✓ " : ""}{label}
            </div>
          );
        })}
      </div>

      {/* Awakening Canvas */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <AwakeningCanvas
          active={phase === "breathing" || phase === "complete"}
          cradleColor="#FFD700"
        />
      </div>

      {/* Log Console */}
      <div style={{
        background: "rgba(0,0,0,0.6)",
        borderRadius: "8px",
        padding: "12px",
        height: "200px",
        overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "monospace",
        fontSize: "11px",
        lineHeight: "1.6",
        marginBottom: "16px",
      }}>
        {logs.length === 0 ? (
          <p style={{ color: "#444", margin: 0 }}>Awaiting initialization...</p>
        ) : (
          logs.map((log, i) => (
            <p key={i} style={LOG_CSS(log.color)}>
              {new Date(log.ts).toLocaleTimeString()} {log.text}
            </p>
          ))
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {phase === "idle" && (
          <button
            onClick={async () => {
              if (!authenticated) await signIn();
              runSimulation();
            }}
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid #FFD700",
              color: "#FFD700",
              padding: "10px 28px",
              borderRadius: "20px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "13px",
              letterSpacing: "2px",
            }}
          >
            INITIATE GENESIS BREATH
          </button>
        )}
        {(phase === "complete") && (
          <button
            onClick={() => {
              setPhase("idle");
              setLogs([]);
              setScore(0);
            }}
            style={{
              background: "rgba(80,200,120,0.15)",
              border: "1px solid #50C878",
              color: "#50C878",
              padding: "10px 28px",
              borderRadius: "20px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "13px",
              letterSpacing: "2px",
            }}
          >
            RUN AGAIN
          </button>
        )}
      </div>

      {/* Result */}
      {phase === "complete" && avatarId !== null && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(255,215,0,0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(255,215,0,0.2)",
          textAlign: "center",
        }}>
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#FFD700", margin: "0 0 4px 0" }}>
            ✦ AVATAR #0 AWAKENED ✦
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", margin: 0 }}>
            The Primordial Root — Genesis complete. All {11} Cradles active.
          </p>
        </div>
      )}
    </div>
  );
}
