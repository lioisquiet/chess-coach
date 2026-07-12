import { useMemo } from 'react';
import { computeAccuracy, whiteWinPercent, type ScoredPosition } from '../../lib/accuracy';
import { useAnalysisStore } from '../../store/analysisStore';
import { useGameStore } from '../../store/gameStore';

const GRAPH_W = 280;
const GRAPH_H = 88;

interface CriticalMoment {
  ply: number;
  san: string;
  swing: number; // White win% change (signed)
}

export function ReviewPanel() {
  const gameOverText = useGameStore((s) => s.gameOverText);
  const history = useGameStore((s) => s.history);
  const playerColor = useGameStore((s) => s.playerColor);
  const entries = useAnalysisStore((s) => s.entries);

  const { accuracy, series, criticals } = useMemo(() => {
    const positions: ScoredPosition[] = [];
    const series: { ply: number; win: number }[] = [];
    for (let ply = 0; ply <= history.length; ply += 1) {
      const entry = entries[ply];
      if (!entry) continue;
      positions.push({ ply, score: entry.score });
      series.push({ ply, win: whiteWinPercent(entry.score) });
    }

    const criticals: CriticalMoment[] = [];
    for (let i = 1; i < series.length; i += 1) {
      if (series[i].ply !== series[i - 1].ply + 1) continue;
      const swing = series[i].win - series[i - 1].win;
      const san = history[series[i].ply - 1]?.san;
      if (san) criticals.push({ ply: series[i].ply, san, swing });
    }
    criticals.sort((a, b) => Math.abs(b.swing) - Math.abs(a.swing));

    return { accuracy: computeAccuracy(positions), series, criticals: criticals.slice(0, 3) };
  }, [entries, history]);

  const maxPly = history.length || 1;
  const whiteArea = useMemo(() => {
    if (series.length === 0) return '';
    const pts = series.map((s) => `L${(s.ply / maxPly) * GRAPH_W},${GRAPH_H * (1 - s.win / 100)}`);
    return `M0,${GRAPH_H} ${pts.join(' ')} L${GRAPH_W},${GRAPH_H} Z`;
  }, [series, maxPly]);

  const you = playerColor === 'w' ? accuracy.white : accuracy.black;
  const them = playerColor === 'w' ? accuracy.black : accuracy.white;

  return (
    <section className="review" aria-label="Game review">
      <header className="review__head">
        <h2 className="review__title">Game review</h2>
        <p className="review__result">{gameOverText}</p>
      </header>

      <div className="review__accuracy">
        <div className="accuracy-card accuracy-card--you">
          <span className="accuracy-card__label">You</span>
          <span className="accuracy-card__value">{you === null ? '—' : `${you}%`}</span>
          <span className="accuracy-card__sub">accuracy</span>
        </div>
        <div className="accuracy-card">
          <span className="accuracy-card__label">Engine</span>
          <span className="accuracy-card__value">{them === null ? '—' : `${them}%`}</span>
          <span className="accuracy-card__sub">accuracy</span>
        </div>
      </div>

      <div className="review__graph">
        <span className="review__graph-label">Advantage over time</span>
        <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="advantage-graph" role="img"
          aria-label="White advantage across the game">
          <rect x="0" y="0" width={GRAPH_W} height={GRAPH_H} className="advantage-graph__black" />
          <path d={whiteArea} className="advantage-graph__white" />
          <line x1="0" y1={GRAPH_H / 2} x2={GRAPH_W} y2={GRAPH_H / 2} className="advantage-graph__mid" />
        </svg>
      </div>

      {criticals.length > 0 && (
        <div className="review__criticals">
          <span className="review__criticals-label">Turning points</span>
          <ul className="critical-list">
            {criticals.map((c) => {
              const moveNo = Math.ceil(c.ply / 2);
              const mover = c.ply % 2 === 1 ? 'White' : 'Black';
              const favors = c.swing >= 0 ? 'White' : 'Black';
              return (
                <li key={c.ply} className="critical">
                  <span className="critical__move">
                    {moveNo}. {mover === 'Black' ? '…' : ''}{c.san}
                  </span>
                  <span className="critical__swing">
                    {Math.abs(Math.round(c.swing))}% → {favors}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
