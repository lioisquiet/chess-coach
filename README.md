# Chess Coach

A browser chess trainer that teaches while you play. Live at
**https://lioisquiet.github.io/chess-coach/**.

Two modes:

- **Play & Coach** — a live game against Stockfish with a coach that stays quiet by
  default and, only when you ask, reveals the top candidate moves and lets you step
  through each line one move at a time to learn the *idea*, not just the move.
- **Learn Openings** — pick an opening and drill its main line move by move; the trainer
  plays the other side from theory and flags the moment you leave the book.

Everything runs in the browser. No server, no API keys, no cost.

## Features

- **On-demand coach** — MultiPV candidate moves with evals, each expandable into a
  walk-through line on a preview board (Play & Coach mode).
- **Eval bar** — a live win/lose bar beside the board driven by a background analyzer.
- **Move-quality feedback** — every move graded (best / inaccuracy / mistake / blunder)
  in the move list, with a one-line verdict ("Stronger was e4.").
- **Opening naming** — names your opening from a bundled, offline ECO dataset
  (e.g. "B20 Sicilian Defense").
- **Post-game review** — accuracy % for each side, an advantage-over-time graph, and the
  game's turning points.
- **Opening trainer** — 12 curated openings with legal, tested main lines.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173/chess-coach/
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Regenerate opening data, type-check, and build for production |
| `npm run build:openings` | Rebuild `src/data/openings.json` from the ECO TSVs |
| `npm run preview` | Preview the production build |
| `npm test` | Run the unit test suite (Vitest) |
| `npm run lint` | Lint with oxlint |

## How it works

- **Rules & legality:** [`chess.js`](https://github.com/jhlywa/chess.js) for move
  generation, SAN/FEN, and game-end detection.
- **Board UI:** [`react-chessboard`](https://github.com/Clariity/react-chessboard) with
  click-to-move and drag-to-move.
- **Engine:** Stockfish 18 (single-threaded lite WASM) in three Web Workers:
  - *opponent* — strength-limited, replies on its turn;
  - *coach* — full strength, `MultiPV 5`, only when you ask for hints;
  - *analyzer* — evaluates every position for the eval bar, move quality, and review.
  Separate workers keep hint/analysis quality independent of the difficulty you play at,
  and none of it ever touches your actual game. The single-threaded build needs no
  COOP/COEP headers, so it works on a static host like GitHub Pages.
- **Opening data:** the lichess `chess-openings` TSVs are replayed at build time into a
  position→name map (`scripts/build-openings.mjs`), lazy-loaded as its own chunk.
- **State:** Zustand stores — `gameStore`, `coachStore`, `analysisStore`, `trainerStore`.

## Project layout

```
src/
├── components/
│   ├── game/     GameBoard, EvalBar, GameControls, MoveList, MoveVerdict, OpeningStrip
│   ├── coach/    CoachPanel, CandidateMove, LineStepper, PreviewBoard
│   ├── review/   ReviewPanel
│   └── trainer/  TrainerView, TrainerBoard
├── hooks/        useEngine (3 workers), useContainerWidth
├── lib/          engine/ (uciParser, engineWorkerClient), chessUtils, candidates,
│                 winProbability, moveQuality, accuracy, openings
├── data/         openings.json (generated), trainerOpenings.ts
├── store/        gameStore, coachStore, analysisStore, trainerStore
└── styles/       tokens.css, global.css
scripts/          build-openings.mjs        data/eco/*.tsv (vendored lichess ECO)
public/engine/    Stockfish WASM + JS glue
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to
GitHub Pages. Vite's `base` is set to `/chess-coach/`.

## Testing

85 Vitest unit tests cover the pure logic: UCI parsing, PV-to-SAN conversion, candidate
ranking, win-probability and accuracy math, move-quality classification, opening lookup
(including a real-data Italian Game check), and all four stores. Run with `npm test`.

## Notes

- An online "masters explorer" was scoped but dropped: lichess's explorer API now returns
  401 (requires an auth token that can't be embedded in a public static site). Opening
  *naming* works fully offline from the bundled dataset.
