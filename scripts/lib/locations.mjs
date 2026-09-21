// Shared helpers for enumerating canonical cities/states from the backend.
// Used by both generate-locations.mjs (writes a TS data file the app imports)
// and generate-sitemap.mjs (emits per-location sitemap URLs).
// Must stay in sync with src/loaders/locationLoader.ts.

import { API_BASE, fetchMicromarkets } from './api.mjs';
import { fetchInventory } from '../../src/lib/fetchInventory.mjs';
import { canonicalListingLocation as canonicalize, matchesListingType } from '../../src/lib/listingLocation.mjs';

export { canonicalize };

/**
 * A city needs this many listings before its page is advertised to search —
 * sitemap.xml and the footer link block both gate on it. Below the threshold
 * the page is thinner than the state page it competes with, and the delisting
 * audit (WareOnGo_Cities_To_Be_Delisted.csv) found those pages taking zero
 * clicks and zero impressions over 77 days.
 *
 * Delisted, not removed: the pages still build and return 200, so existing
 * links and cached URLs keep working. They're just not advertised.
 */
export const CITY_MIN_LISTINGS = 3;

export const isListedCity = (city) => city.count >= CITY_MIN_LISTINGS;

// Mirror of src/lib/warehouseSlug.ts — keep in sync.
const SLUG_CITY_ALIASES = {
  bangalore: 'bengaluru',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  gurgaon: 'gurugram',
};

const slugifyName = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const canonicalCitySlug = (raw) => {
  if (!raw) return null;
  const lower = String(raw).trim().toLowerCase();
  if (!lower) return null;
  if (SLUG_CITY_ALIASES[lower]) return slugifyName(SLUG_CITY_ALIASES[lower]);
  const slug = slugifyName(lower);
  return slug.length > 0 ? slug : null;
};

export function warehouseSlug(w) {
  const parts = [];
  const sizes = w.totalSpaceSqft;
  const size = Array.isArray(sizes) ? sizes[0] : sizes;
  if (typeof size === 'number' && size > 0) parts.push(`${size}-sqft`);
  const type = w.warehouseType ? String(w.warehouseType).trim().toUpperCase() : null;
  if (type === 'PEB' || type === 'RCC') parts.push(type.toLowerCase());
  parts.push('warehouse');
  const city = canonicalCitySlug(w.city);
  if (city) parts.push(city);
  parts.push(String(w.id));
  return parts.join('-');
}

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export async function fetchAllWarehouses() {
  const all = [];
  let page = 1;
  const pageSize = 500;
  while (true) {
    const resp = await fetchInventory(`${API_BASE}/warehouses?page=${page}&pageSize=${pageSize}`, {}, true);
    if (!resp.ok) throw new Error(`Failed to fetch warehouses page ${page}: ${resp.status}`);
    const json = await resp.json();
    all.push(...json.data);
    if (page >= json.pagination.totalPages || json.data.length === 0) break;
    page += 1;
  }
  return all;
}

export function summarize(warehouses, type) {
  const counts = new Map();
  for (const w of warehouses) {
    const c = canonicalize(type === 'city' ? w.city : w.state, type);
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([canonical, count]) => ({ canonical, slug: slugify(canonical), count }))
    .filter((s) => s.slug.length > 0)
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

// ----- micromarkets ---------------------------------------------------------
// Read from the backend, not derived. See fetchMicromarkets in ./api.mjs for
// why: this file, the route loader and the CMS each used to carry their own copy
// of the same parsing rules.

/**
 * Only the micromarkets the site builds a page for, in the shape the callers
 * here already expect ({ canonical, slug, count, parentCity, citySlug }).
 */
export async function summarizeMicromarkets(data) {
  const all = data ?? await fetchMicromarkets();
  return all
    .filter((m) => m.hasPage)
    .map((m) => ({
      canonical: m.name,
      slug: m.slug,
      count: m.listings,
      parentCity: m.parentCity,
      citySlug: m.citySlug,
    }))
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

/** Filter choices include every named locality, scoped to its actual city inventory. */
export function filterMicromarkets(warehouses, micromarkets) {
  const cities = new Map(summarize(warehouses, 'city').map(city => [city.canonical, city]));
  const warehouseCities = new Map(warehouses.map(warehouse => [warehouse.id, canonicalize(warehouse.city, 'city')]));
  return micromarkets.flatMap(market => {
    const counts = new Map();
    for (const id of new Set(market.listingIds ?? [])) {
      const city = warehouseCities.get(id);
      if (cities.has(city)) counts.set(city, (counts.get(city) ?? 0) + 1);
    }
    return [...counts].map(([city, count]) => ({
      canonical: market.name, slug: market.slug, count,
      parentCity: city, citySlug: cities.get(city).slug,
    }));
  }).sort((a, b) => b.count - a.count || a.canonical.localeCompare(b.canonical, 'en') || a.parentCity.localeCompare(b.parentCity, 'en'));
}

/** Canonical page path — micromarkets nest under their parent city. */
export const micromarketPath = (m) => `/listings/city/${m.citySlug}/${m.slug}`;

// For each city/state, list which warehouse types have ≥1 listing.
export function locationTypeCombos(warehouses, type) {
  const summaries = summarize(warehouses, type);
  const combos = [];
  for (const loc of summaries) {
    const inScope = warehouses.filter((w) => {
      const raw = (type === 'city' ? w.city : w.state) ?? '';
      return canonicalize(raw, type) === loc.canonical;
    });
    for (const t of ['PEB', 'RCC']) {
      const count = inScope.filter((w) => matchesListingType(w.warehouseType, t)).length;
      if (count > 0) combos.push({ location: loc, warehouseType: t, count });
    }
  }
  return combos;
}
