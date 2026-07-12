import { QUALITY_META, type QualityLabel } from '../../lib/moveQuality';
import { useAnalysisStore } from '../../store/analysisStore';
import { useGameStore } from '../../store/gameStore';

interface Ply {
  san: string;
  ply: number;
}

interface MovePair {
  number: number;
  white?: Ply;
  black?: Ply;
}

function toPairs(sans: string[]): MovePair[] {
  const pairs: MovePair[] = [];
  for (let i = 0; i < sans.length; i += 2) {
    pairs.push({
      number: i / 2 + 1,
      white: { san: sans[i], ply: i + 1 },
      black: sans[i + 1] ? { san: sans[i + 1], ply: i + 2 } : undefined,
    });
  }
  return pairs;
}

function PlyCell({ ply }: { ply?: Ply }) {
  const label = useAnalysisStore((s) => (ply ? s.quality[ply.ply]?.label : undefined));
  if (!ply) return <span className="move-list__ply" />;

  const glyph = label ? QUALITY_META[label].glyph : '';
  const tone = label ? QUALITY_META[label].tone : undefined;

  return (
    <span className="move-list__ply">
      {ply.san}
      {glyph && (
        <sup className={`move-list__mark move-list__mark--${tone}`}>{glyph}</sup>
      )}
    </span>
  );
}

export function MoveList() {
  const history = useGameStore((s) => s.history);
  const pairs = toPairs(history.map((h) => h.san));

  if (pairs.length === 0) {
    return <p className="move-list__empty">No moves yet — make the first move.</p>;
  }

  return (
    <ol className="move-list" aria-label="Move history">
      {pairs.map((pair) => (
        <li key={pair.number} className="move-list__row">
          <span className="move-list__num">{pair.number}.</span>
          <PlyCell ply={pair.white} />
          <PlyCell ply={pair.black} />
        </li>
      ))}
    </ol>
  );
}

export type { QualityLabel };
