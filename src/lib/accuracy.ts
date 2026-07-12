import type { EngineScore } from './engine/uciParser';
import { scoreToWhiteShare } from './winProbability';

export interface ScoredPosition {
  ply: number;
  score: EngineScore;
}

/** White's win percentage (0–100) for a position. */
export function whiteWinPercent(score: EngineScore): number {
  return scoreToWhiteShare(score) * 100;
}

/** Lichess's per-move accuracy curve, from the drop in the mover's win %. */
export function moveAccuracy(winBeforeMover: number, winAfterMover: number): number {
  const raw = 103.1668 * Math.exp(-0.04354 * (winBeforeMover - winAfterMover)) - 3.1669;
  return Math.max(0, Math.min(100, raw));
}

export interface AccuracyResult {
  white: number | null;
  black: number | null;
}

/**
 * Average accuracy per side across a game. `positions` must be ordered by ply
 * starting at the initial position (ply 0); gaps are skipped. Move `p` was made
 * by White when `p` is odd, and graded from that side's perspective.
 */
export function computeAccuracy(positions: ScoredPosition[]): AccuracyResult {
  const byPly = new Map(positions.map((p) => [p.ply, p.score]));
  const whiteAccs: number[] = [];
  const blackAccs: number[] = [];
  const maxPly = positions.reduce((m, p) => Math.max(m, p.ply), 0);

  for (let ply = 1; ply <= maxPly; ply += 1) {
    const before = byPly.get(ply - 1);
    const after = byPly.get(ply);
    if (!before || !after) continue;

    const whiteBefore = whiteWinPercent(before);
    const whiteAfter = whiteWinPercent(after);
    const isWhiteMove = ply % 2 === 1;

    const moverBefore = isWhiteMove ? whiteBefore : 100 - whiteBefore;
    const moverAfter = isWhiteMove ? whiteAfter : 100 - whiteAfter;
    (isWhiteMove ? whiteAccs : blackAccs).push(moveAccuracy(moverBefore, moverAfter));
  }

  const avg = (xs: number[]) =>
    xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : null;

  return { white: avg(whiteAccs), black: avg(blackAccs) };
}
