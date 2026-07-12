import { Chess } from 'chess.js';
import { describe, expect, test } from 'vitest';
import { TRAINER_OPENINGS } from './trainerOpenings';

describe('trainer openings data', () => {
  test.each(TRAINER_OPENINGS)('$name has a fully legal mainline', (opening) => {
    const chess = new Chess();
    expect(() => {
      for (const san of opening.line) chess.move(san);
    }).not.toThrow();
    expect(opening.line.length).toBeGreaterThanOrEqual(6);
  });

  test('every opening has a unique id', () => {
    const ids = TRAINER_OPENINGS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("the learner's first move exists in every line", () => {
    for (const opening of TRAINER_OPENINGS) {
      const firstLearnerPly = opening.learnerColor === 'w' ? 0 : 1;
      expect(opening.line[firstLearnerPly]).toBeTruthy();
    }
  });
});
