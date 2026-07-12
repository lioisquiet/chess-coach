import { TRAINER_OPENINGS } from '../../data/trainerOpenings';
import { useTrainerStore } from '../../store/trainerStore';
import { TrainerBoard } from './TrainerBoard';

function OpeningPicker() {
  const select = useTrainerStore((s) => s.select);

  return (
    <div className="trainer-picker">
      <p className="trainer-picker__lead">
        Pick an opening and play its main line move by move. The trainer replies with
        theory and tells you the moment you stray from the book.
      </p>
      <ul className="opening-grid">
        {TRAINER_OPENINGS.map((opening) => (
          <li key={opening.id}>
            <button type="button" className="opening-card" onClick={() => select(opening.id)}>
              <span className="opening-card__top">
                <span className="opening-card__eco">{opening.eco}</span>
                <span className={`opening-card__side opening-card__side--${opening.learnerColor}`}>
                  {opening.learnerColor === 'w' ? 'White' : 'Black'}
                </span>
              </span>
              <span className="opening-card__name">{opening.name}</span>
              <span className="opening-card__idea">{opening.idea}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Drill() {
  const opening = useTrainerStore((s) => s.opening)!;
  const lineIndex = useTrainerStore((s) => s.lineIndex);
  const status = useTrainerStore((s) => s.status);
  const feedback = useTrainerStore((s) => s.feedback);
  const restart = useTrainerStore((s) => s.restart);
  const exit = useTrainerStore((s) => s.exit);

  const played = opening.line.slice(0, lineIndex);
  const total = opening.line.length;
  const yourTurn = status === 'active';

  return (
    <div className="drill">
      <div className="drill__board-col">
        <TrainerBoard />
      </div>

      <div className="drill__info">
        <header className="drill__head">
          <span className="opening-card__eco">{opening.eco}</span>
          <h2 className="drill__title">{opening.name}</h2>
        </header>
        <p className="drill__idea">{opening.idea}</p>

        <div className="drill__status">
          {status === 'complete'
            ? 'Main line complete.'
            : yourTurn
              ? `Your move — ${played.length + 1} of ${total}. You play ${
                  opening.learnerColor === 'w' ? 'White' : 'Black'
                }.`
              : ''}
        </div>

        {feedback && (
          <div className={`drill__feedback drill__feedback--${feedback.type}`} role="status">
            {feedback.text}
          </div>
        )}

        <div className="drill__moves" aria-label="Line so far">
          {played.length === 0 ? (
            <span className="drill__moves-empty">No moves yet.</span>
          ) : (
            played.map((san, i) => (
              <span key={`${san}-${i}`} className="drill__move">
                {i % 2 === 0 ? `${i / 2 + 1}.` : ''} {san}
              </span>
            ))
          )}
        </div>

        <div className="drill__controls">
          <button type="button" className="btn btn--sm" onClick={restart}>
            ↺ Restart
          </button>
          <button type="button" className="btn btn--sm" onClick={exit}>
            ← Choose another
          </button>
        </div>
      </div>
    </div>
  );
}

export function TrainerView() {
  const opening = useTrainerStore((s) => s.opening);
  return (
    <section className="pane trainer" aria-label="Opening trainer">
      {opening ? <Drill /> : <OpeningPicker />}
    </section>
  );
}
