import { Tile, Vec2, EngineConfig } from "./types";
import { getTileColor } from "./particles";

const DEFAULT_CONFIG: EngineConfig = {
  gridSize: 8,
  tileTypes: 6,
  tileSize: 48,
  animationDuration: 200,
};

const TILE_PADDING = 2;

export function createRenderer(canvas: HTMLCanvasElement, config: Partial<EngineConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const ctx = canvas.getContext("2d")!;
  const width = cfg.gridSize * cfg.tileSize;
  const height = cfg.gridSize * cfg.tileSize;
  canvas.width = width;
  canvas.height = height;

  let animationId = 0;
  let running = false;

  function clear() {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);
    drawGridBackground();
  }

  function drawGridBackground() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let r = 0; r <= cfg.gridSize; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cfg.tileSize);
      ctx.lineTo(width, r * cfg.tileSize);
      ctx.stroke();
    }
    for (let c = 0; c <= cfg.gridSize; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cfg.tileSize, 0);
      ctx.lineTo(c * cfg.tileSize, height);
      ctx.stroke();
    }
  }

  function drawTile(tile: Tile, flash = false) {
    const x = tile.x;
    const y = tile.y;
    const size = cfg.tileSize - TILE_PADDING * 2;
    const color = getTileColor(tile.type);

    ctx.globalAlpha = tile.alpha;

    // Tile body
    ctx.fillStyle = flash ? "#ffffff" : color;
    ctx.globalAlpha = flash ? 0.8 : 0.85;
    const radius = 4;
    ctx.beginPath();
    ctx.roundRect(x + TILE_PADDING, y + TILE_PADDING, size, size, radius);
    ctx.fill();

    // Glow
    ctx.globalAlpha = 0.3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner symbol
    ctx.globalAlpha = tile.alpha * 0.6;
    ctx.fillStyle = "#ffffff";
    ctx.font = `${size * 0.5}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(tile.type), x + cfg.tileSize / 2, y + cfg.tileSize / 2);

    ctx.globalAlpha = 1;
  }

  function render(tiles: Tile[], particles: () => void) {
    clear();
    for (const tile of tiles) {
      drawTile(tile);
    }
    particles();
  }

  function startLoop(
    getTiles: () => Tile[],
    drawParticles: () => void
  ) {
    running = true;
    function loop() {
      if (!running) return;
      render(getTiles(), drawParticles);
      animationId = requestAnimationFrame(loop);
    }
    animationId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    running = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }

  function canvasToGrid(canvasX: number, canvasY: number): Vec2 | null {
    const col = Math.floor(canvasX / cfg.tileSize);
    const row = Math.floor(canvasY / cfg.tileSize);
    if (row >= 0 && row < cfg.gridSize && col >= 0 && col < cfg.gridSize) {
      return { row, col };
    }
    return null;
  }

  function gridToPixel(row: number, col: number): { x: number; y: number } {
    return {
      x: col * cfg.tileSize,
      y: row * cfg.tileSize,
    };
  }

  return {
    clear,
    render,
    startLoop,
    stopLoop,
    canvasToGrid,
    gridToPixel,
    ctx,
    cfg,
  };
}
