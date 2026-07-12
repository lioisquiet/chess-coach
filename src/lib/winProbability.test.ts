import { describe, expect, test } from 'vitest';
import { cpToWinProb, scoreToWhiteShare } from './winProbability';

describe('cpToWinProb', () => {
  test('is 0.5 at an even position', () => {
    expect(cpToWinProb(0)).toBeCloseTo(0.5, 5);
  });

  test('rises above 0.5 when White is better and falls below when worse', () => {
    expect(cpToWinProb(300)).toBeGreaterThan(0.7);
    expect(cpToWinProb(-300)).toBeLessThan(0.3);
  });

  test('is symmetric around zero', () => {
    expect(cpToWinProb(200) + cpToWinProb(-200)).toBeCloseTo(1, 5);
  });
});

describe('scoreToWhiteShare', () => {
  test('pegs the bar for mate scores', () => {
    expect(scoreToWhiteShare({ type: 'mate', value: 3 })).toBe(1);
    expect(scoreToWhiteShare({ type: 'mate', value: -2 })).toBe(0);
  });

  test('uses the win curve for centipawn scores', () => {
    expect(scoreToWhiteShare({ type: 'cp', value: 0 })).toBeCloseTo(0.5, 5);
  });
});
