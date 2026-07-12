import { Chess } from 'chess.js';
import type { EngineScore } from './engine/uciParser';

export interface UciMoveParts {
  from: string;
  to: string;
  promotion?: string;
}

/** Splits a UCI move string ("e2e4", "a7a8q") into chess.js move parts. */
export function uciToMove(uci: string): UciMoveParts {
  const parts: UciMoveParts = { from: uci.slice(0, 2), to: uci.slice(2, 4) };
  if (uci.length > 4) return { ...parts, promotion: uci.slice(4, 5) };
  return parts;
}

export interface PvStep {
  san: string;
  uci: string;
  fenAfter: string;
}

/**
 * Converts an engine principal variation (UCI moves) into playable steps,
 * stopping at the first move that is illegal from the given position.
 */
export function pvToSteps(fen: string, uciMoves: string[]): PvStep[] {
  const chess = new Chess(fen);
  const steps: PvStep[] = [];

  for (const uci of uciMoves) {
    try {
      const move = chess.move(uciToMove(uci));
      steps.push({ san: move.san, uci, fenAfter: chess.fen() });
    } catch {
      break;
    }
  }

  return steps;
}

/** Engine scores are from the side to move; normalize to White's perspective. */
export function normalizeToWhitePov(score: EngineScore, sideToMove: 'w' | 'b'): EngineScore {
  if (sideToMove === 'w') return score;
  return { type: score.type, value: -score.value };
}

/** Formats a White-perspective score for display: "+0.3", "-1.2", "0.0", "#3", "#-2". */
export function formatEval(score: EngineScore): string {
  if (score.type === 'mate') {
    return score.value >= 0 ? `#${score.value}` : `#-${-score.value}`;
  }
  const pawns = score.value / 100;
  const formatted = Math.abs(pawns).toFixed(1);
  if (formatted === '0.0') return '0.0';
  return pawns > 0 ? `+${formatted}` : `-${formatted}`;
}
