import { describe, expect, test } from 'vitest';
import { parseBestMove, parseInfoLine } from './uciParser';

describe('parseInfoLine', () => {
  test('parses a multipv info line with cp score', () => {
    const line =
      'info depth 18 seldepth 26 multipv 2 score cp 34 nodes 1520000 nps 800000 time 1900 pv e2e4 e7e5 g1f3 b8c6';

    const info = parseInfoLine(line);

    expect(info).toEqual({
      multipv: 2,
      depth: 18,
      score: { type: 'cp', value: 34 },
      pv: ['e2e4', 'e7e5', 'g1f3', 'b8c6'],
    });
  });

  test('defaults multipv to 1 when absent', () => {
    const info = parseInfoLine('info depth 12 score cp -15 nodes 5000 pv d2d4');

    expect(info?.multipv).toBe(1);
    expect(info?.score).toEqual({ type: 'cp', value: -15 });
  });

  test('parses mate scores', () => {
    const info = parseInfoLine('info depth 24 multipv 1 score mate 3 pv f3f7 e8f7 d1h5');

    expect(info?.score).toEqual({ type: 'mate', value: 3 });
  });

  test('parses negative mate scores (side to move gets mated)', () => {
    const info = parseInfoLine('info depth 20 multipv 1 score mate -2 pv g8f6 h5f7');

    expect(info?.score).toEqual({ type: 'mate', value: -2 });
  });

  test('includes promotion moves in pv', () => {
    const info = parseInfoLine('info depth 10 score cp 900 pv a7a8q d8a8');

    expect(info?.pv).toEqual(['a7a8q', 'd8a8']);
  });

  test('returns null for info lines without a pv', () => {
    expect(parseInfoLine('info depth 5 currmove e2e4 currmovenumber 1')).toBeNull();
    expect(parseInfoLine('info depth 5 score cp 10 nodes 100')).toBeNull();
  });

  test('returns null for info string lines', () => {
    expect(parseInfoLine('info string NNUE evaluation using nn-abc.nnue')).toBeNull();
  });

  test('returns null for non-info lines', () => {
    expect(parseInfoLine('bestmove e2e4 ponder e7e5')).toBeNull();
    expect(parseInfoLine('readyok')).toBeNull();
  });
});

describe('parseBestMove', () => {
  test('extracts the best move', () => {
    expect(parseBestMove('bestmove e2e4 ponder e7e5')).toBe('e2e4');
    expect(parseBestMove('bestmove a7a8q')).toBe('a7a8q');
  });

  test('returns null when there is no legal move', () => {
    expect(parseBestMove('bestmove (none)')).toBeNull();
  });

  test('returns null for non-bestmove lines', () => {
    expect(parseBestMove('info depth 10 score cp 0 pv e2e4')).toBeNull();
  });
});
