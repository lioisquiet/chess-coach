import { useState } from 'react';
import { CoachPanel } from './components/coach/CoachPanel';
import { EvalBar } from './components/game/EvalBar';
import { GameBoard } from './components/game/GameBoard';
import { GameControls } from './components/game/GameControls';
import { MoveList } from './components/game/MoveList';
import { MoveVerdict } from './components/game/MoveVerdict';
import { OpeningStrip } from './components/game/OpeningStrip';
import { ReviewPanel } from './components/review/ReviewPanel';
import { TrainerView } from './components/trainer/TrainerView';
import { useEngine } from './hooks/useEngine';
import { useGameStore } from './store/gameStore';
import './App.css';

type Mode = 'play' | 'learn';

export default function App() {
  const { requestHints, stopHints } = useEngine();
  const playerColor = useGameStore((s) => s.playerColor);
  const gameOverText = useGameStore((s) => s.gameOverText);
  const isEngineThinking = useGameStore((s) => s.isEngineThinking);
  const [mode, setMode] = useState<Mode>('play');

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
        <nav className="mode-switch" aria-label="Mode">
          <button
            type="button"
            className={`mode-switch__btn${mode === 'play' ? ' is-active' : ''}`}
            aria-pressed={mode === 'play'}
            onClick={() => setMode('play')}
          >
            Play &amp; Coach
          </button>
          <button
            type="button"
            className={`mode-switch__btn${mode === 'learn' ? ' is-active' : ''}`}
            aria-pressed={mode === 'learn'}
            onClick={() => setMode('learn')}
          >
            Learn Openings
          </button>
        </nav>
      </header>

      {mode === 'learn' ? (
        <main className="app__single">
          <TrainerView />
        </main>
      ) : (
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

            <OpeningStrip />

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
            {gameOverText ? (
              <ReviewPanel />
            ) : (
              <CoachPanel onRequestHints={requestHints} onStopHints={stopHints} />
            )}
          </aside>
        </main>
      )}
    </div>
  );
}
