import { Chess } from 'chess.js';
import { beforeEach, describe, expect, test } from 'vitest';
import { OPENINGS_BY_ID } from '../data/trainerOpenings';
import { useTrainerStore } from './trainerStore';

/** Resolves a SAN move to its from/to squares in a given position. */
function squares(fen: string, san: string): { from: string; to: string } {
  const chess = new Chess(fen);
  const move = chess.move(san);
  return { from: move.from, to: move.to };
}

describe('trainerStore', () => {
  beforeEach(() => useTrainerStore.getState().exit());

  test('selecting a White opening waits for the learner to move first', () => {
    useTrainerStore.getState().select('italian');
    const state = useTrainerStore.getState();
    expect(state.status).toBe('active');
    expect(state.lineIndex).toBe(0);
    expect(new Chess(state.fen).turn()).toBe('w');
  });

  test('selecting a Black defense auto-plays White’s first book move', () => {
    useTrainerStore.getState().select('sicilian');
    const state = useTrainerStore.getState();
    expect(state.lineIndex).toBe(1); // 1.e4 already played
    expect(new Chess(state.fen).turn()).toBe('b');
  });

  test('a correct move advances and auto-plays the opponent reply', () => {
    useTrainerStore.getState().select('italian');
    const { from, to } = squares(useTrainerStore.getState().fen, 'e4');

    const ok = useTrainerStore.getState().attemptMove(from, to);

    const state = useTrainerStore.getState();
    expect(ok).toBe(true);
    expect(state.feedback?.type).toBe('correct');
    expect(state.lineIndex).toBe(2); // learner e4 + opponent e5
    expect(new Chess(state.fen).turn()).toBe('w');
  });

  test('a wrong move is rejected with the expected move named', () => {
    useTrainerStore.getState().select('italian');
    const { from, to } = squares(useTrainerStore.getState().fen, 'd4'); // not the line

    const ok = useTrainerStore.getState().attemptMove(from, to);

    const state = useTrainerStore.getState();
    expect(ok).toBe(false);
    expect(state.feedback?.type).toBe('wrong');
    expect(state.feedback?.text).toContain('e4');
    expect(state.lineIndex).toBe(0); // unchanged
  });

  test('completing the line marks the drill done', () => {
    const opening = OPENINGS_BY_ID.get('italian')!;
    useTrainerStore.getState().select('italian');

    // Play every learner move in order until the line is exhausted.
    for (let guard = 0; guard < 20 && useTrainerStore.getState().status === 'active'; guard += 1) {
      const { fen, lineIndex } = useTrainerStore.getState();
      const { from, to } = squares(fen, opening.line[lineIndex]);
      useTrainerStore.getState().attemptMove(from, to);
    }

    expect(useTrainerStore.getState().status).toBe('complete');
    expect(useTrainerStore.getState().feedback?.type).toBe('done');
  });
});
