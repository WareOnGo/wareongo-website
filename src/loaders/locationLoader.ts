import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';

// ----- canonical name + slug helpers ----------------------------------------

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  gurgaon: 'Gurugram',
};

const titleCase = (s: string): string =>
  s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const canonicalize = (raw: string | null | undefined, type: 'city' | 'state'): string | null => {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;
  if (type === 'city' && CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  return titleCase(lower);
};

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// Every raw name that should match a given canonical (handles aliases).
const matchersFor = (canonical: string, type: 'city' | 'state'): Set<string> => {
  const out = new Set<string>([canonical.toLowerCase()]);
  if (type === 'city') {
    for (const [alias, can] of Object.entries(CITY_ALIASES)) {
      if (can === canonical) out.add(alias);
    }
  }
  return out;
};

// ----- cached warehouse fetch -----------------------------------------------

let warehousesCache: Warehouse[] | null = null;

export async function getAllWarehouses(): Promise<Warehouse[]> {
  if (warehousesCache) return warehousesCache;
  const all: Warehouse[] = [];
  let page = 1;
  const pageSize = 50;
  while (true) {
    const resp = await warehouseAPI.getWarehouses(page, pageSize);
    all.push(...resp.data);
    if (page >= resp.pagination.totalPages || resp.data.length === 0) break;
    page += 1;
  }
  warehousesCache = all;
  return all;
}

// ----- public types + summaries ---------------------------------------------

export interface LocationSummary {
  canonical: string;
  slug: string;
  count: number;
}

export type WarehouseType = 'PEB' | 'RCC';
export type WarehouseTypeSlug = 'peb' | 'rcc';

const canonicalType = (raw: string | null | undefined): WarehouseType | null => {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === 'PEB' || upper === 'RCC') return upper;
  return null;
};

const typeSlugToCanonical = (slug: string): WarehouseType | null => {
  const lower = slug.toLowerCase();
  if (lower === 'peb') return 'PEB';
  if (lower === 'rcc') return 'RCC';
  return null;
};

export interface LocationListingsLoaderData {
  type: 'city' | 'state';
  canonical: string;
  slug: string;
  // Present only on /listings/.../:type pages; absent on base location pages.
  warehouseType?: WarehouseType;
  warehouses: ReturnType<typeof transformWarehouseData>[];
  // Counts for the link block on base location pages (e.g. "12 PEB / 47 RCC").
  typeCounts?: { PEB: number; RCC: number };
}

async function summariesFor(type: 'city' | 'state'): Promise<LocationSummary[]> {
  const all = await getAllWarehouses();
  const counts = new Map<string, number>();
  for (const w of all) {
    const c = canonicalize(type === 'city' ? w.city : w.state, type);
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([canonical, count]) => ({ canonical, slug: slugify(canonical), count }))
    .filter((s) => s.slug.length > 0)
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

export const getCityList = () => summariesFor('city');
export const getStateList = () => summariesFor('state');

// ----- loaders + static paths -----------------------------------------------

async function loaderFor(
  type: 'city' | 'state',
  slug: string,
  typeSlug?: string,
): Promise<LocationListingsLoaderData | null> {
  const summaries = await summariesFor(type);
  const match = summaries.find((s) => s.slug === slug);
  if (!match) return null;
  const all = await getAllWarehouses();
  const matchers = matchersFor(match.canonical, type);
  let scoped = all.filter((w) => {
    const raw = (type === 'city' ? w.city : w.state) ?? '';
    return matchers.has(raw.trim().toLowerCase());
  });

  // Count PEB/RCC inside this scope before any type filter (used by link block on base pages).
  const typeCounts = scoped.reduce(
    (acc, w) => {
      const t = canonicalType(w.warehouseType);
      if (t === 'PEB') acc.PEB += 1;
      else if (t === 'RCC') acc.RCC += 1;
      return acc;
    },
    { PEB: 0, RCC: 0 },
  );

  let warehouseType: WarehouseType | undefined;
  if (typeSlug) {
    warehouseType = typeSlugToCanonical(typeSlug) ?? undefined;
    if (!warehouseType) return null;
    scoped = scoped.filter((w) => canonicalType(w.warehouseType) === warehouseType);
    if (scoped.length === 0) return null;
  }

  return {
    type,
    canonical: match.canonical,
    slug: match.slug,
    warehouseType,
    typeCounts,
    warehouses: scoped.map(transformWarehouseData),
  };
}

export async function cityListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('city', params.city ?? '');
}

export async function stateListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('state', params.state ?? '');
}

export async function cityTypeListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('city', params.city ?? '', params.type ?? '');
}

export async function stateTypeListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('state', params.state ?? '', params.type ?? '');
}

export async function cityStaticPaths(): Promise<string[]> {
  const cities = await summariesFor('city');
  return cities.map((c) => `/listings/city/${c.slug}`);
}

export async function stateStaticPaths(): Promise<string[]> {
  const states = await summariesFor('state');
  return states.map((s) => `/listings/state/${s.slug}`);
}

// Generates only the city×type combos that actually have listings — skips empty pages.
async function locationTypeStaticPaths(type: 'city' | 'state'): Promise<string[]> {
  const all = await getAllWarehouses();
  const summaries = await summariesFor(type);
  const paths: string[] = [];
  for (const loc of summaries) {
    const matchers = matchersFor(loc.canonical, type);
    const inScope = all.filter((w) => {
      const raw = (type === 'city' ? w.city : w.state) ?? '';
      return matchers.has(raw.trim().toLowerCase());
    });
    for (const t of ['PEB', 'RCC'] as const) {
      const count = inScope.filter((w) => canonicalType(w.warehouseType) === t).length;
      if (count > 0) paths.push(`/listings/${type}/${loc.slug}/${t.toLowerCase()}`);
    }
  }
  return paths;
}

export const cityTypeStaticPaths = () => locationTypeStaticPaths('city');
export const stateTypeStaticPaths = () => locationTypeStaticPaths('state');
