import { Chess } from 'chess.js';
import { describe, expect, test } from 'vitest';
import { toCandidates } from './candidates';
import type { PvInfo } from './engine/uciParser';

const START_FEN = new Chess().fen();

const info = (overrides: Partial<PvInfo>): PvInfo => ({
  multipv: 1,
  depth: 18,
  score: { type: 'cp', value: 30 },
  pv: ['e2e4'],
  ...overrides,
});

describe('toCandidates', () => {
  test('orders candidates by rank and converts first move to SAN', () => {
    const candidates = toCandidates(START_FEN, [
      info({ multipv: 2, pv: ['d2d4', 'd7d5'] }),
      info({ multipv: 1, pv: ['e2e4', 'e7e5', 'g1f3'] }),
    ]);

    expect(candidates.map((c) => c.rank)).toEqual([1, 2]);
    expect(candidates[0].san).toBe('e4');
    expect(candidates[0].steps.map((s) => s.san)).toEqual(['e4', 'e5', 'Nf3']);
    expect(candidates[1].san).toBe('d4');
  });

  test('normalizes score to white pov when black is to move', () => {
    const afterE4 = new Chess();
    afterE4.move('e4');

    const candidates = toCandidates(afterE4.fen(), [
      info({ pv: ['e7e5'], score: { type: 'cp', value: 25 } }),
    ]);

    expect(candidates[0].scoreWhitePov).toEqual({ type: 'cp', value: -25 });
  });

  test('drops candidates whose pv is illegal from the position', () => {
    const candidates = toCandidates(START_FEN, [info({ pv: ['e7e5'] })]);

    expect(candidates).toEqual([]);
  });
});
