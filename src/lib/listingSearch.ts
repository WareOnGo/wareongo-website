import type { ShouldRevalidateFunctionArgs } from 'react-router-dom';
import { CITIES, STATES, FILTER_MICROMARKETS, type LocationSummary } from '@/data/locations.generated';
import type { ListingsFilters } from '@/lib/listingsQuery';

export interface WarehouseFilters {
  state: string;
  city: string;
  micromarket: string;
  fireCompliance: string;
  warehouseTypes: string[];
  areaRanges: string[];
  minSqft: number;
  maxSqft: number;
}

export const DEFAULT_FILTERS: WarehouseFilters = {
  state: '', city: '', micromarket: '', fireCompliance: '', warehouseTypes: [], areaRanges: [], minSqft: 0, maxSqft: 100000,
};
export const DEFAULT_PAGE_SIZE = 21;
export const PAGE_SIZES = [10, 21, 30, 50] as const;
const byWarehouseCount = (a: LocationSummary, b: LocationSummary) =>
  b.count - a.count || a.canonical.localeCompare(b.canonical, 'en');
export const CITY_OPTIONS = [...CITIES].sort(byWarehouseCount).map(city => city.canonical);
export const STATE_OPTIONS = [...STATES].sort(byWarehouseCount).map(state => state.canonical);
export const WAREHOUSE_TYPE_OPTIONS = ['PEB', 'RCC', 'BTS', 'Shed'];
export const AREA_PRESETS = [
  { value: '0-10000', label: 'Up to 10,000', compactLabel: '≤10k', min: 0, max: 10000 },
  { value: '10000-25000', label: '10,000–25,000', compactLabel: '10–25k', min: 10000, max: 25000 },
  { value: '25000-50000', label: '25,000–50,000', compactLabel: '25–50k', min: 25000, max: 50000 },
  { value: '50000-', label: '50,000+', compactLabel: '50k+', min: 50000, max: 100000 },
];

export const CITY_SEARCH_ALIASES: Record<string, string[]> = {
  Bengaluru: ['Bangalore'], Mumbai: ['Bombay'], Kolkata: ['Calcutta'],
  Chennai: ['Madras'], Gurugram: ['Gurgaon'],
};

const FILTER_KEYS = ['city', 'state', 'micromarket', 'fire', 'type', 'area', 'minSqft', 'maxSqft'];
const PAGING_KEYS = ['page', 'pageSize'];

export const micromarketsForCity = (city: string) => FILTER_MICROMARKETS
  .filter(market => market.parentCity === city).sort(byWarehouseCount);

/** A locality selection belongs to one city and resets when that city changes. */
export function changeListingFilter<K extends keyof WarehouseFilters>(filters: WarehouseFilters, key: K, value: WarehouseFilters[K]): WarehouseFilters {
  const next = { ...filters, [key]: value };
  if (key === 'city' && value !== filters.city) { next.micromarket = ''; next.state = ''; }
  if (key === 'state' && value !== filters.state) { next.city = ''; next.micromarket = ''; }
  if (key === 'areaRanges') { next.minSqft = 0; next.maxSqft = 100000; }
  return next;
}

// Saved single-range URLs still select their corresponding quick filter.
export function selectedAreaPresets(filters: WarehouseFilters) {
  return AREA_PRESETS.filter(preset => filters.areaRanges.length
    ? filters.areaRanges.includes(preset.value)
    : filters.minSqft === preset.min && filters.maxSqft === preset.max);
}

