import { useSyncExternalStore } from 'react';

/**
 * Cards per page, matched to the grid's column count so every viewport gets the
 * same *number of rows* rather than the same number of cards.
 *
 * The grid is 1 / 2 / 3 columns at base / md / lg, so six rows is 6, 12 and 18
 * cards. A fixed 18 meant a phone scrolled through roughly twenty screens of
 * listings before reaching the pager, which is not a page anyone reads.
 *
 * Starts at the desktop value on purpose. This page is prerendered, so the
 * served HTML carries the largest page — the most inventory in the document for
 * a crawler to see — and a phone trims it on hydration. useSyncExternalStore
 * supplies that value for server rendering and the first
 * hydration render, then reads the actual viewport. URL pagination can therefore
 * use the current viewport as soon as hydration completes, without first
 * clamping a phone's shared page against the desktop page count.
 */
const ROWS = 6;

const COLUMNS_AT = [
  { query: '(min-width: 1024px)', columns: 3 },
  { query: '(min-width: 768px)', columns: 2 },
] as const;

const DESKTOP_COLUMNS = 3;

const subscribe = (onChange: () => void) => {
  const lists = COLUMNS_AT.map(({ query }) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener('change', onChange));
  return () => lists.forEach((list) => list.removeEventListener('change', onChange));
};

const getSnapshot = () =>
  (COLUMNS_AT.find(({ query }) => window.matchMedia(query).matches)?.columns ?? 1) * ROWS;
const getServerSnapshot = () => DESKTOP_COLUMNS * ROWS;

export function useListingsPerPage(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
