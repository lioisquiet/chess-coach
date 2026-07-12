# Chess Coach

A two-pane chess trainer that teaches while you play. The left pane is a live game
against Stockfish; the right pane is a **coach** that stays quiet by default and — only
when you ask — reveals the top candidate moves for the current position. Expand any
candidate and step through its line one move at a time with **Next →** to learn the idea
behind the move, not just the move itself.

Everything runs in the browser. No server, no API keys, no cost.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the unit test suite (Vitest) |
| `npm run lint` | Lint with oxlint |

## How it works

- **Rules & legality:** [`chess.js`](https://github.com/jhlywa/chess.js) generates legal moves and detects game end.
- **Board UI:** [`react-chessboard`](https://github.com/Clariity/react-chessboard) with click-to-move and drag-to-move.
- **Engine:** Stockfish 18 (single-threaded lite WASM build) runs in Web Workers.
  Two workers are used: a strength-limited **opponent** and a full-strength **coach**
  running `MultiPV 5` for candidate moves. Keeping them separate means hint quality is
  independent of the difficulty you're playing against, and the coach's analysis never
  touches your actual game.
- **State:** Two Zustand stores — `gameStore` (the game) and `coachStore` (hints + stepper).

## Project layout

```
src/
├── components/
│   ├── game/     GameBoard, GameControls, MoveList
│   └── coach/    CoachPanel, CandidateMove, LineStepper, PreviewBoard
├── hooks/        useEngine (worker lifecycle), useContainerWidth
├── lib/
│   ├── engine/   uciParser, engineWorkerClient
│   ├── chessUtils.ts, candidates.ts
├── store/        gameStore, coachStore
└── styles/       tokens.css, global.css
public/engine/    Stockfish WASM + JS glue
```

## Testing

Unit tests cover the pure logic that powers the coach: the UCI parser, PV-to-SAN
conversion, candidate ranking, eval formatting, and both stores (including hint
auto-clearing and stepper bounds). Run them with `npm test`.
