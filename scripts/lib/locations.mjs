// Shared helpers for enumerating canonical cities/states from the backend.
// Used by both generate-locations.mjs (writes a TS data file the app imports)
// and generate-sitemap.mjs (emits per-location sitemap URLs).
// Must stay in sync with src/loaders/locationLoader.ts.

import { API_BASE } from './api.mjs';

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

const CITY_ALIASES = {
  bangalore: 'Bengaluru',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  gurgaon: 'Gurugram',
};

const titleCase = (s) =>
  s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');

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

export const canonicalize = (raw, type) => {
  if (!raw) return null;
  const lower = String(raw).trim().toLowerCase();
  if (!lower) return null;
  if (type === 'city' && CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  return titleCase(lower);
};

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export async function fetchAllWarehouses() {
  const all = [];
  let page = 1;
  const pageSize = 50;
  while (true) {
    const resp = await fetch(`${API_BASE}/warehouses?page=${page}&pageSize=${pageSize}`);
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

const canonicalWarehouseType = (raw) => {
  if (!raw) return null;
  const upper = String(raw).trim().toUpperCase();
  if (upper === 'PEB' || upper === 'RCC') return upper;
  return null;
};

// ----- micromarkets ---------------------------------------------------------
// Mirror of the micromarket section in src/loaders/locationLoader.ts — keep in
// sync. Both decide which localities are page-worthy, so a divergence would put
// URLs in the sitemap that the build never prerenders (or vice versa).

export const MICROMARKET_MIN_LISTINGS = 5;

// The parent city supplies the {city} URL segment, so it must be a real city
// name (the column also holds locality fragments like "Sector 78, Badshahpur")
// with enough inventory of its own.
export const PARENT_CITY_MIN_LISTINGS = 6;

const isRealCityName = (name) => name.length > 2 && !name.includes(',');

const MICROMARKET_ID_RE = /^[A-Za-z0-9]{32}$/;

const isNamedMicromarket = (raw) => {
  const v = String(raw ?? '').trim();
  return v.length > 2 && !MICROMARKET_ID_RE.test(v);
};

export const slugifyMicromarket = (name) =>
  String(name)
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const micromarketsOf = (w) => [
  ...new Set(
    (Array.isArray(w.micromarket) ? w.micromarket : [])
      .map((m) => String(m).trim())
      .filter(isNamedMicromarket),
  ),
];

export function summarizeMicromarkets(warehouses) {
  // Cities allowed to host a micromarket page, mapped to their page slug.
  const hostCities = new Map(
    summarize(warehouses, 'city')
      .filter((c) => isRealCityName(c.canonical) && c.count >= PARENT_CITY_MIN_LISTINGS)
      .map((c) => [c.canonical, c.slug]),
  );
  const acc = new Map();
  for (const w of warehouses) {
    const city = canonicalize(w.city, 'city');
    for (const name of micromarketsOf(w)) {
      const slug = slugifyMicromarket(name);
      if (!slug) continue;
      const entry = acc.get(slug) ?? { canonical: name, count: 0, cities: new Map() };
      entry.count += 1;
      if (city) entry.cities.set(city, (entry.cities.get(city) ?? 0) + 1);
      acc.set(slug, entry);
    }
  }
  return Array.from(acc.entries())
    .map(([slug, e]) => {
      // Most listings wins, but only among cities that can host a page.
      const parent = Array.from(e.cities.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .find(([city]) => hostCities.has(city));
      return { canonical: e.canonical, slug, count: e.count, parentCity: parent?.[0] ?? null };
    })
    // parentCity is the {city} segment of the URL, so a micromarket without an
    // eligible one has nowhere to live.
    .filter((e) => e.count >= MICROMARKET_MIN_LISTINGS && e.parentCity !== null)
    .map((e) => ({ ...e, citySlug: hostCities.get(e.parentCity) }))
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

/** Canonical page path — micromarkets nest under their parent city. */
export const micromarketPath = (m) => `/listings/city/${m.citySlug}/${m.slug}`;

// For each city/state, list which warehouse types have ≥1 listing.
export function locationTypeCombos(warehouses, type) {
  const summaries = summarize(warehouses, type);
  const combos = [];
  for (const loc of summaries) {
    const matchersLower = new Set([loc.canonical.toLowerCase()]);
    // alias expansion mirrors locationLoader.ts matchersFor
    if (type === 'city') {
      for (const [alias, can] of Object.entries(CITY_ALIASES)) {
        if (can === loc.canonical) matchersLower.add(alias);
      }
    }
    const inScope = warehouses.filter((w) => {
      const raw = (type === 'city' ? w.city : w.state) ?? '';
      return matchersLower.has(String(raw).trim().toLowerCase());
    });
    for (const t of ['PEB', 'RCC']) {
      const count = inScope.filter((w) => canonicalWarehouseType(w.warehouseType) === t).length;
      if (count > 0) combos.push({ location: loc, warehouseType: t, count });
    }
  }
  return combos;
}
