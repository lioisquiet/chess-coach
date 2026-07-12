import { describe, expect, test } from 'vitest';
import { computeAccuracy, moveAccuracy, whiteWinPercent, type ScoredPosition } from './accuracy';

const cp = (ply: number, value: number): ScoredPosition => ({ ply, score: { type: 'cp', value } });

describe('whiteWinPercent', () => {
  test('is 50 at an even position', () => {
    expect(whiteWinPercent({ type: 'cp', value: 0 })).toBeCloseTo(50, 4);
  });

  test('is 100/0 for mate for/against White', () => {
    expect(whiteWinPercent({ type: 'mate', value: 2 })).toBe(100);
    expect(whiteWinPercent({ type: 'mate', value: -2 })).toBe(0);
  });
});

describe('moveAccuracy', () => {
  test('a move that keeps the win % is ~100%', () => {
    expect(moveAccuracy(60, 60)).toBeGreaterThan(99);
  });

  test('a large win % drop scores low', () => {
    expect(moveAccuracy(70, 20)).toBeLessThan(20);
  });
});

describe('computeAccuracy', () => {
  test('perfect play by both sides yields high accuracy', () => {
    const result = computeAccuracy([cp(0, 0), cp(1, 0), cp(2, 0), cp(3, 0)]);
    expect(result.white).toBeGreaterThan(99);
    expect(result.black).toBeGreaterThan(99);
  });

  test('a White blunder drags only White accuracy down', () => {
    // ply1 = White move drops White from +0 to -500; ply2 = Black holds it.
    const result = computeAccuracy([cp(0, 0), cp(1, -500), cp(2, -500)]);
    expect(result.white).toBeLessThan(40);
    expect(result.black).toBeGreaterThan(90);
  });

  test('returns null for a side with no moves', () => {
    expect(computeAccuracy([cp(0, 0)])).toEqual({ white: null, black: null });
  });
});
