import { Chess, type Square } from 'chess.js';
import { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useContainerWidth } from '../../hooks/useContainerWidth';
import { useTrainerStore } from '../../store/trainerStore';

const BOARD_LIGHT = 'oklch(90% 0.03 85)';
const BOARD_DARK = 'oklch(58% 0.055 75)';

export function TrainerBoard() {
  const fen = useTrainerStore((s) => s.fen);
  const opening = useTrainerStore((s) => s.opening);
  const status = useTrainerStore((s) => s.status);
  const attemptMove = useTrainerStore((s) => s.attemptMove);

  const [selected, setSelected] = useState<Square | null>(null);
  const { ref, width } = useContainerWidth<HTMLDivElement>();

  const chess = useMemo(() => new Chess(fen), [fen]);
  const learnerColor = opening?.learnerColor ?? 'w';
  const canMove = status === 'active' && chess.turn() === learnerColor;

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(chess.moves({ square: selected, verbose: true }).map((m) => m.to));
  }, [chess, selected]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selected) styles[selected] = { background: 'oklch(72% 0.12 200 / 0.45)' };
    for (const target of legalTargets) {
      styles[target] = {
        background: 'radial-gradient(circle, oklch(40% 0.05 200 / 0.42) 22%, transparent 24%)',
      };
    }
    return styles;
  }, [selected, legalTargets]);

  const tryMove = (from: Square, to: Square): boolean => {
    const piece = chess.get(from);
    const isPromotion = piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
    const ok = attemptMove(from, to, isPromotion ? 'q' : undefined);
    if (ok) setSelected(null);
    return ok;
  };

  const onSquareClick = (square: Square) => {
    if (!canMove) return;
    if (selected && legalTargets.has(square)) {
      tryMove(selected, square);
      return;
    }
    const piece = chess.get(square);
    setSelected(piece && piece.color === learnerColor ? square : null);
  };

  return (
    <div className="trainer-board" ref={ref}>
      {width > 0 && (
        <Chessboard
          id="trainer"
          boardWidth={width}
          position={fen}
          boardOrientation={learnerColor === 'b' ? 'black' : 'white'}
          arePiecesDraggable={canMove}
          onPieceDrop={(from, to) => (canMove ? tryMove(from, to) : false)}
          onSquareClick={onSquareClick}
          customSquareStyles={squareStyles}
          customDarkSquareStyle={{ backgroundColor: BOARD_DARK }}
          customLightSquareStyle={{ backgroundColor: BOARD_LIGHT }}
          customBoardStyle={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
          animationDuration={200}
        />
      )}
    </div>
  );
}
