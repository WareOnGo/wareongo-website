import type { ShouldRevalidateFunctionArgs } from 'react-router-dom';
import { CITIES, FILTER_MICROMARKETS, type LocationSummary } from '@/data/locations.generated';
import type { ListingsFilters } from '@/lib/listingsQuery';

export interface WarehouseFilters {
  city: string;
  micromarket: string;
  fireCompliance: string;
  warehouseType: string;
  minSqft: number;
  maxSqft: number;
}

export const DEFAULT_FILTERS: WarehouseFilters = {
  city: '', micromarket: '', fireCompliance: '', warehouseType: '', minSqft: 0, maxSqft: 100000,
};
export const DEFAULT_PAGE_SIZE = 21;
export const PAGE_SIZES = [10, 21, 30, 50] as const;
const byWarehouseCount = (a: LocationSummary, b: LocationSummary) =>
  b.count - a.count || a.canonical.localeCompare(b.canonical, 'en');
export const CITY_OPTIONS = [...CITIES].sort(byWarehouseCount).map(city => city.canonical);
export const WAREHOUSE_TYPE_OPTIONS = ['PEB', 'RCC', 'BTS', 'Shed'];

export const CITY_SEARCH_ALIASES: Record<string, string[]> = {
  Bengaluru: ['Bangalore'], Mumbai: ['Bombay'], Kolkata: ['Calcutta'],
  Chennai: ['Madras'], Gurugram: ['Gurgaon'],
};

// Retire legacy state parameters so they cannot silently constrain the results.
const FILTER_KEYS = ['city', 'state', 'micromarket', 'fire', 'type', 'minSqft', 'maxSqft'];
const PAGING_KEYS = ['page', 'pageSize'];

export const micromarketsForCity = (city: string) => FILTER_MICROMARKETS
  .filter(market => market.parentCity === city).sort(byWarehouseCount);

/** A locality selection belongs to one city and resets when that city changes. */
export function changeListingFilter(filters: WarehouseFilters, key: keyof WarehouseFilters, value: string | number): WarehouseFilters {
  const next = { ...filters, [key]: value };
  if (key === 'city' && value !== filters.city) next.micromarket = '';
  return next;
}

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

// Preserve older location deep links even if a place leaves the build catalogue.
function location(value: string | null, options: string[]): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase() === 'all') return '';
  return option(trimmed, options) || trimmed;
}

export function filtersFromSearchParams(search: URLSearchParams): WarehouseFilters {
  const requestedCity = location(search.get('city'), CITY_OPTIONS);
  const city = Object.entries(CITY_SEARCH_ALIASES).find(([, aliases]) =>
    aliases.some(alias => alias.toLowerCase() === requestedCity.toLowerCase()))?.[0] ?? requestedCity;
  const min = area(search.get('minSqft'), 0);
  const max = area(search.get('maxSqft'), 100000);
  return {
    city,
    micromarket: option(search.get('micromarket'), micromarketsForCity(city).map(market => market.slug)),
    // The switch is a positive requirement: off includes all NOC statuses.
    fireCompliance: search.get('fire')?.trim().toLowerCase() === 'yes' ? 'yes' : '',
    warehouseType: option(search.get('type'), WAREHOUSE_TYPE_OPTIONS),
    minSqft: Math.min(min, max),
    maxSqft: Math.max(min, max),
  };
}

/** UI/URL state → backend filters, including raw spellings grouped by the build. */
export function toApiFilters(filters: WarehouseFilters): ListingsFilters {
  const city = filters.city && filters.city !== 'all' ? filters.city : undefined;
  const aliases = city ? CITY_SEARCH_ALIASES[city] : undefined;
  const apiFilters = {
    city: Array.isArray(aliases) ? [...aliases, city].join(',') : city,
    micromarket: city && micromarketsForCity(city).some(market => market.slug === filters.micromarket) ? filters.micromarket : undefined,
    warehouseType: filters.warehouseType && filters.warehouseType !== 'all' ? filters.warehouseType : undefined,
    fireNocAvailable: filters.fireCompliance === 'yes' ? true : undefined,
    minSpace: filters.minSqft > 0 ? filters.minSqft : undefined,
    maxSpace: filters.maxSqft < 100000 ? filters.maxSqft : undefined,
  };
  return Object.fromEntries(Object.entries(apiFilters).filter(([, value]) => value !== undefined)) as ListingsFilters;
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
  if (filters.city && filters.micromarket) next.set('micromarket', filters.micromarket);
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
