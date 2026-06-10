import { Vec2, MatchResult } from "./types";

const GRID_SIZE = 8;
const TILE_TYPES = 6;

export function generateGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(Math.floor(Math.random() * TILE_TYPES));
    }
    grid.push(row);
  }
  // Remove initial matches
  let matches = findMatches(grid);
  while (matches.length > 0) {
    for (const m of matches) {
      grid[m.row][m.col] = Math.floor(Math.random() * TILE_TYPES);
    }
    matches = findMatches(grid);
  }
  return grid;
}

export function findMatches(grid: number[][]): Vec2[] {
  const matched = new Set<string>();
  const matches: Vec2[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      if (grid[r][c] !== -1 && grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2]) {
        matched.add(`${r},${c}`);
        matched.add(`${r},${c + 1}`);
        matched.add(`${r},${c + 2}`);
      }
    }
  }

  for (let r = 0; r < GRID_SIZE - 2; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== -1 && grid[r][c] === grid[r + 1][c] && grid[r][c] === grid[r + 2][c]) {
        matched.add(`${r},${c}`);
        matched.add(`${r + 1},${c}`);
        matched.add(`${r + 2},${c}`);
      }
    }
  }

  matched.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    matches.push({ row: r, col: c });
  });

  return matches;
}

export function applySwap(grid: number[][], a: Vec2, b: Vec2): number[][] {
  const newGrid = grid.map((row) => [...row]);
  const temp = newGrid[a.row][a.col];
  newGrid[a.row][a.col] = newGrid[b.row][b.col];
  newGrid[b.row][b.col] = temp;
  return newGrid;
}

export function collapseGrid(grid: number[][]): number[][] {
  const newGrid = grid.map((row) => [...row]);
  for (let c = 0; c < GRID_SIZE; c++) {
    const column: number[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r][c] !== -1) {
        column.push(newGrid[r][c]);
      }
    }
    while (column.length < GRID_SIZE) {
      column.unshift(Math.floor(Math.random() * TILE_TYPES));
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r][c] = column[r];
    }
  }
  return newGrid;
}

export function processSwap(grid: number[][], a: Vec2, b: Vec2): MatchResult | null {
  const swapped = applySwap(grid, a, b);
  const matches = findMatches(swapped);

  if (matches.length === 0) return null;

  const cleared = swapped.map((row) => [...row]);
  for (const m of matches) {
    cleared[m.row][m.col] = -1;
  }

  const finalGrid = collapseGrid(cleared);

  return {
    matched: matches,
    newGrid: finalGrid,
    score: matches.length * 10,
  };
}

export function isAdjacent(a: Vec2, b: Vec2): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function isValidCell(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}
