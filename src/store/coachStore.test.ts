import { beforeEach, describe, expect, test } from 'vitest';
import type { Candidate } from '../lib/candidates';
import { useCoachStore } from './coachStore';

const FEN_A = 'fen-a';
const FEN_B = 'fen-b';

const candidate = (rank: number, plies: number): Candidate => ({
  rank,
  san: 'e4',
  uci: 'e2e4',
  scoreWhitePov: { type: 'cp', value: 10 },
  depth: 18,
  steps: Array.from({ length: plies }, (_, i) => ({
    san: `m${i}`,
    uci: 'e2e4',
    fenAfter: `fen-${i}`,
  })),
});

describe('coachStore', () => {
  beforeEach(() => useCoachStore.getState().clear());

  test('beginAnalysis enters analyzing state for a position', () => {
    useCoachStore.getState().beginAnalysis(FEN_A);

    const state = useCoachStore.getState();
    expect(state.status).toBe('analyzing');
    expect(state.forFen).toBe(FEN_A);
    expect(state.candidates).toEqual([]);
  });

  test('updateCandidates ignores results for a different position', () => {
    useCoachStore.getState().beginAnalysis(FEN_A);
    useCoachStore.getState().updateCandidates(FEN_B, [candidate(1, 3)]);

    expect(useCoachStore.getState().candidates).toEqual([]);
  });

  test('updateCandidates ignores results after clear (fresh silence)', () => {
    useCoachStore.getState().beginAnalysis(FEN_A);
    useCoachStore.getState().clear();
    useCoachStore.getState().updateCandidates(FEN_A, [candidate(1, 3)]);
    useCoachStore.getState().finishAnalysis(FEN_A);

    const state = useCoachStore.getState();
    expect(state.status).toBe('quiet');
    expect(state.candidates).toEqual([]);
  });

  test('finishAnalysis marks matching position ready', () => {
    useCoachStore.getState().beginAnalysis(FEN_A);
    useCoachStore.getState().updateCandidates(FEN_A, [candidate(1, 3)]);
    useCoachStore.getState().finishAnalysis(FEN_A);

    expect(useCoachStore.getState().status).toBe('ready');
  });

  test('expanding a candidate starts the stepper at its first move', () => {
    useCoachStore.getState().beginAnalysis(FEN_A);
    useCoachStore.getState().updateCandidates(FEN_A, [candidate(1, 3)]);
    useCoachStore.getState().toggleExpand(1);

    expect(useCoachStore.getState().expandedRank).toBe(1);
    expect(useCoachStore.getState().stepIdx).toBe(1);

    useCoachStore.getState().toggleExpand(1); // collapse
    expect(useCoachStore.getState().expandedRank).toBeNull();
    expect(useCoachStore.getState().stepIdx).toBe(0);
  });

  test('nextStep and prevStep stay within line bounds', () => {
    useCoachStore.getState().beginAnalysis(FEN_A);
    useCoachStore.getState().updateCandidates(FEN_A, [candidate(1, 2)]);
    useCoachStore.getState().toggleExpand(1);

    useCoachStore.getState().nextStep();
    useCoachStore.getState().nextStep(); // beyond end — clamps
    expect(useCoachStore.getState().stepIdx).toBe(2);

    useCoachStore.getState().prevStep();
    useCoachStore.getState().prevStep();
    useCoachStore.getState().prevStep(); // beyond start — clamps
    expect(useCoachStore.getState().stepIdx).toBe(0);
  });
});
