import { create } from 'zustand';
import type { Candidate } from '../lib/candidates';

export type CoachStatus = 'quiet' | 'analyzing' | 'ready';

interface CoachState {
  status: CoachStatus;
  forFen: string | null;
  candidates: Candidate[];
  expandedRank: number | null;
  stepIdx: number;
  beginAnalysis: (fen: string) => void;
  updateCandidates: (fen: string, candidates: Candidate[]) => void;
  finishAnalysis: (fen: string) => void;
  clear: () => void;
  toggleExpand: (rank: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStep: () => void;
}

const findExpanded = (state: CoachState): Candidate | undefined =>
  state.candidates.find((c) => c.rank === state.expandedRank);

export const useCoachStore = create<CoachState>((set, get) => ({
  status: 'quiet',
  forFen: null,
  candidates: [],
  expandedRank: null,
  stepIdx: 0,

  beginAnalysis: (fen) =>
    set({ status: 'analyzing', forFen: fen, candidates: [], expandedRank: null, stepIdx: 0 }),

  updateCandidates: (fen, candidates) => {
    const state = get();
    if (state.forFen !== fen || state.status === 'quiet') return;
    set({ candidates });
  },

  finishAnalysis: (fen) => {
    const state = get();
    if (state.forFen !== fen || state.status === 'quiet') return;
    set({ status: 'ready' });
  },

  clear: () =>
    set({ status: 'quiet', forFen: null, candidates: [], expandedRank: null, stepIdx: 0 }),

  toggleExpand: (rank) =>
    set((state) => ({
      expandedRank: state.expandedRank === rank ? null : rank,
      stepIdx: state.expandedRank === rank ? 0 : 1,
    })),

  nextStep: () => {
    const state = get();
    const candidate = findExpanded(state);
    if (!candidate) return;
    set({ stepIdx: Math.min(candidate.steps.length, state.stepIdx + 1) });
  },

  prevStep: () => set((state) => ({ stepIdx: Math.max(0, state.stepIdx - 1) })),

  resetStep: () => set({ stepIdx: 0 }),
}));
