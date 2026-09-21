import { useEffect, useState, type RefObject } from 'react';
import { NAVIGATION_DESKTOP_QUERY } from '@/data/navigation';

/** Keep the header in the document flow; only its visible position changes. */
export function useScrollHeader(headerRef: RefObject<HTMLElement>, enabled: boolean, resetKey: string) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    const header = headerRef.current;
    if (!enabled || !header) return;
    const desktop = window.matchMedia(NAVIGATION_DESKTOP_QUERY);
    // Safari's rubber-band overscroll must not count as a direction change.
    const position = () => Math.max(0, Math.min(window.scrollY,
      document.documentElement.scrollHeight - window.innerHeight));
    let lastY = position();
    let direction = 0;
    let distance = 0;
    let isHidden = false;
    let frame = 0;
    let width = window.innerWidth;
    const show = () => {
      isHidden = false;
      setHidden(false);
      distance = 0;
      direction = 0;
      lastY = position();
    };
    const update = () => {
      frame = 0;
      const y = position();
      const active = document.activeElement;
      // Touch focus left on a menu trigger must not pin the header forever.
      const keyboardFocus = header.contains(active) && active?.matches(':focus-visible');
      if (desktop.matches || y <= header.offsetHeight || keyboardFocus) {
        show();
        return;
      }
      const delta = y - lastY;
      lastY = y;
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      // Deliberate downward travel hides it; a shorter upward gesture reveals it.
      if (distance >= (direction > 0 ? 24 : 10)) {
        const nextHidden = direction > 0;
        if (isHidden !== nextHidden) {
          isHidden = nextHidden;
          setHidden(nextHidden);
        }
        distance = 0;
      }
    };
    const scroll = () => {
      if (!desktop.matches && !frame) frame = window.requestAnimationFrame(update);
    };
    const resize = () => {
      // Mobile browser bars and the software keyboard resize the height while
      // scrolling. Only a width change should reset the header's visibility.
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        show();
      }
    };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    desktop.addEventListener('change', show);
    header.addEventListener('focusin', show);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      desktop.removeEventListener('change', show);
      header.removeEventListener('focusin', show);
    };
  }, [headerRef, enabled, resetKey]);

  return enabled && hidden;
}
