import { Chess } from 'chess.js';
import { describe, expect, test } from 'vitest';
import { formatEval, normalizeToWhitePov, pvToSteps, uciToMove } from './chessUtils';

const START_FEN = new Chess().fen();

describe('uciToMove', () => {
  test('splits a plain move', () => {
    expect(uciToMove('e2e4')).toEqual({ from: 'e2', to: 'e4' });
  });

  test('includes promotion piece when present', () => {
    expect(uciToMove('a7a8q')).toEqual({ from: 'a7', to: 'a8', promotion: 'q' });
  });
});

describe('pvToSteps', () => {
  test('converts a legal pv into SAN steps with resulting fens', () => {
    const steps = pvToSteps(START_FEN, ['e2e4', 'e7e5', 'g1f3']);

    expect(steps.map((s) => s.san)).toEqual(['e4', 'e5', 'Nf3']);
    expect(steps[2].fenAfter.split(' ')[1]).toBe('b'); // black to move after Nf3
  });

  test('stops at the first illegal move without throwing', () => {
    const steps = pvToSteps(START_FEN, ['e2e4', 'e2e4']);

    expect(steps.map((s) => s.san)).toEqual(['e4']);
  });

  test('returns empty array when the first move is illegal', () => {
    expect(pvToSteps(START_FEN, ['e2e5'])).toEqual([]);
  });
});

describe('normalizeToWhitePov', () => {
  test('keeps score unchanged when white is to move', () => {
    expect(normalizeToWhitePov({ type: 'cp', value: 42 }, 'w')).toEqual({ type: 'cp', value: 42 });
  });

  test('negates score when black is to move', () => {
    expect(normalizeToWhitePov({ type: 'cp', value: 42 }, 'b')).toEqual({ type: 'cp', value: -42 });
    expect(normalizeToWhitePov({ type: 'mate', value: 2 }, 'b')).toEqual({ type: 'mate', value: -2 });
  });
});

describe('formatEval', () => {
  test('formats centipawn scores as signed pawn values', () => {
    expect(formatEval({ type: 'cp', value: 34 })).toBe('+0.3');
    expect(formatEval({ type: 'cp', value: -120 })).toBe('-1.2');
    expect(formatEval({ type: 'cp', value: 0 })).toBe('0.0');
  });

  test('renders near-zero negatives as plain 0.0, never -0.0', () => {
    expect(formatEval({ type: 'cp', value: -3 })).toBe('0.0');
    expect(formatEval({ type: 'cp', value: 4 })).toBe('0.0');
  });

  test('formats mate scores', () => {
    expect(formatEval({ type: 'mate', value: 3 })).toBe('#3');
    expect(formatEval({ type: 'mate', value: -2 })).toBe('#-2');
  });
});
