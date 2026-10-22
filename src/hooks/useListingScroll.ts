import { useEffect, useRef, type RefObject } from 'react';
import { useLocation, useNavigation, useNavigationType } from 'react-router-dom';
import { listingScrollPosition, saveListingScrollPosition } from '@/lib/listingScroll';

const isCurrentEntry = (key: string) => (window.history.state?.key ?? 'default') === key;

export function useListingScroll({ resultsRef, ready, onVisiblePage }: {
  resultsRef: RefObject<HTMLElement>;
  ready: boolean;
  onVisiblePage: (page: number) => void;
}) {
  const location = useLocation();
  const navigation = useNavigation();
  const navigationType = useNavigationType();
  const restored = useRef('');
  const visiblePage = useRef(onVisiblePage);
  // Router transitions may render the destination while the previous grid is
  // still on screen. Only measure with the callback from a committed render.
  useEffect(() => { visiblePage.current = onVisiblePage; });

  useEffect(() => {
    if (!ready || navigation.state !== 'idle') return;
    let frame = 0;
    let restoring = false;
    const saved = listingScrollPosition(location.key);
    if (navigationType === 'POP' && restored.current !== location.key && saved !== undefined) {
      restoring = true;
      frame = requestAnimationFrame(() => {
        if (!isCurrentEntry(location.key)) return;
        window.scrollTo({ top: saved, behavior: 'instant' });
        restored.current = location.key;
        restoring = false;
      });
    } else if (isCurrentEntry(location.key)) {
      // A visible-page replacement creates a new history key without another
      // scroll event. Record it now, including for keyboard-only navigation.
      saveListingScrollPosition(location.key, window.scrollY);
    }
    const measure = () => {
      frame = 0;
      if (!isCurrentEntry(location.key)) return;
      saveListingScrollPosition(location.key, window.scrollY);
      const chunks = resultsRef.current?.querySelectorAll<HTMLElement>('[data-listing-page]');
      if (!chunks?.length) return;
      let page = Number(chunks[0].dataset.listingPage);
      const top = Math.min(180, window.innerHeight / 3);
      for (const chunk of chunks) {
        if (chunk.getBoundingClientRect().top > top) break;
        page = Number(chunk.dataset.listingPage);
      }
      visiblePage.current(page);
    };
    const schedule = () => {
      if (!frame && !restoring) frame = requestAnimationFrame(measure);
    };
    const save = () => { if (!restoring && isCurrentEntry(location.key)) saveListingScrollPosition(location.key, window.scrollY); };
    window.addEventListener('scroll', schedule, { passive: true });
    // Capture before a route transition hides the outgoing page and collapses
    // its document height. Saving in effect cleanup would record that collapse.
    window.addEventListener('click', save, true);
    window.addEventListener('pagehide', save);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('click', save, true);
      window.removeEventListener('pagehide', save);
    };
  }, [location.key, navigation.state, navigationType, ready, resultsRef]);
}

/** The fallback link remains usable with a keyboard or without observers. */
export function useAutoLoadListings({ sentinelRef, enabled, load, page }: {
  sentinelRef: RefObject<HTMLElement>;
  enabled: boolean;
  load: () => void;
  page: number;
}) {
  const location = useLocation();
  const navigation = useNavigation();
  const callback = useRef(load);
  useEffect(() => { callback.current = load; });
  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || navigation.state !== 'idle' || !node || typeof IntersectionObserver !== 'function') return;
    let requested = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !requested && document.visibilityState === 'visible' && isCurrentEntry(location.key)) {
        requested = true;
        callback.current();
      }
    }, { rootMargin: '240px 0px', threshold: 0 });
    observer.observe(node);
    const resume = () => { if (document.visibilityState === 'visible') { observer.unobserve(node); observer.observe(node); } };
    document.addEventListener('visibilitychange', resume);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', resume); };
  }, [enabled, location.key, navigation.state, page, sentinelRef]);
}
