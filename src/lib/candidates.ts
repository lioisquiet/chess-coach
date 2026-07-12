import type { EngineScore, PvInfo } from './engine/uciParser';
import { normalizeToWhitePov, pvToSteps, type PvStep } from './chessUtils';

export const MAX_PV_PLIES = 12;

export interface Candidate {
  rank: number;
  san: string;
  uci: string;
  scoreWhitePov: EngineScore;
  depth: number;
  steps: PvStep[];
}

/**
 * Converts raw engine MultiPV infos into display-ready candidates,
 * ordered by rank, with scores normalized to White's perspective.
 */
export function toCandidates(fen: string, infos: PvInfo[]): Candidate[] {
  const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';

  return [...infos]
    .sort((a, b) => a.multipv - b.multipv)
    .flatMap((info) => {
      const steps = pvToSteps(fen, info.pv.slice(0, MAX_PV_PLIES));
      if (steps.length === 0) return [];
      return [
        {
          rank: info.multipv,
          san: steps[0].san,
          uci: steps[0].uci,
          scoreWhitePov: normalizeToWhitePov(info.score, sideToMove),
          depth: info.depth,
          steps,
        },
      ];
    });
}
