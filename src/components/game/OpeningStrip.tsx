import { useEffect, useMemo, useState } from 'react';
import { classifyOpening, loadOpenings, type OpeningInfo } from '../../lib/openings';
import { START_FEN, useGameStore } from '../../store/gameStore';

type OpeningMap = Record<string, OpeningInfo>;

/** Names the current game's opening from the bundled (offline) ECO dataset. */
export function OpeningStrip() {
  const history = useGameStore((s) => s.history);
  const [map, setMap] = useState<OpeningMap | null>(null);

  useEffect(() => {
    loadOpenings().then(setMap).catch(() => setMap(null));
  }, []);

  const opening = useMemo(() => {
    if (!map) return null;
    return classifyOpening(map, [START_FEN, ...history.map((h) => h.fen)]);
  }, [map, history]);

  if (!opening) return null;

  return (
    <div className="opening-strip">
      <div className="opening-strip__name">
        <span className="opening-strip__eco">{opening.eco}</span>
        <span className="opening-strip__title">{opening.name}</span>
      </div>
    </div>
  );
}
