import { Chess } from 'chess.js';
import { useCoachStore } from '../../store/coachStore';
import { useGameStore } from '../../store/gameStore';
import { CandidateMove } from './CandidateMove';

interface CoachPanelProps {
  onRequestHints: (fen: string) => void;
  onStopHints: () => void;
}

export function CoachPanel({ onRequestHints, onStopHints }: CoachPanelProps) {
  const fen = useGameStore((s) => s.fen);
  const playerColor = useGameStore((s) => s.playerColor);
  const gameOverText = useGameStore((s) => s.gameOverText);
  const isEngineThinking = useGameStore((s) => s.isEngineThinking);

  const status = useCoachStore((s) => s.status);
  const candidates = useCoachStore((s) => s.candidates);
  const clear = useCoachStore((s) => s.clear);

  const chess = new Chess(fen);
  const playerToMove = chess.turn() === playerColor;
  const canAskForHints = playerToMove && !gameOverText && !isEngineThinking;

  const handleShowHints = () => onRequestHints(fen);
  const handleHide = () => {
    onStopHints();
    clear();
  };

  return (
    <section className="coach" aria-label="Coach">
      <header className="coach__head">
        <h2 className="coach__title">Coach</h2>
        {status !== 'quiet' && (
          <button type="button" className="btn btn--sm btn--ghost" onClick={handleHide}>
            Hide hints
          </button>
        )}
      </header>

      {status === 'quiet' && (
        <div className="coach__quiet">
          <p className="coach__prompt">
            {canAskForHints
              ? 'Your move. Think it through first — ask when you want a nudge.'
              : gameOverText
                ? 'Game over. Start a new game to keep training.'
                : 'Waiting for the position to settle…'}
          </p>
          <button
            type="button"
            className="btn btn--primary btn--hint"
            onClick={handleShowHints}
            disabled={!canAskForHints}
          >
            💡 Show hints
          </button>
        </div>
      )}

      {status === 'analyzing' && candidates.length === 0 && (
        <p className="coach__thinking">Studying the position…</p>
      )}

      {status !== 'quiet' && candidates.length > 0 && (
        <>
          <p className="coach__hint-caption">
            Top moves here. Expand one and press <strong>Next →</strong> to see the idea
            play out.
          </p>
          <ol className="candidate-list">
            {candidates.map((candidate) => (
              <CandidateMove key={candidate.rank} candidate={candidate} />
            ))}
          </ol>
          {status === 'analyzing' && (
            <p className="coach__depth-note">Refining…</p>
          )}
        </>
      )}
    </section>
  );
}
