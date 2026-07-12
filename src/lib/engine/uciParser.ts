export interface EngineScore {
  type: 'cp' | 'mate';
  value: number;
}

export interface PvInfo {
  multipv: number;
  depth: number;
  score: EngineScore;
  pv: string[];
}

const UCI_MOVE_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

const isUciMove = (token: string): boolean => UCI_MOVE_PATTERN.test(token);

/**
 * Parses a UCI `info` line into structured principal-variation data.
 * Returns null for lines that carry no usable pv (info string, currmove ticks, …).
 */
export function parseInfoLine(line: string): PvInfo | null {
  if (!line.startsWith('info ')) return null;

  const tokens = line.trim().split(/\s+/);
  if (tokens.includes('string')) return null;

  let depth: number | null = null;
  let multipv = 1;
  let score: EngineScore | null = null;
  let pv: string[] | null = null;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === 'depth') {
      depth = Number(tokens[i + 1]);
      i += 1;
    } else if (token === 'multipv') {
      multipv = Number(tokens[i + 1]);
      i += 1;
    } else if (token === 'score') {
      const kind = tokens[i + 1];
      const value = Number(tokens[i + 2]);
      if ((kind === 'cp' || kind === 'mate') && Number.isFinite(value)) {
        score = { type: kind, value };
      }
      i += 2;
    } else if (token === 'pv') {
      pv = tokens.slice(i + 1).filter(isUciMove);
      break;
    }
  }

  if (depth === null || !Number.isFinite(depth) || score === null || !pv || pv.length === 0) {
    return null;
  }

  return { multipv, depth, score, pv };
}

/** Extracts the move from a `bestmove …` line; null if none exists. */
export function parseBestMove(line: string): string | null {
  const match = line.match(/^bestmove\s+(\S+)/);
  if (!match || match[1] === '(none)') return null;
  return match[1];
}
