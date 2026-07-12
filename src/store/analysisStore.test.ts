import { beforeEach, describe, expect, test } from 'vitest';
import { useAnalysisStore } from './analysisStore';

const record = (ply: number, cp: number, bestMoveSan: string | null = null) =>
  useAnalysisStore.getState().recordEval({
    ply,
    fen: `fen-${ply}`,
    score: { type: 'cp', value: cp },
    bestMoveSan,
  });

describe('analysisStore', () => {
  beforeEach(() => useAnalysisStore.getState().reset());

  test('records evals keyed by ply', () => {
    record(0, 20);
    record(1, 30);

    const { entries } = useAnalysisStore.getState();
    expect(entries[0].score).toEqual({ type: 'cp', value: 20 });
    expect(entries[1].scalar).toBe(30);
  });

  test('derives a move verdict once both surrounding evals exist', () => {
    record(0, 30, 'Nf3');
    record(1, -400); // White blundered from +30 to -400

    const verdict = useAnalysisStore.getState().quality[1];
    expect(verdict.mover).toBe('w');
    expect(verdict.label).toBe('blunder');
    expect(verdict.bestBeforeSan).toBe('Nf3');
  });

  test('recomputes the following move verdict when an earlier eval arrives late', () => {
    record(1, -400); // arrives before ply 0
    expect(useAnalysisStore.getState().quality[1]).toBeUndefined();

    record(0, 30);
    expect(useAnalysisStore.getState().quality[1]?.label).toBe('blunder');
  });

  test('truncate drops entries past an undo point', () => {
    record(0, 10);
    record(1, 15);
    record(2, 20);
    useAnalysisStore.getState().setCurrentPly(2);

    useAnalysisStore.getState().truncate(1);

    const state = useAnalysisStore.getState();
    expect(state.entries[2]).toBeUndefined();
    expect(state.entries[1]).toBeDefined();
    expect(state.quality[2]).toBeUndefined();
    expect(state.currentPly).toBe(1);
  });
});
