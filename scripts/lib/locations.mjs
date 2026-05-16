// Shared helpers for enumerating canonical cities/states from the backend.
// Used by both generate-locations.mjs (writes a TS data file the app imports)
// and generate-sitemap.mjs (emits per-location sitemap URLs).
// Must stay in sync with src/loaders/locationLoader.ts.

const API_BASE = 'https://wareongo-website-backend.onrender.com';

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
