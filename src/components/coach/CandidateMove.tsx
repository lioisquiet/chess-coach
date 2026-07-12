import type { Candidate } from '../../lib/candidates';
import { formatEval } from '../../lib/chessUtils';
import { useCoachStore } from '../../store/coachStore';
import { LineStepper } from './LineStepper';

interface CandidateMoveProps {
  candidate: Candidate;
}

function evalTone(value: number, isMate: boolean): string {
  if (isMate) return value >= 0 ? 'good' : 'bad';
  if (value > 60) return 'good';
  if (value < -60) return 'bad';
  return 'even';
}

export function CandidateMove({ candidate }: CandidateMoveProps) {
  const expandedRank = useCoachStore((s) => s.expandedRank);
  const toggleExpand = useCoachStore((s) => s.toggleExpand);
  const isExpanded = expandedRank === candidate.rank;

  const { scoreWhitePov } = candidate;
  const tone = evalTone(scoreWhitePov.value, scoreWhitePov.type === 'mate');
  const previewSans = candidate.steps.slice(0, 4).map((s) => s.san).join(' ');

  return (
    <li className={`candidate${isExpanded ? ' is-expanded' : ''}`}>
      <button
        type="button"
        className="candidate__header"
        aria-expanded={isExpanded}
        onClick={() => toggleExpand(candidate.rank)}
      >
        <span className="candidate__rank">{candidate.rank}</span>
        <span className="candidate__san">{candidate.san}</span>
        <span className={`candidate__eval candidate__eval--${tone}`}>
          {formatEval(scoreWhitePov)}
        </span>
        <span className="candidate__line">{previewSans}</span>
        <span className="candidate__chevron" aria-hidden="true">
          {isExpanded ? '▾' : '▸'}
        </span>
      </button>

      {isExpanded && (
        <div className="candidate__body">
          <LineStepper candidate={candidate} />
        </div>
      )}
    </li>
  );
}
