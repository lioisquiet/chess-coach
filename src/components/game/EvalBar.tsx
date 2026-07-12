import { formatEval } from '../../lib/chessUtils';
import { scoreToWhiteShare } from '../../lib/winProbability';
import { useAnalysisStore } from '../../store/analysisStore';
import { useGameStore } from '../../store/gameStore';

/**
 * Vertical win/lose bar beside the board. The light fill grows toward White's
 * side of the board (bottom when unflipped, top when flipped) in proportion to
 * White's win probability. A numeric readout sits at White's end.
 */
export function EvalBar() {
  const entry = useAnalysisStore((s) => s.entries[s.currentPly]);
  const orientation = useGameStore((s) => s.orientation);

  const score = entry?.score ?? null;
  const share = score ? scoreToWhiteShare(score) : 0.5;
  const whiteAtBottom = orientation === 'white';
  const label = score ? formatEval(score) : '·';

  return (
    <div
      className={`eval-bar${whiteAtBottom ? '' : ' eval-bar--flipped'}`}
      role="img"
      aria-label={score ? `Evaluation ${label} for White` : 'Evaluation pending'}
    >
      <div className="eval-bar__white" style={{ height: `${share * 100}%` }} />
      <span className="eval-bar__value">{label}</span>
    </div>
  );
}
