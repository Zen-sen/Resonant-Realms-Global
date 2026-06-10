import { Particle } from "./types";

const GRAVITY = 0.05;
const FRICTION = 0.99;

export function createParticles(x: number, y: number, color: string, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 30 + Math.random() * 20,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += GRAVITY;
    p.vx *= FRICTION;
    p.vy *= FRICTION;
    p.life -= 1 / p.maxLife;
    return p.life > 0;
  });
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const CRADLE_COLORS = [
  "#FFD700", // Gold - Indus
  "#50C878", // Emerald - Mesoamerica
  "#4A90D9", // Azure - Mesopotamia
  "#E74C3C", // Crimson - Nile
  "#9B59B6", // Purple - Yellow River
  "#F39C12", // Amber - Andes
  "#1ABC9C", // Teal - Aegean
  "#E67E22", // Orange - Nok
  "#3498DB", // Blue - Yangtze
  "#2ECC71", // Green - Amazon
  "#E91E63", // Pink - Sahara
];

export function getCradleColor(index: number): string {
  return CRADLE_COLORS[index % CRADLE_COLORS.length];
}

export function getTileColor(type: number): string {
  return CRADLE_COLORS[type % CRADLE_COLORS.length];
}
