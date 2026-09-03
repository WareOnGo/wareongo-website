import { useEffect, useRef, useState } from 'react';
import { useListingsPerPage } from '@/components/micromarket/useListingsPerPage';

/**
 * Client-side paging for a grid of listings the page already has in hand.
 *
 * Both listing layouts need this — the editorial template and the plain grid it
 * falls back to — and both page an array the loader delivered rather than
 * refetching, so the arithmetic and the scroll behaviour are the same. This
 * exists so there is one copy of them.
 *
 * Not for /listings, which pages by refetching from the API and owns its own
 * page state as a result.
 *
 * The caller keeps what a page change *means*: its own analytics event, and
 * where the reader should land. Attach `anchorRef` to the element that should be
 * scrolled back to.
 */
export function usePagedListings<T>(items: T[]) {
  const perPage = useListingsPerPage();
  const [page, setPage] = useState(1);
  const anchorRef = useRef<HTMLElement | null>(null);
  /**
   * Set when a page change came from the pager, so the effect below can tell a
   * real navigation from the initial render and not scroll the page on load.
   */
  const scrollAfterPaging = useRef(false);

  /**
   * Scroll back to the top of the grid after paging — in an effect, so it runs
   * once React has committed the new cards.
   *
   * Doing it inline in the pager's handler looked fine and wasn't: the handler
   * runs before the re-render, and the commit that swaps eighteen cards for six
   * cancels the in-flight smooth scroll, leaving the reader wherever they were.
   * The eval harness caught it (tests/specs/pagination.spec.ts).
   */
  useEffect(() => {
    if (!scrollAfterPaging.current) return;
    scrollAfterPaging.current = false;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    anchorRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  /**
   * Clamped rather than reset: rotating a phone changes the page size, and page
   * 4 of 4 becoming page 4 of 2 would otherwise render an empty grid. Clamping
   * keeps the reader at the end of the list where they already were.
   */
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const shown = items.slice(start, start + perPage);

  const goTo = (next: number) => {
    scrollAfterPaging.current = true;
    setPage(next);
  };

  return {
    /** The items to render for this page. */
    shown,
    currentPage,
    totalPages,
    /** Zero-based index of the first item shown, for the "Showing 1–18 of 99" line. */
    start,
    anchorRef,
    goTo,
  };
}
