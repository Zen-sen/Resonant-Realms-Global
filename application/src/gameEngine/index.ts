import { Tile, Vec2, Particle } from "./types";
import { generateGrid, processSwap, isAdjacent, findMatches, collapseGrid } from "./grid";
import { createRenderer } from "./renderer";
import { createParticles, updateParticles, drawParticles, getTileColor } from "./particles";

export class Match3Engine {
  private grid: number[][];
  private tiles: Tile[] = [];
  private particles: Particle[] = [];
  private renderer: ReturnType<typeof createRenderer>;
  private score = 0;
  private selected: Vec2 | null = null;
  private animating = false;
  private onScoreChange?: (score: number) => void;
  private onMatch?: (matched: Vec2[]) => void;

  constructor(canvas: HTMLCanvasElement, onScoreChange?: (score: number) => void, onMatch?: (matched: Vec2[]) => void) {
    this.grid = generateGrid();
    this.onScoreChange = onScoreChange;
    this.onMatch = onMatch;
    this.renderer = createRenderer(canvas, { gridSize: 8, tileSize: 48 });
    this.syncTiles();
    this.renderer.startLoop(() => this.tiles, () => this.drawParticles());
  }

  private syncTiles() {
    this.tiles = [];
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const pos = this.renderer.gridToPixel(r, c);
        this.tiles.push({
          type: this.grid[r][c],
          row: r,
          col: c,
          x: pos.x,
          y: pos.y,
          scale: 1,
          alpha: 1,
        });
      }
    }
  }

  handleClick(screenX: number, screenY: number) {
    if (this.animating) return;

    const cell = this.renderer.screenToGrid(screenX, screenY);
    if (!cell) return;

    if (this.selected === null) {
      this.selected = cell;
      return;
    }

    if (!isAdjacent(this.selected, cell)) {
      this.selected = cell;
      return;
    }

    this.trySwap(this.selected, cell);
    this.selected = null;
  }

  private async trySwap(a: Vec2, b: Vec2) {
    this.animating = true;
    const result = processSwap(this.grid, a, b);

    if (!result) {
      this.animating = false;
      return;
    }

    // Animate swap
    await this.animateSwap(a, b);

    // Flash matched tiles
    await this.animateMatch(result.matched);

    // Spawn particles
    for (const m of result.matched) {
      const pos = this.renderer.gridToPixel(m.row, m.col);
      const color = getTileColor(this.grid[m.row][m.col]);
      this.particles.push(...createParticles(pos.x + 24, pos.y + 24, color, 8));
    }

    // Update grid
    this.grid = result.newGrid;
    this.score += result.score;
    this.syncTiles();

    this.onScoreChange?.(this.score);
    this.onMatch?.(result.matched);

    // Check for chain matches
    let chainResult = result;
    while (true) {
      const matches = findMatches(this.grid);
      if (matches.length === 0) break;

      // Trigger chain particles
      for (const m of matches) {
        const pos = this.renderer.gridToPixel(m.row, m.col);
        const color = getTileColor(this.grid[m.row][m.col]);
        this.particles.push(...createParticles(pos.x + 24, pos.y + 24, color, 6));
      }

      await this.animateMatch(matches);
      const cleared = this.grid.map((row) => [...row]);
      for (const m of matches) {
        cleared[m.row][m.col] = -1;
      }
      this.grid = collapseGrid(cleared);
      this.score += matches.length * 10;
      this.syncTiles();
      this.onScoreChange?.(this.score);
    }

    this.animating = false;
  }

  private animateSwap(a: Vec2, b: Vec2): Promise<void> {
    return new Promise((resolve) => {
      const duration = 150;
      const startTime = performance.now();
      const aStart = this.renderer.gridToPixel(a.row, a.col);
      const bStart = this.renderer.gridToPixel(b.row, b.col);
      const aEnd = this.renderer.gridToPixel(b.row, b.col);
      const bEnd = this.renderer.gridToPixel(a.row, a.col);

      const tileA = this.tiles.find((t) => t.row === a.row && t.col === a.col)!;
      const tileB = this.tiles.find((t) => t.row === b.row && t.col === b.col)!;

      const animate = (time: number) => {
        const t = Math.min((time - startTime) / duration, 1);
        const ease = t * (2 - t);

        tileA.x = aStart.x + (aEnd.x - aStart.x) * ease;
        tileA.y = aStart.y + (aEnd.y - aStart.y) * ease;
        tileB.x = bStart.x + (bEnd.x - bStart.x) * ease;
        tileB.y = bStart.y + (bEnd.y - bStart.y) * ease;

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          tileA.row = b.row;
          tileA.col = b.col;
          tileB.row = a.row;
          tileB.col = a.col;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  private animateMatch(matched: Vec2[]): Promise<void> {
    return new Promise((resolve) => {
      const duration = 250;
      const startTime = performance.now();

      const animate = (time: number) => {
        const t = Math.min((time - startTime) / duration, 1);
        for (const m of matched) {
          const tile = this.tiles.find((t) => t.row === m.row && t.col === m.col);
          if (tile) {
            tile.alpha = 1 - t;
            tile.scale = 1 + t * 0.3;
          }
        }
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  private drawParticles() {
    this.particles = updateParticles(this.particles);
    drawParticles(this.renderer.ctx, this.particles);
  }

  getScore() {
    return this.score;
  }

  getGrid() {
    return this.grid;
  }

  destroy() {
    this.renderer.stopLoop();
  }

  reset() {
    this.grid = generateGrid();
    this.score = 0;
    this.selected = null;
    this.particles = [];
    this.syncTiles();
  }
}
