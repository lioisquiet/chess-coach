import { Chess, type Square } from 'chess.js';
import { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useContainerWidth } from '../../hooks/useContainerWidth';
import { useCoachStore } from '../../store/coachStore';
import { useGameStore } from '../../store/gameStore';

const BOARD_LIGHT = 'oklch(90% 0.03 85)';
const BOARD_DARK = 'oklch(58% 0.055 75)';

type HighlightStyles = Record<string, React.CSSProperties>;

export function GameBoard() {
  const fen = useGameStore((s) => s.fen);
  const orientation = useGameStore((s) => s.orientation);
  const playerColor = useGameStore((s) => s.playerColor);
  const isEngineThinking = useGameStore((s) => s.isEngineThinking);
  const gameOverText = useGameStore((s) => s.gameOverText);
  const makePlayerMove = useGameStore((s) => s.makePlayerMove);
  const clearHints = useCoachStore((s) => s.clear);

  const [selected, setSelected] = useState<Square | null>(null);
  const { ref: boardWrapRef, width: boardWidth } = useContainerWidth<HTMLDivElement>();

  const chess = useMemo(() => new Chess(fen), [fen]);
  const playerToMove = chess.turn() === playerColor && !gameOverText && !isEngineThinking;

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(chess.moves({ square: selected, verbose: true }).map((m) => m.to));
  }, [chess, selected]);

  const squareStyles = useMemo<HighlightStyles>(() => {
    const styles: HighlightStyles = {};
    if (selected) {
      styles[selected] = { background: 'oklch(72% 0.12 200 / 0.45)' };
    }
    for (const target of legalTargets) {
      const occupied = chess.get(target as Square);
      styles[target] = occupied
        ? { background: 'radial-gradient(circle, transparent 58%, oklch(56% 0.16 25 / 0.5) 60%)' }
        : {
            background:
              'radial-gradient(circle, oklch(40% 0.05 200 / 0.42) 22%, transparent 24%)',
          };
    }
    return styles;
  }, [chess, selected, legalTargets]);

  const attemptMove = (from: Square, to: Square): boolean => {
    const piece = chess.get(from);
    const isPromotion =
      piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
    const ok = makePlayerMove(from, to, isPromotion ? 'q' : undefined);
    if (ok) {
      clearHints();
      setSelected(null);
    }
    return ok;
  };

  const onSquareClick = (square: Square) => {
    if (!playerToMove) return;
    if (selected && legalTargets.has(square)) {
      attemptMove(selected, square);
      return;
    }
    const piece = chess.get(square);
    setSelected(piece && piece.color === playerColor ? square : null);
  };

  const onPieceDrop = (from: Square, to: Square): boolean => {
    if (!playerToMove) return false;
    return attemptMove(from, to);
  };

  return (
    <div className="game-board" aria-label="Chess board" ref={boardWrapRef}>
      {boardWidth > 0 && (
      <Chessboard
        boardWidth={boardWidth}
        position={fen}
        boardOrientation={orientation}
        arePiecesDraggable={playerToMove}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={squareStyles}
        customDarkSquareStyle={{ backgroundColor: BOARD_DARK }}
        customLightSquareStyle={{ backgroundColor: BOARD_LIGHT }}
        customBoardStyle={{
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
        }}
        animationDuration={200}
      />
      )}
    </div>
  );
}
