// Builds the SEO-friendly warehouse URL slug. ID always stays at the end so we
// can parse it back deterministically regardless of what other fields are present.
//
// Examples:
//   { id: 1608, size: 34000, warehouseType: 'RCC', city: 'Bengaluru' }
//     -> "34000-sqft-rcc-warehouse-bengaluru-1608"
//   { id: 100, size: 3200, city: 'Bengaluru' }
//     -> "3200-sqft-warehouse-bengaluru-100"
//   { id: 9 }
//     -> "warehouse-9"

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  gurgaon: 'gurugram',
};

const slugifyName = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const canonicalCitySlug = (raw?: string | null): string | null => {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;
  if (CITY_ALIASES[lower]) return slugifyName(CITY_ALIASES[lower]);
  const slug = slugifyName(lower);
  return slug.length > 0 ? slug : null;
};

export interface WarehouseSlugFields {
  id: number | string;
  size?: number | null;
  warehouseType?: string | null;
  city?: string | null;
}

export function warehouseSlug(w: WarehouseSlugFields): string {
  const parts: string[] = [];
  if (w.size && w.size > 0) parts.push(`${w.size}-sqft`);
  const type = w.warehouseType?.trim().toUpperCase();
  if (type === 'PEB' || type === 'RCC') parts.push(type.toLowerCase());
  parts.push('warehouse');
  const city = canonicalCitySlug(w.city);
  if (city) parts.push(city);
  parts.push(String(w.id));
  return parts.join('-');
}

export const warehousePath = (w: WarehouseSlugFields): string => `/warehouse/${warehouseSlug(w)}`;

// Inverse: pull the numeric ID off the end of a slug. Returns null for "0",
// non-numeric tails, or empty strings.
export function parseIdFromWarehouseSlug(slug: string): number | null {
  if (!slug) return null;
  const lastDash = slug.lastIndexOf('-');
  const tail = lastDash === -1 ? slug : slug.slice(lastDash + 1);
  const id = parseInt(tail, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
}
