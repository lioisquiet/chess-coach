import { useGameStore, type PlayerColor } from '../../store/gameStore';
import { useCoachStore } from '../../store/coachStore';

const MAX_LEVEL = 8;

export function GameControls() {
  const playerColor = useGameStore((s) => s.playerColor);
  const engineLevel = useGameStore((s) => s.engineLevel);
  const historyLength = useGameStore((s) => s.history.length);
  const isEngineThinking = useGameStore((s) => s.isEngineThinking);
  const newGame = useGameStore((s) => s.newGame);
  const undo = useGameStore((s) => s.undo);
  const flip = useGameStore((s) => s.flip);
  const setEngineLevel = useGameStore((s) => s.setEngineLevel);
  const clearHints = useCoachStore((s) => s.clear);

  const startGame = (color: PlayerColor) => {
    newGame(color);
    clearHints();
  };

  const handleUndo = () => {
    undo();
    clearHints();
  };

  return (
    <div className="game-controls">
      <div className="game-controls__row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => startGame(playerColor)}
        >
          New game
        </button>
        <button
          type="button"
          className="btn"
          onClick={handleUndo}
          disabled={historyLength === 0 || isEngineThinking}
        >
          Undo
        </button>
        <button type="button" className="btn" onClick={flip}>
          Flip
        </button>
      </div>

      <div className="game-controls__row game-controls__row--split">
        <span className="game-controls__label">Play as</span>
        <div className="segmented" role="group" aria-label="Choose your color">
          <button
            type="button"
            className={`segmented__btn${playerColor === 'w' ? ' is-active' : ''}`}
            aria-pressed={playerColor === 'w'}
            onClick={() => startGame('w')}
          >
            White
          </button>
          <button
            type="button"
            className={`segmented__btn${playerColor === 'b' ? ' is-active' : ''}`}
            aria-pressed={playerColor === 'b'}
            onClick={() => startGame('b')}
          >
            Black
          </button>
        </div>
      </div>

      <div className="game-controls__level">
        <label htmlFor="engine-level" className="game-controls__label">
          Engine strength
          <span className="game-controls__level-value">
            {engineLevel} / {MAX_LEVEL}
          </span>
        </label>
        <input
          id="engine-level"
          type="range"
          min={1}
          max={MAX_LEVEL}
          step={1}
          value={engineLevel}
          onChange={(e) => setEngineLevel(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
