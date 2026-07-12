import { beforeEach, describe, expect, test } from 'vitest';
import { START_FEN, useGameStore } from './gameStore';

const reset = () => useGameStore.getState().newGame('w');

describe('gameStore', () => {
  beforeEach(reset);

  test('makePlayerMove applies a legal move and records SAN history', () => {
    const ok = useGameStore.getState().makePlayerMove('e2', 'e4');

    const state = useGameStore.getState();
    expect(ok).toBe(true);
    expect(state.history.map((h) => h.san)).toEqual(['e4']);
    expect(state.fen).toContain(' b ');
  });

  test('makePlayerMove rejects illegal moves', () => {
    expect(useGameStore.getState().makePlayerMove('e2', 'e5')).toBe(false);
    expect(useGameStore.getState().history).toEqual([]);
  });

  test('makePlayerMove rejects moves when it is not the player turn', () => {
    useGameStore.getState().makePlayerMove('e2', 'e4');

    expect(useGameStore.getState().makePlayerMove('e7', 'e5')).toBe(false);
  });

  test('applyEngineMove plays the reply and ignores stale illegal moves', () => {
    useGameStore.getState().makePlayerMove('e2', 'e4');
    useGameStore.getState().applyEngineMove('e7e5');

    expect(useGameStore.getState().history.map((h) => h.san)).toEqual(['e4', 'e5']);

    useGameStore.getState().makePlayerMove('g1', 'f3');
    useGameStore.getState().applyEngineMove('e7e5'); // now illegal — must be ignored
    expect(useGameStore.getState().history).toHaveLength(3);
  });

  test('undo rewinds to the player last decision point (removes ply pair)', () => {
    useGameStore.getState().makePlayerMove('e2', 'e4');
    useGameStore.getState().applyEngineMove('e7e5');

    useGameStore.getState().undo();

    const state = useGameStore.getState();
    expect(state.history).toEqual([]);
    expect(state.fen).toBe(START_FEN);
  });

  test('detects checkmate and blocks further moves', () => {
    const store = useGameStore.getState();
    store.makePlayerMove('f2', 'f3');
    useGameStore.getState().applyEngineMove('e7e5');
    useGameStore.getState().makePlayerMove('g2', 'g4');
    useGameStore.getState().applyEngineMove('d8h4'); // fool's mate

    const state = useGameStore.getState();
    expect(state.gameOverText).toBe('Checkmate — Black wins');
    expect(useGameStore.getState().makePlayerMove('a2', 'a3')).toBe(false);
  });

  test('newGame as black flips orientation and resets state', () => {
    useGameStore.getState().makePlayerMove('e2', 'e4');
    useGameStore.getState().newGame('b');

    const state = useGameStore.getState();
    expect(state.fen).toBe(START_FEN);
    expect(state.history).toEqual([]);
    expect(state.playerColor).toBe('b');
    expect(state.orientation).toBe('black');
  });

  test('setEngineLevel clamps to 1..8', () => {
    useGameStore.getState().setEngineLevel(12);
    expect(useGameStore.getState().engineLevel).toBe(8);
    useGameStore.getState().setEngineLevel(0);
    expect(useGameStore.getState().engineLevel).toBe(1);
  });
});
