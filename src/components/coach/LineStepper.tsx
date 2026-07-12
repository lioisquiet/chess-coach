import { uciToMove } from '../../lib/chessUtils';
import type { Candidate } from '../../lib/candidates';
import { useCoachStore } from '../../store/coachStore';
import { useGameStore } from '../../store/gameStore';
import { PreviewBoard } from './PreviewBoard';

interface LineStepperProps {
  candidate: Candidate;
}

/**
 * Walks a candidate's principal variation one ply at a time on a preview board.
 * stepIdx 0 = position before the move; stepIdx k = after k plies of the line.
 */
export function LineStepper({ candidate }: LineStepperProps) {
  const baseFen = useCoachStore((s) => s.forFen);
  const stepIdx = useCoachStore((s) => s.stepIdx);
  const nextStep = useCoachStore((s) => s.nextStep);
  const prevStep = useCoachStore((s) => s.prevStep);
  const resetStep = useCoachStore((s) => s.resetStep);
  const orientation = useGameStore((s) => s.orientation);

  const { steps } = candidate;
  const clampedIdx = Math.min(stepIdx, steps.length);
  const currentFen = clampedIdx === 0 ? baseFen ?? '' : steps[clampedIdx - 1].fenAfter;
  const currentUci = clampedIdx === 0 ? undefined : steps[clampedIdx - 1].uci;
  const lastMove = currentUci ? uciToMove(currentUci) : undefined;

  const atEnd = clampedIdx >= steps.length;
  const atStart = clampedIdx <= 0;

  return (
    <div className="line-stepper">
      <PreviewBoard fen={currentFen} orientation={orientation} lastMove={lastMove} />

      <div className="line-stepper__moves" aria-label="Line moves">
        {steps.map((step, i) => (
          <span
            key={`${step.uci}-${i}`}
            className={`line-stepper__move${i + 1 === clampedIdx ? ' is-current' : ''}${
              i + 1 <= clampedIdx ? ' is-played' : ''
            }`}
          >
            {step.san}
          </span>
        ))}
      </div>

      <div className="line-stepper__status">
        {clampedIdx === 0
          ? 'Starting position'
          : `Move ${clampedIdx} of ${steps.length}${atEnd ? ' — end of line' : ''}`}
      </div>

      <div className="line-stepper__controls">
        <button type="button" className="btn btn--sm" onClick={prevStep} disabled={atStart}>
          ← Prev
        </button>
        <button type="button" className="btn btn--sm" onClick={resetStep} disabled={atStart}>
          ↺ Reset
        </button>
        <button
          type="button"
          className="btn btn--sm btn--primary"
          onClick={nextStep}
          disabled={atEnd}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
