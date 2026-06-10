import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const GRID_SIZE = 8;
const TILE_TYPES = 6;

const SERVER_PRIVATE_KEY = process.env.MATCH_SIGNER_PRIVATE_KEY || crypto.randomBytes(32).toString("hex");
const HUMAN_MATCH_SPEED_FLOOR = 300;

type GridMove = {
  playerAddress: string;
  nonce: number;
  gridState: number[][];
  swapA: { row: number; col: number };
  swapB: { row: number; col: number };
  timestamp: number;
  clientSignature: string;
};

type MatchResult = {
  matched: boolean;
  matchedIndices: { row: number; col: number }[];
  newGridState: number[][];
  score: number;
};

function generateGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(Math.floor(Math.random() * TILE_TYPES));
    }
    grid.push(row);
  }
  return grid;
}

function findMatches(grid: number[][]): { row: number; col: number }[] {
  const matched = new Set<string>();
  const matches: { row: number; col: number }[] = [];

  // Horizontal
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      if (grid[r][c] !== -1 && grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2]) {
        matched.add(`${r},${c}`);
        matched.add(`${r},${c + 1}`);
        matched.add(`${r},${c + 2}`);
      }
    }
  }

  // Vertical
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

function applySwap(grid: number[][], a: { row: number; col: number }, b: { row: number; col: number }): number[][] {
  const newGrid = grid.map((row) => [...row]);
  const temp = newGrid[a.row][a.col];
  newGrid[a.row][a.col] = newGrid[b.row][b.col];
  newGrid[b.row][b.col] = temp;
  return newGrid;
}

function collapseGrid(grid: number[][]): number[][] {
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

function createSignature(payload: object): string {
  const hmac = crypto.createHmac("sha256", SERVER_PRIVATE_KEY);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
}

function verifyClientSignature(
  payload: Omit<GridMove, "clientSignature">,
  signature: string,
  _playerAddress: string
): boolean {
  const hmac = crypto.createHmac("sha256", _playerAddress + SERVER_PRIVATE_KEY);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex") === signature;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body: GridMove = req.body;
    const { playerAddress, nonce, gridState, swapA, swapB, timestamp, clientSignature } = body;

    if (!playerAddress || !gridState || !swapA || !swapB) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (gridState.length !== GRID_SIZE || gridState[0].length !== GRID_SIZE) {
      return res.status(400).json({ error: "Invalid grid dimensions" });
    }

    if (!verifyClientSignature(
      { playerAddress, nonce, gridState, swapA, swapB, timestamp },
      clientSignature,
      playerAddress
    )) {
      return res.status(401).json({ error: "Invalid client signature" });
    }

    // Speed check
    const now = Date.now();
    const elapsed = now - timestamp;
    if (elapsed < HUMAN_MATCH_SPEED_FLOOR) {
      return res.status(429).json({
        error: "Anomaly detected",
        speedMs: elapsed,
        anomaly: true,
      });
    }

    // Recalculate swap
    const swappedGrid = applySwap(gridState, swapA, swapB);
    const matches = findMatches(swappedGrid);

    if (matches.length === 0) {
      return res.status(400).json({ error: "No valid match from swap" });
    }

    // Collapse and refill
    const withCleared = swappedGrid.map((row) => [...row]);
    matches.forEach((m) => { withCleared[m.row][m.col] = -1; });
    const finalGrid = collapseGrid(withCleared);

    const matchResult: MatchResult = {
      matched: true,
      matchedIndices: matches,
      newGridState: finalGrid,
      score: matches.length * 10,
    };

    // Sign the result with server private key
    const serverSignature = createSignature({
      playerAddress,
      nonce,
      matchResult,
    });

    return res.status(200).json({
      ...matchResult,
      serverSignature,
      nonce,
    });
  } catch (err) {
    console.error("validateMatch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
