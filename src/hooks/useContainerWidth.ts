import { useLayoutEffect, useRef, useState } from 'react';

// Ignore sub-pixel/incidental width changes so the board mounts once at a stable
// size instead of re-initializing (and dropping the first interaction) when an
// unrelated reflow — a scrollbar appearing, the eval readout rendering — nudges layout.
const SIGNIFICANT_DELTA = 2;

/**
 * Tracks the pixel width of a container element. react-chessboard v4 needs an
 * explicit boardWidth when it lives inside a grid/flex child whose width is 0 at
 * first measure. Measuring in a layout effect commits the width before the first
 * paint, so the board (and its drag backend) mount before the user can interact.
 */
export function useContainerWidth<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  width: number;
} {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const apply = (measured: number) => {
      const next = Math.floor(measured);
      setWidth((prev) => (Math.abs(prev - next) >= SIGNIFICANT_DELTA ? next : prev));
    };

    apply(element.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      apply(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
