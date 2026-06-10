import React, { useRef, useEffect } from "react";

interface AwakeningCanvasProps {
  active: boolean;
  cradleColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function AwakeningCanvas({ active, cradleColor = "#FFD700" }: AwakeningCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = 300;
    const h = 300;
    canvas.width = w;
    canvas.height = h;

    function spawnBurst() {
      const count = 30;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x: w / 2,
          y: h / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 40 + Math.random() * 30,
          size: 2 + Math.random() * 4,
          color: cradleColor,
        });
      }
    }

    function update() {
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;
        p.vy += 0.02;
        return p.life > 0;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Background
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, active ? `${cradleColor}33` : "transparent");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Ripple rings
      timeRef.current += 0.02;
      if (active) {
        for (let i = 0; i < 3; i++) {
          const radius = 30 + ((timeRef.current * 60 + i * 40) % 120);
          const alpha = 1 - radius / 120;
          ctx.strokeStyle = cradleColor;
          ctx.globalAlpha = alpha * 0.3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Particles
      for (const p of particlesRef.current) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (active) {
        if (Math.random() < 0.1) spawnBurst();
      }
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, cradleColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        border: active ? `2px solid ${cradleColor}` : "2px solid rgba(255,255,255,0.1)",
        boxShadow: active ? `0 0 30px ${cradleColor}44` : "none",
      }}
    />
  );
}
