import { Chess } from 'chess.js';
import { create } from 'zustand';

export const START_FEN = new Chess().fen();

export interface HistoryEntry {
  san: string;
  fen: string;
}

export type PlayerColor = 'w' | 'b';

interface GameState {
  fen: string;
  history: HistoryEntry[];
  playerColor: PlayerColor;
  orientation: 'white' | 'black';
  engineLevel: number;
  gameOverText: string | null;
  isEngineThinking: boolean;
  makePlayerMove: (from: string, to: string, promotion?: string) => boolean;
  applyEngineMove: (uci: string) => void;
  setEngineThinking: (thinking: boolean) => void;
  newGame: (color: PlayerColor) => void;
  undo: () => void;
  flip: () => void;
  setEngineLevel: (level: number) => void;
}

/** Rebuilds a Chess instance from history so repetition/50-move state survives. */
function replay(history: HistoryEntry[]): Chess {
  const chess = new Chess();
  for (const entry of history) chess.move(entry.san);
  return chess;
}

function describeGameOver(chess: Chess): string | null {
  if (!chess.isGameOver()) return null;
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? 'Checkmate — Black wins' : 'Checkmate — White wins';
  }
  if (chess.isStalemate()) return 'Draw — stalemate';
  if (chess.isThreefoldRepetition()) return 'Draw — threefold repetition';
  if (chess.isInsufficientMaterial()) return 'Draw — insufficient material';
  return 'Draw — fifty-move rule';
}

export const useGameStore = create<GameState>((set, get) => ({
  fen: START_FEN,
  history: [],
  playerColor: 'w',
  orientation: 'white',
  engineLevel: 3,
  gameOverText: null,
  isEngineThinking: false,

  makePlayerMove: (from, to, promotion) => {
    const state = get();
    if (state.gameOverText || state.isEngineThinking) return false;

    const chess = replay(state.history);
    if (chess.turn() !== state.playerColor) return false;

    try {
      const move = chess.move({ from, to, promotion: promotion ?? 'q' });
      set({
        fen: chess.fen(),
        history: [...state.history, { san: move.san, fen: chess.fen() }],
        gameOverText: describeGameOver(chess),
      });
      return true;
    } catch {
      return false;
    }
  },

  applyEngineMove: (uci) => {
    const state = get();
    if (state.gameOverText) return;

    const chess = replay(state.history);
    if (chess.turn() === state.playerColor) return;

    try {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
      });
      set({
        fen: chess.fen(),
        history: [...state.history, { san: move.san, fen: chess.fen() }],
        gameOverText: describeGameOver(chess),
      });
    } catch {
      // Engine sent a move that is illegal for the current position (stale search) — ignore.
    }
  },

  setEngineThinking: (thinking) => set({ isEngineThinking: thinking }),

  newGame: (color) =>
    set({
      fen: START_FEN,
      history: [],
      playerColor: color,
      orientation: color === 'b' ? 'black' : 'white',
      gameOverText: null,
      isEngineThinking: false,
    }),

  undo: () => {
    const state = get();
    if (state.isEngineThinking || state.history.length === 0) return;

    let history = state.history.slice(0, -1);
    if (history.length > 0 && replay(history).turn() !== state.playerColor) {
      history = history.slice(0, -1);
    }

    const chess = replay(history);
    set({ history, fen: chess.fen(), gameOverText: describeGameOver(chess) });
  },

  flip: () =>
    set((state) => ({ orientation: state.orientation === 'white' ? 'black' : 'white' })),

  setEngineLevel: (level) => set({ engineLevel: Math.min(8, Math.max(1, Math.round(level))) }),
}));
