import { useSyncExternalStore } from 'react';
import type { WarehouseFilters } from '@/lib/listingSearch';
import type { Micromarket } from '@/services/micromarketsAPI';

const BREAK_ROWS = [
  { kind: 'shortlist', row: 4 },
  { kind: 'micromarkets', row: 8 },
  { kind: 'callback', row: 12 },
] as const;
export type ListingBreakKind = typeof BREAK_ROWS[number]['kind'];

/** Each API batch is its own grid, so its final partial row still counts. */
export function listingBreakPositions(cardCount: number, rowsBefore: number, columns: number) {
  const rowsAfter = rowsBefore + Math.ceil(cardCount / columns);
  return BREAK_ROWS.filter(({ row }) => row > rowsBefore && row <= rowsAfter)
    .map(({ kind, row }) => ({ kind, after: Math.min((row - rowsBefore) * columns, cardCount) }));
}

function subscribe(listener: () => void) {
  const queries = [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')];
  queries.forEach(query => query.addEventListener('change', listener));
  return () => queries.forEach(query => query.removeEventListener('change', listener));
}

export function useListingColumns() {
  return useSyncExternalStore(subscribe, () => window.matchMedia('(min-width: 1024px)').matches
    ? 3 : window.matchMedia('(min-width: 768px)').matches ? 2 : 1, () => 3);
}

const canonical = (value: string | null) => (value || '').trim().toLowerCase().replace(/^bangalore$/, 'bengaluru');

/** Counts come from the inventory endpoint, never the currently loaded batch. */
export function listingBreakMarkets(markets: Micromarket[], filters: WarehouseFilters) {
  return markets.filter(market => market.hasPage && market.citySlug && market.listings > 0
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(market.slug)
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(market.citySlug)
    && (!filters.city || canonical(market.parentCity) === canonical(filters.city))
    && (!filters.state || canonical(market.parentState) === canonical(filters.state))
    && !(filters.micromarket === market.slug && canonical(market.parentCity) === canonical(filters.city)))
    .sort((a, b) => b.listings - a.listings || a.name.localeCompare(b.name))
    .slice(0, 8);
}

export function listingEnquiryLocation(filters: WarehouseFilters) {
  return [filters.micromarket?.replace(/-/g, ' '), filters.city, filters.state].filter(Boolean).join(', ');
}
