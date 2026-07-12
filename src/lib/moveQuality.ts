import type { EngineScore } from './engine/uciParser';
import type { PlayerColor } from '../store/gameStore';

export type QualityLabel = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

const MATE_SCALAR = 30000;

// Centipawns lost (from the mover's perspective) at or above which each label applies.
const THRESHOLDS: { label: QualityLabel; minLoss: number }[] = [
  { label: 'blunder', minLoss: 250 },
  { label: 'mistake', minLoss: 120 },
  { label: 'inaccuracy', minLoss: 55 },
  { label: 'good', minLoss: 20 },
];

export const QUALITY_META: Record<QualityLabel, { glyph: string; text: string; tone: string }> = {
  best: { glyph: '!', text: 'Best', tone: 'good' },
  good: { glyph: '', text: 'Good', tone: 'even' },
  inaccuracy: { glyph: '?!', text: 'Inaccuracy', tone: 'warn' },
  mistake: { glyph: '?', text: 'Mistake', tone: 'bad' },
  blunder: { glyph: '??', text: 'Blunder', tone: 'bad' },
};

/** Collapses a score to a single White-perspective scalar; mate outranks any centipawn value. */
export function scoreToScalar(score: EngineScore): number {
  if (score.type === 'mate') {
    return score.value >= 0 ? MATE_SCALAR - score.value : -(MATE_SCALAR + score.value);
  }
  return score.value;
}

export interface MoveQuality {
  cpLoss: number;
  label: QualityLabel;
}

/**
 * Grades a move by how much it dropped the mover's evaluation, comparing the
 * position before the move (assumed best play) to the position after it.
 * Scalars are White-perspective; `mover` is who made the move.
 */
export function classifyMove(
  prevWhiteScalar: number,
  nextWhiteScalar: number,
  mover: PlayerColor,
): MoveQuality {
  const sign = mover === 'w' ? 1 : -1;
  const cpLoss = Math.max(0, sign * (prevWhiteScalar - nextWhiteScalar));
  const label = THRESHOLDS.find((t) => cpLoss >= t.minLoss)?.label ?? 'best';
  return { cpLoss, label };
}
