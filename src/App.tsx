import { CoachPanel } from './components/coach/CoachPanel';
import { EvalBar } from './components/game/EvalBar';
import { GameBoard } from './components/game/GameBoard';
import { GameControls } from './components/game/GameControls';
import { MoveList } from './components/game/MoveList';
import { MoveVerdict } from './components/game/MoveVerdict';
import { useEngine } from './hooks/useEngine';
import { useGameStore } from './store/gameStore';
import './App.css';

export default function App() {
  const { requestHints, stopHints } = useEngine();
  const playerColor = useGameStore((s) => s.playerColor);
  const gameOverText = useGameStore((s) => s.gameOverText);
  const isEngineThinking = useGameStore((s) => s.isEngineThinking);

  const turnLabel = gameOverText
    ? gameOverText
    : isEngineThinking
      ? 'Engine is thinking…'
      : 'Your move';

  return (
    <div className="app">
      <header className="app__masthead">
        <div>
          <p className="app__eyebrow">Play &amp; learn</p>
          <h1 className="app__title">Chess Coach</h1>
        </div>
        <p className="app__tagline">
          A quiet board and a coach that speaks only when you ask.
        </p>
      </header>

      <main className="app__panes">
        <section className="pane pane--play" aria-label="Game">
          <div className="pane__head">
            <h2 className="pane__title">Play</h2>
            <span
              className={`turn-pill${gameOverText ? ' turn-pill--over' : ''}${
                isEngineThinking ? ' turn-pill--thinking' : ''
              }`}
            >
              {turnLabel}
            </span>
          </div>

          <div className="board-row">
            <EvalBar />
            <GameBoard />
          </div>

          <MoveVerdict />

          <div className="pane__sides">
            <span className="side side--you">
              You · {playerColor === 'w' ? 'White' : 'Black'}
            </span>
            <span className="side side--engine">Engine</span>
          </div>

          <GameControls />
          <MoveList />
        </section>

        <aside className="pane pane--coach" aria-label="Coach panel">
          <CoachPanel onRequestHints={requestHints} onStopHints={stopHints} />
        </aside>
      </main>
    </div>
  );
}
