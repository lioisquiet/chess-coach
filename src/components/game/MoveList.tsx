import { useGameStore } from '../../store/gameStore';

interface MovePair {
  number: number;
  white?: string;
  black?: string;
}

function toPairs(sans: string[]): MovePair[] {
  const pairs: MovePair[] = [];
  for (let i = 0; i < sans.length; i += 2) {
    pairs.push({ number: i / 2 + 1, white: sans[i], black: sans[i + 1] });
  }
  return pairs;
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
          <span className="move-list__ply">{pair.white}</span>
          <span className="move-list__ply">{pair.black ?? ''}</span>
        </li>
      ))}
    </ol>
  );
}
