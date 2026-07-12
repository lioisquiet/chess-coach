export type LearnerColor = 'w' | 'b';

export interface TrainerOpening {
  id: string;
  name: string;
  eco: string;
  learnerColor: LearnerColor;
  idea: string;
  /** Mainline in SAN, starting from the initial position. */
  line: string[];
}

/**
 * Curated opening mainlines for drill practice. The learner plays `learnerColor`;
 * the trainer auto-plays the other side's book moves. Every line is validated
 * legal by trainerOpenings.test.ts.
 */
export const TRAINER_OPENINGS: TrainerOpening[] = [
  {
    id: 'italian',
    name: 'Italian Game',
    eco: 'C50',
    learnerColor: 'w',
    idea: 'Develop toward the center and eye the weak f7 square with the bishop on c4.',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'],
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy López',
    eco: 'C60',
    learnerColor: 'w',
    idea: 'Pressure the knight defending e5 and prepare to castle and build a big center.',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
  },
  {
    id: 'scotch',
    name: 'Scotch Game',
    eco: 'C45',
    learnerColor: 'w',
    idea: 'Strike in the center early with d4 to open lines for your pieces.',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Bb4'],
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    eco: 'D06',
    learnerColor: 'w',
    idea: 'Offer the c-pawn to pull Black off the center, then occupy it yourself.',
    line: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'],
  },
  {
    id: 'london',
    name: 'London System',
    eco: 'D02',
    learnerColor: 'w',
    idea: 'A solid setup: Bf4, e3, c3, Bd3 — the same plan against almost anything.',
    line: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'e6', 'e3', 'c5', 'c3', 'Nc6'],
  },
  {
    id: 'english',
    name: 'English Opening',
    eco: 'A20',
    learnerColor: 'w',
    idea: 'Flank the center with c4 and fianchetto for long-diagonal pressure.',
    line: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'd5', 'cxd5', 'Nxd5'],
  },
  {
    id: 'vienna',
    name: 'Vienna Game',
    eco: 'C25',
    learnerColor: 'w',
    idea: 'Develop the knight to c3 first, keeping the option of an f4 pawn storm.',
    line: ['e4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'exd5', 'Nxd5', 'Bg2', 'Nxc3'],
  },
  {
    id: 'sicilian',
    name: 'Sicilian Defense',
    eco: 'B50',
    learnerColor: 'b',
    idea: 'Fight for the center asymmetrically with the c-pawn and counterattack.',
    line: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
  },
  {
    id: 'french',
    name: 'French Defense',
    eco: 'C00',
    learnerColor: 'b',
    idea: 'Build a solid pawn chain and undermine White’s center with ...c5 later.',
    line: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7'],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    eco: 'B10',
    learnerColor: 'b',
    idea: 'A rock-solid defense that frees the light-squared bishop before ...e6.',
    line: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6'],
  },
  {
    id: 'kings-indian',
    name: "King's Indian Defense",
    eco: 'E60',
    learnerColor: 'b',
    idea: 'Cede the center, fianchetto, and counterpunch it later with ...e5 or ...c5.',
    line: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O'],
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defense',
    eco: 'B01',
    learnerColor: 'b',
    idea: 'Challenge e4 immediately; after ...Qxd5 tuck the queen safely on a5.',
    line: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6'],
  },
];

export const OPENINGS_BY_ID = new Map(TRAINER_OPENINGS.map((o) => [o.id, o]));
