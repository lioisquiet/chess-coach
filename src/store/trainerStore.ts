import { Chess } from 'chess.js';
import { create } from 'zustand';
import { OPENINGS_BY_ID, type TrainerOpening } from '../data/trainerOpenings';

export type TrainerStatus = 'idle' | 'active' | 'complete';

export interface TrainerFeedback {
  type: 'correct' | 'wrong' | 'done';
  text: string;
}

interface TrainerState {
  opening: TrainerOpening | null;
  fen: string;
  lineIndex: number; // plies of the mainline completed
  status: TrainerStatus;
  feedback: TrainerFeedback | null;
  select: (openingId: string) => void;
  attemptMove: (from: string, to: string, promotion?: string) => boolean;
  restart: () => void;
  exit: () => void;
}

const START_FEN = new Chess().fen();

/** Replays the opening line up to `plies` and returns the resulting position. */
function positionAt(opening: TrainerOpening, plies: number): Chess {
  const chess = new Chess();
  for (let i = 0; i < plies; i += 1) chess.move(opening.line[i]);
  return chess;
}

/** Advances past any immediate opponent book moves so it becomes the learner's turn. */
function autoPlayOpponent(opening: TrainerOpening, fromIndex: number): number {
  let index = fromIndex;
  const chess = positionAt(opening, index);
  while (index < opening.line.length && chess.turn() !== opening.learnerColor) {
    chess.move(opening.line[index]);
    index += 1;
  }
  return index;
}

function begin(opening: TrainerOpening) {
  const lineIndex = autoPlayOpponent(opening, 0);
  return {
    opening,
    fen: positionAt(opening, lineIndex).fen(),
    lineIndex,
    status: 'active' as TrainerStatus,
    feedback: null,
  };
}

export const useTrainerStore = create<TrainerState>((set, get) => ({
  opening: null,
  fen: START_FEN,
  lineIndex: 0,
  status: 'idle',
  feedback: null,

  select: (openingId) => {
    const opening = OPENINGS_BY_ID.get(openingId);
    if (opening) set(begin(opening));
  },

  attemptMove: (from, to, promotion) => {
    const state = get();
    const { opening, lineIndex } = state;
    if (!opening || state.status !== 'active') return false;

    const expectedSan = opening.line[lineIndex];
    const chess = positionAt(opening, lineIndex);

    let expected;
    try {
      expected = chess.move(expectedSan);
    } catch {
      return false;
    }

    const isExpected =
      expected.from === from &&
      expected.to === to &&
      (!expected.promotion || expected.promotion === (promotion ?? 'q'));

    if (!isExpected) {
      set({
        feedback: { type: 'wrong', text: `Not the main line — the move here is ${expectedSan}.` },
      });
      return false;
    }

    // Learner's move is correct; auto-play the opponent's book reply if any.
    const afterLearner = lineIndex + 1;
    const nextIndex = autoPlayOpponent(opening, afterLearner);
    const done = nextIndex >= opening.line.length;

    set({
      fen: positionAt(opening, nextIndex).fen(),
      lineIndex: nextIndex,
      status: done ? 'complete' : 'active',
      feedback: done
        ? { type: 'done', text: `Complete — you played the ${opening.name} main line.` }
        : { type: 'correct', text: `${expectedSan} — correct.` },
    });
    return true;
  },

  restart: () => {
    const { opening } = get();
    if (opening) set(begin(opening));
  },

  exit: () => set({ opening: null, fen: START_FEN, lineIndex: 0, status: 'idle', feedback: null }),
}));
