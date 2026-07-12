import { Chessboard } from 'react-chessboard';
import { useContainerWidth } from '../../hooks/useContainerWidth';

const BOARD_LIGHT = 'oklch(90% 0.03 85)';
const BOARD_DARK = 'oklch(58% 0.055 75)';

interface PreviewBoardProps {
  fen: string;
  orientation: 'white' | 'black';
  lastMove?: { from: string; to: string };
}

export function PreviewBoard({ fen, orientation, lastMove }: PreviewBoardProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const highlight = lastMove
    ? {
        [lastMove.from]: { background: 'oklch(72% 0.12 200 / 0.35)' },
        [lastMove.to]: { background: 'oklch(72% 0.12 200 / 0.45)' },
      }
    : {};

  return (
    <div className="preview-board" ref={ref}>
      {width > 0 && (
      <Chessboard
        id="coach-preview"
        boardWidth={width}
        position={fen}
        boardOrientation={orientation}
        arePiecesDraggable={false}
        customSquareStyles={highlight}
        customDarkSquareStyle={{ backgroundColor: BOARD_DARK }}
        customLightSquareStyle={{ backgroundColor: BOARD_LIGHT }}
        customBoardStyle={{ borderRadius: 'var(--radius-sm)' }}
        animationDuration={180}
      />
      )}
    </div>
  );
}
