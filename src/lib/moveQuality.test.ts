import { describe, expect, test } from 'vitest';
import { classifyMove, scoreToScalar } from './moveQuality';

describe('scoreToScalar', () => {
  test('passes centipawn values through', () => {
    expect(scoreToScalar({ type: 'cp', value: 42 })).toBe(42);
  });

  test('ranks mate above any centipawn value, sooner mate higher', () => {
    expect(scoreToScalar({ type: 'mate', value: 1 })).toBeGreaterThan(
      scoreToScalar({ type: 'mate', value: 5 }),
    );
    expect(scoreToScalar({ type: 'mate', value: 5 })).toBeGreaterThan(
      scoreToScalar({ type: 'cp', value: 2000 }),
    );
    expect(scoreToScalar({ type: 'mate', value: -1 })).toBeLessThan(
      scoreToScalar({ type: 'cp', value: -2000 }),
    );
  });
});

describe('classifyMove', () => {
  test('a move that holds the eval is best', () => {
    expect(classifyMove(30, 28, 'w').label).toBe('best');
  });

  test('grades White losing evaluation', () => {
    expect(classifyMove(30, -40, 'w').label).toBe('inaccuracy'); // 70 lost
    expect(classifyMove(30, -120, 'w').label).toBe('mistake'); // 150 lost
    expect(classifyMove(30, -400, 'w').label).toBe('blunder'); // 430 lost
  });

  test('is symmetric for Black (a rising White eval means Black erred)', () => {
    const q = classifyMove(-30, 200, 'b'); // Black to blame: 230 lost from Black POV
    expect(q.cpLoss).toBe(230);
    expect(q.label).toBe('mistake');
  });

  test('never reports negative loss when the mover improved', () => {
    expect(classifyMove(0, 300, 'w').cpLoss).toBe(0);
    expect(classifyMove(0, 300, 'w').label).toBe('best');
  });

  test('throwing away a forced mate is a blunder', () => {
    const prev = scoreToScalar({ type: 'mate', value: 2 });
    const next = scoreToScalar({ type: 'cp', value: 50 });
    expect(classifyMove(prev, next, 'w').label).toBe('blunder');
  });
});
