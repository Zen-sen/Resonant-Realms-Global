import React, { useState } from "react";
import Match3Grid from "../src/components/Match3Grid";
import AwakeningCanvas from "../src/components/AwakeningCanvas";
import GenesisSimulation from "../src/components/GenesisSimulation";
import { PiProvider, usePi } from "../src/context";

const CRADLE_COLORS = [
  "#FFD700", "#50C878", "#4A90D9", "#E74C3C", "#9B59B6",
  "#F39C12", "#1ABC9C", "#E67E22", "#3498DB", "#2ECC71", "#E91E63",
];

function GameContent() {
  const [score, setScore] = useState(0);
  const [awakened, setAwakened] = useState(false);
  const [view, setView] = useState<"game" | "genesis">("game");
  const { user, loading, authenticated, signIn, signOut, checkBalance, balance } = usePi();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a1a",
      color: "#e0e0e0",
      fontFamily: "monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
      gap: "16px",
      maxWidth: "100%",
      overflowX: "hidden",
    }}>
      <header style={{
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        paddingBottom: "16px",
        width: "100%",
        maxWidth: "540px",
      }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: 300,
          letterSpacing: "4px",
          color: awakened ? "#FFD700" : "#888",
          textShadow: awakened ? "0 0 20px rgba(255,215,0,0.3)" : "none",
        }}>
          RESONANT REALMS
        </h1>
        <p style={{ fontSize: "12px", color: "#555", letterSpacing: "2px" }}>
          THE STATIC AWAITS
        </p>
      </header>

      {/* Pi Network Auth + Balance */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 16px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: "12px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {loading ? (
          <span style={{ color: "#888" }}>Authenticating...</span>
        ) : authenticated ? (
          <>
            <span style={{ color: "#50C878" }}>●</span>
            <span>{user?.username}</span>
            {balance.length > 0 && (
              <span style={{ color: "#F39C12" }}>{balance[0].amount} π</span>
            )}
            <button
              onClick={() => checkBalance()}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#888",
                padding: "4px 10px",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "9px",
              }}
            >
              BALANCE
            </button>
            <button
              onClick={signOut}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#888",
                padding: "4px 12px",
                borderRadius: "12px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "10px",
              }}
            >
              DISCONNECT
            </button>
          </>
        ) : (
          <button
            onClick={signIn}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#e0e0e0",
              padding: "6px 20px",
              borderRadius: "16px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            CONNECT PI WALLET
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div style={{
        display: "flex",
        gap: "4px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "16px",
        padding: "4px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          onClick={() => setView("game")}
          style={{
            background: view === "game" ? "rgba(255,255,255,0.08)" : "transparent",
            border: "none",
            color: view === "game" ? "#e0e0e0" : "#555",
            padding: "6px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "1px",
          }}
        >
          GAME
        </button>
        <button
          onClick={() => setView("genesis")}
          style={{
            background: view === "genesis" ? "rgba(255,215,0,0.15)" : "transparent",
            border: "none",
            color: view === "genesis" ? "#FFD700" : "#555",
            padding: "6px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "1px",
          }}
        >
          GENESIS
        </button>
      </div>

      {view === "game" ? (
        <>
          <AwakeningCanvas
            active={awakened}
            cradleColor={CRADLE_COLORS[score > 100 ? 0 : score > 50 ? 4 : 10]}
          />

          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <Match3Grid onScoreChange={setScore} awakended={awakened} />
          </div>

          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            <button
              onClick={() => setAwakened(!awakened)}
              style={{
                background: awakened ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${awakened ? "#FFD700" : "rgba(255,255,255,0.15)"}`,
                color: awakened ? "#FFD700" : "#888",
                padding: "8px 24px",
                borderRadius: "20px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "12px",
                letterSpacing: "2px",
              }}
            >
              {awakened ? "✧ AWAKENED" : "⊙ DORMANT"}
            </button>
          </div>
        </>
      ) : (
        <GenesisSimulation />
      )}

      <footer style={{
        fontSize: "10px",
        color: "#333",
        marginTop: "20px",
        letterSpacing: "1px",
      }}>
        BUILT ON THE DIAMOND · EIP-2535
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <PiProvider sandbox={true}>
      <GameContent />
    </PiProvider>
  );
}
