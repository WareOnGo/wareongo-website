import { useEffect, useRef } from 'react';
import { useListingsPerPage } from '@/components/micromarket/useListingsPerPage';
import { useListingSearch } from '@/hooks/useListingSearch';
import { readPositiveInteger } from '@/lib/listingSearch';

/** A shared page opens on the receiving viewport's page containing its first listing. */
export function readLocationPagination(search: URLSearchParams, itemCount: number, perPage: number) {
  const requestedPage = readPositiveInteger(search.get('page'), 1);
  const requestedSize = readPositiveInteger(search.get('pageSize'), perPage);
  const sourceSize = [6, 12, 18].includes(requestedSize) ? requestedSize : perPage;
  const totalPages = Math.max(1, Math.ceil(itemCount / perPage));
  // Bound the source index before multiplying: even a safe integer page number
  // can overflow when multiplied, and nothing past this inventory can be shown.
  const sourcePage = Math.min(requestedPage, Math.ceil(itemCount / sourceSize) + 1);
  const sourceStart = (sourcePage - 1) * sourceSize;
  const currentPage = Math.min(Math.floor(sourceStart / perPage) + 1, totalPages);
  return { currentPage, totalPages, start: (currentPage - 1) * perPage };
}

export function createLocationPageSearch(search: URLSearchParams, page: number, perPage: number) {
  const next = new URLSearchParams(search);
  if (page === 1) {
    next.delete('page');
    next.delete('pageSize');
  } else {
    next.set('page', String(page));
    next.set('pageSize', String(perPage));
  }
  return next;
}

/**
 * Client-side paging for a grid of listings the page already has in hand.
 *
 * Both listing layouts need this — the editorial template and the plain grid it
 * falls back to — and both page an array the loader delivered rather than
 * refetching, so the arithmetic and the scroll behaviour are the same. This
 * exists so there is one copy of them.
 *
 * Not for /listings, which pages by refetching from the API.
 *
 * The caller keeps what a page change *means*: its own analytics event, and
 * where the reader should land. Attach `anchorRef` to the element that should be
 * scrolled back to.
 */
export function usePagedListings<T>(items: T[], hasData = true) {
  const perPage = useListingsPerPage();
  const { searchParams, hydrated, setSearchParams, hrefFor } = useListingSearch();
  const { currentPage, totalPages, start } = readLocationPagination(searchParams, items.length, perPage);
  const anchorRef = useRef<HTMLElement | null>(null);
  /**
   * Set when a page change came from the pager, so the effect below can tell a
   * real navigation from the initial render and not scroll the page on load.
   */
  const scrollAfterPaging = useRef<number | null>(null);

  // Canonicalize only after both URL state and the responsive snapshot are live.
  // Replacing preserves browser history while fixing malformed/out-of-range
  // pages and translating links shared from a different viewport.
  useEffect(() => {
    // A missing loader result may render <Navigate>. Do not let URL cleanup
    // cancel that redirect by navigating back to the empty outgoing route.
    if (!hydrated || !hasData) return;
    const next = createLocationPageSearch(searchParams, currentPage, perPage);
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [hydrated, hasData, searchParams, currentPage, perPage, setSearchParams]);

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
    if (scrollAfterPaging.current !== currentPage) return;
    scrollAfterPaging.current = null;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    anchorRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
  }, [currentPage]);

  const shown = items.slice(start, start + perPage);

  const goTo = (next: number) => {
    const target = Math.max(1, Math.min(next, totalPages));
    if (target === currentPage) return;
    scrollAfterPaging.current = target;
    setSearchParams(createLocationPageSearch(searchParams, target, perPage));
  };

  const hrefForPage = (page: number) =>
    hrefFor(createLocationPageSearch(searchParams, Math.max(1, Math.min(page, totalPages)), perPage));

  return {
    /** The items to render for this page. */
    shown,
    perPage,
    currentPage,
    totalPages,
    /** Zero-based index of the first item shown, for the "Showing 1–18 of 99" line. */
    start,
    anchorRef,
    goTo,
    hrefForPage,
    hydrated,
  };
}
