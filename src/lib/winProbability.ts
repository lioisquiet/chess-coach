import type { EngineScore } from './engine/uciParser';

// Lichess's logistic constant mapping centipawns to win probability.
const WIN_PROB_K = 0.00368208;

/** Maps a White-perspective centipawn score to White's win probability in [0, 1]. */
export function cpToWinProb(cp: number): number {
  return 1 / (1 + Math.exp(-WIN_PROB_K * cp));
}

/**
 * White's share of the eval bar in [0, 1]. Mate scores peg the bar fully;
 * centipawn scores use the win-probability curve.
 */
export function scoreToWhiteShare(score: EngineScore): number {
  if (score.type === 'mate') return score.value >= 0 ? 1 : 0;
  return cpToWinProb(score.value);
}
