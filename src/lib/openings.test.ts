import { Chess } from 'chess.js';
import { describe, expect, test } from 'vitest';
import { classifyOpening, positionKey, type OpeningInfo } from './openings';
import openings from '../data/openings.json';

const START_FEN = new Chess().fen();

function fensFor(sans: string[]): string[] {
  const chess = new Chess();
  const fens = [chess.fen()];
  for (const san of sans) {
    chess.move(san);
    fens.push(chess.fen());
  }
  return fens;
}

describe('positionKey', () => {
  test('drops the move counters so transpositions match', () => {
    expect(positionKey('rnbq1rk1/pp2ppbp/6p1/8/8/8/PPPP1PPP/R1BQ1RK1 w - - 5 9')).toBe(
      'rnbq1rk1/pp2ppbp/6p1/8/8/8/PPPP1PPP/R1BQ1RK1 w - -',
    );
  });
});

describe('classifyOpening', () => {
  const map: Record<string, OpeningInfo> = {
    [positionKey(fensFor(['e4'])[1])]: { eco: 'B00', name: "King's Pawn" },
    [positionKey(fensFor(['e4', 'e5', 'Nf3'])[3])]: { eco: 'C40', name: "King's Knight" },
  };

  test('returns the deepest recognized opening along the line', () => {
    const info = classifyOpening(map, fensFor(['e4', 'e5', 'Nf3']));
    expect(info?.name).toBe("King's Knight");
  });

  test('falls back to an earlier match once play leaves book', () => {
    const info = classifyOpening(map, fensFor(['e4', 'e5', 'Nf3', 'a6', 'a4']));
    expect(info?.name).toBe("King's Knight");
  });

  test('returns null when no position is a known opening', () => {
    expect(classifyOpening(map, [START_FEN])).toBeNull();
  });
});

describe('bundled opening data', () => {
  test('names the Italian Game', () => {
    const info = classifyOpening(
      openings as Record<string, OpeningInfo>,
      fensFor(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']),
    );
    expect(info?.name).toBe('Italian Game');
    expect(info?.eco).toBe('C50');
  });
});
