import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type RefObject } from 'react';

type Options = {
  viewport: RefObject<HTMLDivElement>;
  target?: RefObject<HTMLDivElement>;
  enabled: boolean;
  busy: boolean;
  resetKey: string;
  onSwipe: (delta: 1 | -1, offset: number) => void;
};
type Gesture = {
  id: number;
  x: number;
  y: number;
  width: number;
  horizontal: boolean;
  samples: { x: number; time: number }[];
};
const resting = { preview: null as 1 | -1 | null, returning: false };

/** The browser keeps vertical scrolling and pinch zoom; we handle horizontal drags. */
export function useGallerySwipe({ viewport, target = viewport, enabled, busy, resetKey, onSwipe }: Options) {
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const animationFrame = useRef<number>();
  const dragOffset = useRef(0);
  const [visual, setVisual] = useState(resting);

  useEffect(() => {
    gesture.current = null;
    viewport.current?.style.removeProperty('--gallery-drag-x');
    setVisual(resting);
    return () => {
      clearTimeout(timer.current);
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = undefined;
    };
  }, [resetKey, enabled, viewport]);

  useEffect(() => {
    const node = target.current;
    if (!enabled || !node) return;
    const onTouchMove = (event: TouchEvent) => {
      // Once horizontal dragging wins, prevent a native fling from swallowing
      // the next tap. React's touch listeners are passive, so bind this locally.
      if (gesture.current?.horizontal && event.touches.length === 1 && event.cancelable) event.preventDefault();
    };
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => node.removeEventListener('touchmove', onTouchMove);
  }, [enabled, target]);

  const resetOffset = () => {
    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = undefined;
    dragOffset.current = 0;
    viewport.current?.style.setProperty('--gallery-drag-x', '0px');
  };

  const snapBack = () => {
    gesture.current = null;
    clearTimeout(timer.current);
    resetOffset();
    setVisual(previous => ({ ...previous, returning: true }));
    timer.current = setTimeout(() => setVisual(resting), 180);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') { suppressClick.current = false; return; }
    if (!event.isPrimary) {
      // A second finger belongs to browser zoom, even after a drag has begun.
      if (gesture.current) { suppressClick.current = true; snapBack(); }
      return;
    }
    suppressClick.current = false;
    if (!enabled || busy || event.button !== 0) return;
    if ((event.target as Element).closest('button, input, select, textarea')) return;
    const bounds = viewport.current?.getBoundingClientRect();
    if (!bounds || event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    clearTimeout(timer.current);
    resetOffset();
    setVisual(resting);
    gesture.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY, width: bounds.width,
      horizontal: false, samples: [{ x: event.clientX, time: event.timeStamp }],
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) { gesture.current = null; return; }
      start.horizontal = true;
      suppressClick.current = true;
      // Capture only after a drag: an ordinary tap still targets the card link.
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    start.samples.push({ x: event.clientX, time: event.timeStamp });
    while (start.samples.length > 2 && event.timeStamp - start.samples[0].time > 100) start.samples.shift();
    // Keep high-frequency movement out of React and the rest of the card tree.
    dragOffset.current = Math.max(-start.width, Math.min(start.width, dx));
    if (animationFrame.current === undefined) {
      animationFrame.current = requestAnimationFrame(() => {
        viewport.current?.style.setProperty('--gallery-drag-x', `${dragOffset.current}px`);
        animationFrame.current = undefined;
      });
    }
    const preview = dx < 0 ? 1 : -1;
    if (visual.preview !== preview || visual.returning) setVisual({ preview, returning: false });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    if (!start.horizontal) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - start.x;
    const sample = start.samples[0];
    const velocity = (event.clientX - sample.x) / Math.max(1, event.timeStamp - sample.time);
    const distance = Math.min(48, Math.max(28, start.width * 0.1));
    const flick = Math.abs(dx) >= 16 && Math.abs(velocity) >= 0.3 && Math.sign(velocity) === Math.sign(dx);
    if (Math.abs(dx) >= distance || flick) {
      resetOffset();
      setVisual(resting);
      onSwipe(dx < 0 ? 1 : -1, Math.max(-start.width, Math.min(start.width, dx)));
    } else snapBack();
  };

  const cancel = () => {
    if (gesture.current) snapBack();
  };

  return {
    preview: visual.preview,
    photoStyle: {
      '--gallery-return-duration': visual.returning ? '180ms' : '0ms',
    } as CSSProperties,
    // Bind to the card itself: its stretched title link covers the image area.
    handlers: {
      style: { touchAction: enabled ? 'pan-y pinch-zoom' : undefined },
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: cancel,
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
        // Moving capture from the touched image/link to its parent also emits
        // a bubbling lost event; only losing our own capture ends the drag.
        if (event.target === event.currentTarget) cancel();
      },
      onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
        if (!suppressClick.current || event.detail === 0) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    },
  };
}
