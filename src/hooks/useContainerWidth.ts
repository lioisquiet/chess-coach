import { useEffect, useRef, useState } from 'react';

/**
 * Tracks the pixel width of a container element via ResizeObserver.
 * react-chessboard v4 needs an explicit boardWidth when it lives inside a
 * grid/flex child whose width is 0 at first measure.
 */
export function useContainerWidth<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  width: number;
} {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.floor(measured));
    });
    observer.observe(element);
    setWidth(Math.floor(element.getBoundingClientRect().width));

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
