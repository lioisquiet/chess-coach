export interface OpeningInfo {
  eco: string;
  name: string;
}

type OpeningMap = Record<string, OpeningInfo>;

let cache: OpeningMap | null = null;
let loading: Promise<OpeningMap> | null = null;

/** Lazy-loads the (~500KB) opening map as its own chunk, cached after first use. */
export function loadOpenings(): Promise<OpeningMap> {
  if (cache) return Promise.resolve(cache);
  if (!loading) {
    loading = import('../data/openings.json').then((mod) => {
      cache = mod.default as OpeningMap;
      return cache;
    });
  }
  return loading;
}

/** First four FEN fields — placement, side, castling, en passant. */
export function positionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

/**
 * Classifies a game by the deepest named opening it has passed through: walks
 * the played positions from most recent back to the start, returning the first
 * that the book recognizes. Null if the line never entered a known opening.
 */
export function classifyOpening(map: OpeningMap, fens: string[]): OpeningInfo | null {
  for (let i = fens.length - 1; i >= 0; i -= 1) {
    const info = map[positionKey(fens[i])];
    if (info) return info;
  }
  return null;
}
