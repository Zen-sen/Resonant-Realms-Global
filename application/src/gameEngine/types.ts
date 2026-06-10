export interface Vec2 {
  row: number;
  col: number;
}

export interface Tile {
  type: number;
  row: number;
  col: number;
  x: number;
  y: number;
  scale: number;
  alpha: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GridState {
  tiles: number[][];
  score: number;
  combo: number;
}

export interface SwapMove {
  a: Vec2;
  b: Vec2;
}

export interface MatchResult {
  matched: Vec2[];
  newGrid: number[][];
  score: number;
}

export interface EngineConfig {
  gridSize: number;
  tileTypes: number;
  tileSize: number;
  animationDuration: number;
}
