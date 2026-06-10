import React, { useRef, useEffect, useState, useCallback } from "react";
import { Match3Engine } from "../gameEngine";

interface Match3GridProps {
  onScoreChange?: (score: number) => void;
  awakended?: boolean;
}

export default function Match3Grid({ onScoreChange, awakended = false }: Match3GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Match3Engine | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new Match3Engine(canvasRef.current, (s) => {
      setScore(s);
      onScoreChange?.(s);
    });
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    engineRef.current?.handleClick(e.clientX, e.clientY);
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      engineRef.current?.handleClick(touch.clientX, touch.clientY);
    }
  }, []);

  return (
    <div className="match3-container" style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
    }}>
      <div className="score-display" style={{
        fontFamily: "monospace",
        fontSize: "18px",
        color: awakended ? "#FFD700" : "#888",
        textShadow: awakended ? "0 0 10px rgba(255,215,0,0.5)" : "none",
      }}>
        SCORE: {score}
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onTouchStart={handleTouch}
        style={{
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: awakended
            ? "0 0 20px rgba(255,215,0,0.3), inset 0 0 20px rgba(255,215,0,0.1)"
            : "0 0 10px rgba(0,0,0,0.3)",
          border: awakended ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
}
