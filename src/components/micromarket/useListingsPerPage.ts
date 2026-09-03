import { useEffect, useState } from 'react';

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
 * a crawler to see — and a phone trims it on hydration. Following
 * hooks/use-mobile.tsx, the correction happens in an effect rather than during
 * render, so the first paint always matches the prerendered markup.
 */
const ROWS = 6;

const COLUMNS_AT = [
  { query: '(min-width: 1024px)', columns: 3 },
  { query: '(min-width: 768px)', columns: 2 },
] as const;

const DESKTOP_COLUMNS = 3;

export function useListingsPerPage(): number {
  const [columns, setColumns] = useState(DESKTOP_COLUMNS);

  useEffect(() => {
    const lists = COLUMNS_AT.map((c) => ({ ...c, mql: window.matchMedia(c.query) }));
    const resolve = () => setColumns(lists.find((c) => c.mql.matches)?.columns ?? 1);
    resolve();
    lists.forEach((c) => c.mql.addEventListener('change', resolve));
    return () => lists.forEach((c) => c.mql.removeEventListener('change', resolve));
  }, []);

  return columns * ROWS;
}