function options(values: string[], available: string[]): string[] {
  const requested = new Set(values.flatMap(value => value.split(',').map(part => part.trim().toLowerCase())));
  return available.filter(value => requested.has(value.toLowerCase()));
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

export function filtersFromSearchParams(input: URLSearchParams, preset = DEFAULT_FILTERS): WarehouseFilters {
  const search = new URLSearchParams(input);
  for (const [key, value] of [['state', preset.state], ['city', preset.city], ['micromarket', preset.micromarket], ['type', preset.warehouseTypes.join(',')]]) {
    if (!search.has(key) && value) search.set(key, value);
  }
  const requestedCity = location(search.get('city'), CITY_OPTIONS);
  const city = Object.entries(CITY_SEARCH_ALIASES).find(([, aliases]) =>
    aliases.some(alias => alias.toLowerCase() === requestedCity.toLowerCase()))?.[0] ?? requestedCity;
  const min = area(search.get('minSqft'), 0);
  const max = area(search.get('maxSqft'), 100000);
  const areaRanges = options(search.getAll('area'), AREA_PRESETS.map(preset => preset.value));
  return {
    state: location(search.get('state'), STATE_OPTIONS),
    city,
    // Preserve saved slugs outside the build's options: zero results must not
    // silently become an unfiltered city when a locality disappears.
    micromarket: city && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(search.get('micromarket')?.toLowerCase() ?? '')
      ? search.get('micromarket')!.toLowerCase() : '',
    // The switch is a positive requirement: off includes all NOC statuses.
    fireCompliance: search.get('fire')?.trim().toLowerCase() === 'yes' ? 'yes' : '',
    warehouseTypes: options(search.getAll('type'), WAREHOUSE_TYPE_OPTIONS),
    areaRanges,
    minSqft: areaRanges.length ? 0 : Math.min(min, max),
    maxSqft: areaRanges.length ? 100000 : Math.max(min, max),
  };
}

/** The backend owns exact geography, aliases, locality matching and paging. */
export function toApiFilters(filters: WarehouseFilters): ListingsFilters {
  const city = filters.city && filters.city !== 'all' ? filters.city : undefined;
  const ranges = selectedAreaPresets(filters);
  const min = ranges.length === 1 ? ranges[0].min : filters.minSqft;
  const max = ranges.length === 1 ? ranges[0].max : filters.maxSqft;
  const apiFilters = {
    city,
    state: filters.state || undefined,
    locationMatch: city || filters.state ? 'exact' as const : undefined,
    micromarket: city && filters.micromarket ? filters.micromarket : undefined,
    warehouseType: options(filters.warehouseTypes, WAREHOUSE_TYPE_OPTIONS).join(',') || undefined,
    fireNocAvailable: filters.fireCompliance === 'yes' ? true : undefined,
    spaceRanges: ranges.length > 1 ? ranges.map(range => range.value).join(',') : undefined,
    minSpace: ranges.length <= 1 && min > 0 ? min : undefined,
    maxSpace: ranges.length <= 1 && max < 100000 ? max : undefined,
  };
  return Object.fromEntries(Object.entries(apiFilters).filter(([, value]) => value !== undefined)) as ListingsFilters;
}

export function readListingSearch(search: URLSearchParams, preset = DEFAULT_FILTERS) {
  const requestedSize = readPositiveInteger(search.get('pageSize'), DEFAULT_PAGE_SIZE);
  const pageSize = PAGE_SIZES.find(size => size === requestedSize) ?? DEFAULT_PAGE_SIZE;
  // Keep the resulting API offset within the signed integer accepted by the DB.
  const requestedPage = readPositiveInteger(search.get('page'), 1);
  const page = requestedPage <= Math.floor(2147483647 / (pageSize * 2)) ? requestedPage : 1;
  return { filters: filtersFromSearchParams(search, preset), page, pageSize };
}

export function writeListingSearch(
  search: URLSearchParams,
  { filters, page, pageSize }: ReturnType<typeof readListingSearch>,
  preset = DEFAULT_FILTERS,
): URLSearchParams {
  const next = new URLSearchParams(search);
  [...FILTER_KEYS, ...PAGING_KEYS].forEach(key => next.delete(key));
  for (const [key, value, initial] of [
    ['state', filters.state, preset.state], ['city', filters.city, preset.city],
    ['micromarket', filters.city ? filters.micromarket : '', preset.micromarket],
    ['type', options(filters.warehouseTypes, WAREHOUSE_TYPE_OPTIONS).join(','), preset.warehouseTypes.join(',')],
  ]) {
    if (value !== initial) next.set(key, value === 'all' ? '' : value);
  }
  if (filters.fireCompliance) next.set('fire', filters.fireCompliance);
  const ranges = selectedAreaPresets(filters);
  if (ranges.length > 1) next.set('area', ranges.map(range => range.value).join(','));
  else {
    const min = ranges.length === 1 ? ranges[0].min : filters.minSqft;
    const max = ranges.length === 1 ? ranges[0].max : filters.maxSqft;
    if (min > 0) next.set('minSqft', String(min));
    if (max < 100000) next.set('maxSqft', String(max));
  }
  if (page > 1) next.set('page', String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) next.set('pageSize', String(pageSize));
  return next;
}

/** Refinements keep a location URL; changing its scope opens the shared search. */
export function listingSearchHref(pathname: string, search: URLSearchParams, hash: string, preset = DEFAULT_FILTERS) {
  const state = readListingSearch(search, preset);
  const changedScope = (['state', 'city', 'micromarket'] as const)
    .some(key => preset[key] && state.filters[key] !== preset[key]) ||
    (preset.warehouseTypes.length > 0 && state.filters.warehouseTypes.join(',') !== preset.warehouseTypes.join(','));
  const path = changedScope ? '/listings' : pathname;
  const query = writeListingSearch(search, state, changedScope ? DEFAULT_FILTERS : preset).toString();
  return `${path}${query ? `?${query}` : ''}${hash}`;
}

// These loaders supply pathname-scoped seed data. Search state is consumed by
// React Query or array slicing, so rerunning a loader only delays that update
// and can cancel the next-page preload before it becomes the visible query.
export function listingShouldRevalidate({ currentUrl, nextUrl, formMethod, actionResult, actionStatus, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs): boolean {
  if (formMethod || actionResult !== undefined || actionStatus !== undefined || currentUrl.pathname !== nextUrl.pathname || currentUrl.search === nextUrl.search) {
    return defaultShouldRevalidate;
  }
  const owned = /^\/listings(?:\/|$)/.test(currentUrl.pathname)
    ? [...FILTER_KEYS, ...PAGING_KEYS] : PAGING_KEYS;
  const withoutOwned = (url: URL) => {
    const search = new URLSearchParams(url.search);
    owned.forEach(key => search.delete(key));
    search.sort();
    return search.toString();
  };
  return withoutOwned(currentUrl) === withoutOwned(nextUrl) ? false : defaultShouldRevalidate;
}
