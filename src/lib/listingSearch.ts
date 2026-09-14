import type { ShouldRevalidateFunctionArgs } from 'react-router-dom';

export interface WarehouseFilters {
  city: string;
  state: string;
  fireCompliance: string;
  warehouseType: string;
  minSqft: number;
  maxSqft: number;
}

export const DEFAULT_FILTERS: WarehouseFilters = {
  city: '', state: '', fireCompliance: '', warehouseType: '', minSqft: 0, maxSqft: 100000,
};
export const DEFAULT_PAGE_SIZE = 21;
export const PAGE_SIZES = [10, 21, 30, 50] as const;
export const CITY_OPTIONS = ['Bangalore', 'Hosur', 'Kolkata', 'Delhi', 'Hyderabad'];
export const STATE_OPTIONS = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana'];
export const WAREHOUSE_TYPE_OPTIONS = ['RCC', 'PEB'];
export const FIRE_COMPLIANCE_OPTIONS = ['Yes', 'No'];

const FILTER_KEYS = ['city', 'state', 'fire', 'type', 'minSqft', 'maxSqft'];
const PAGING_KEYS = ['page', 'pageSize'];

export function readPositiveInteger(value: string | null, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function area(value: string | null, fallback: number): number {
  if (!value || !/^-?\d+$/.test(value)) return fallback;
  const number = Number(value);
  return Number.isSafeInteger(number) ? Math.max(0, Math.min(100000, number)) : fallback;
}

function option(value: string | null, options: string[]): string {
  return options.find(candidate => candidate.toLowerCase() === value?.trim().toLowerCase()) ?? '';
}

// Preserve location deep links beyond the small curated dropdown lists, while
// normalizing known labels (and the existing Bangalore/Bengaluru alias).
function location(value: string | null, options: string[]): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase() === 'all') return '';
  return option(trimmed, options) || trimmed;
}

export function filtersFromSearchParams(search: URLSearchParams): WarehouseFilters {
  const city = location(search.get('city'), CITY_OPTIONS);
  const min = area(search.get('minSqft'), 0);
  const max = area(search.get('maxSqft'), 100000);
  return {
    city: city.toLowerCase() === 'bengaluru' ? 'Bangalore' : city,
    state: location(search.get('state'), STATE_OPTIONS),
    fireCompliance: option(search.get('fire'), FIRE_COMPLIANCE_OPTIONS).toLowerCase(),
    warehouseType: option(search.get('type'), WAREHOUSE_TYPE_OPTIONS),
    minSqft: Math.min(min, max),
    maxSqft: Math.max(min, max),
  };
}

export function readListingSearch(search: URLSearchParams) {
  const requestedSize = readPositiveInteger(search.get('pageSize'), DEFAULT_PAGE_SIZE);
  const pageSize = PAGE_SIZES.find(size => size === requestedSize) ?? DEFAULT_PAGE_SIZE;
  // Keep the resulting API offset within the signed integer accepted by the DB.
  const requestedPage = readPositiveInteger(search.get('page'), 1);
  const page = requestedPage <= Math.floor(2147483647 / (pageSize * 2)) ? requestedPage : 1;
  return { filters: filtersFromSearchParams(search), page, pageSize };
}

export function writeListingSearch(
  search: URLSearchParams,
  { filters, page, pageSize }: ReturnType<typeof readListingSearch>,
): URLSearchParams {
  const next = new URLSearchParams(search);
  [...FILTER_KEYS, ...PAGING_KEYS].forEach(key => next.delete(key));
  if (filters.city && filters.city !== 'all') next.set('city', filters.city);
  if (filters.state && filters.state !== 'all') next.set('state', filters.state);
  if (filters.fireCompliance) next.set('fire', filters.fireCompliance);
  if (filters.warehouseType && filters.warehouseType !== 'all') next.set('type', filters.warehouseType);
  if (filters.minSqft > 0) next.set('minSqft', String(filters.minSqft));
  if (filters.maxSqft < 100000) next.set('maxSqft', String(filters.maxSqft));
  if (page > 1) next.set('page', String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) next.set('pageSize', String(pageSize));
  return next;
}

// These loaders supply pathname-scoped seed data. Search state is consumed by
// React Query or array slicing, so rerunning a loader only delays that update
// and can cancel the next-page preload before it becomes the visible query.
export function listingShouldRevalidate({ currentUrl, nextUrl, formMethod, actionResult, actionStatus, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs): boolean {
  if (formMethod || actionResult !== undefined || actionStatus !== undefined || currentUrl.pathname !== nextUrl.pathname || currentUrl.search === nextUrl.search) {
    return defaultShouldRevalidate;
  }
  const owned = currentUrl.pathname.replace(/\/+$/, '') === '/listings'
    ? [...FILTER_KEYS, ...PAGING_KEYS] : PAGING_KEYS;
  const withoutOwned = (url: URL) => {
    const search = new URLSearchParams(url.search);
    owned.forEach(key => search.delete(key));
    search.sort();
    return search.toString();
  };
  return withoutOwned(currentUrl) === withoutOwned(nextUrl) ? false : defaultShouldRevalidate;
}
