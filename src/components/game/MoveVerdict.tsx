import { QUALITY_META } from '../../lib/moveQuality';
import { useAnalysisStore } from '../../store/analysisStore';
import { useGameStore } from '../../store/gameStore';

const moverOf = (ply: number): 'w' | 'b' => (ply % 2 === 1 ? 'w' : 'b');

/** One-line coaching note on the player's most recent move. */
export function MoveVerdict() {
  const playerColor = useGameStore((s) => s.playerColor);
  const currentPly = useAnalysisStore((s) => s.currentPly);
  const quality = useAnalysisStore((s) => s.quality);

  // Find the player's latest graded move.
  let ply: number | null = null;
  for (let p = currentPly; p >= 1; p -= 1) {
    if (moverOf(p) === playerColor && quality[p]) {
      ply = p;
      break;
    }
  }

  const verdict = ply ? quality[ply] : null;
  if (!verdict) return null;

  const meta = QUALITY_META[verdict.label];
  const praised = verdict.label === 'best' || verdict.label === 'good';
  const showBest =
    !praised && verdict.bestBeforeSan && verdict.bestBeforeSan !== undefined;

  return (
    <div className={`verdict verdict--${meta.tone}`} role="status" aria-live="polite">
      <span className="verdict__label">
        {meta.glyph && <span className="verdict__glyph">{meta.glyph}</span>}
        {meta.text}
      </span>
      <span className="verdict__detail">
        {praised
          ? 'Nicely played.'
          : showBest
            ? `Stronger was ${verdict.bestBeforeSan}.`
            : 'That gave something back.'}
      </span>
    </div>
  );
}
