import { create } from 'zustand';
import type { EngineScore } from '../lib/engine/uciParser';
import { classifyMove, scoreToScalar, type MoveQuality } from '../lib/moveQuality';
import type { PlayerColor } from './gameStore';

export interface AnalysisEntry {
  ply: number;
  fen: string;
  score: EngineScore; // White perspective
  scalar: number; // White perspective, mate-aware
  bestMoveSan: string | null;
}

export interface MoveVerdict extends MoveQuality {
  mover: PlayerColor;
  bestBeforeSan: string | null;
}

interface AnalysisState {
  entries: Record<number, AnalysisEntry>;
  quality: Record<number, MoveVerdict>;
  currentPly: number;
  setCurrentPly: (ply: number) => void;
  recordEval: (input: {
    ply: number;
    fen: string;
    score: EngineScore;
    bestMoveSan: string | null;
  }) => void;
  truncate: (maxPly: number) => void;
  reset: () => void;
}

const moverOf = (ply: number): PlayerColor => (ply % 2 === 1 ? 'w' : 'b');

function verdictFor(
  entries: Record<number, AnalysisEntry>,
  ply: number,
): MoveVerdict | null {
  const before = entries[ply - 1];
  const after = entries[ply];
  if (!before || !after || ply < 1) return null;
  return {
    ...classifyMove(before.scalar, after.scalar, moverOf(ply)),
    mover: moverOf(ply),
    bestBeforeSan: before.bestMoveSan,
  };
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  entries: {},
  quality: {},
  currentPly: 0,

  setCurrentPly: (ply) => set({ currentPly: ply }),

  recordEval: ({ ply, fen, score, bestMoveSan }) =>
    set((state) => {
      const entry: AnalysisEntry = { ply, fen, score, scalar: scoreToScalar(score), bestMoveSan };
      const entries = { ...state.entries, [ply]: entry };
      const quality = { ...state.quality };
      // Recompute the verdict for this move and the one that follows it.
      for (const p of [ply, ply + 1]) {
        const verdict = verdictFor(entries, p);
        if (verdict) quality[p] = verdict;
      }
      return { entries, quality };
    }),

  truncate: (maxPly) =>
    set((state) => {
      const entries: Record<number, AnalysisEntry> = {};
      const quality: Record<number, MoveVerdict> = {};
      for (const [key, value] of Object.entries(state.entries)) {
        if (Number(key) <= maxPly) entries[Number(key)] = value;
      }
      for (const [key, value] of Object.entries(state.quality)) {
        if (Number(key) <= maxPly) quality[Number(key)] = value;
      }
      return { entries, quality, currentPly: Math.min(state.currentPly, maxPly) };
    }),

  reset: () => set({ entries: {}, quality: {}, currentPly: 0 }),
}));
