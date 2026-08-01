// Build-time stats for the editorial location-page content
// (src/data/locationContent.ts). Computed from the loader's live warehouses,
// using only genuinely parseable values — transformWarehouseData's `price`
// and `ceilingHeight` carry fallbacks (35 / 10) that would poison ranges,
// so we parse from the nullable `rate` / `heightFt` fields instead.

interface WarehouseLike {
  size?: number;
  rate?: number | null;
  heightFt?: number | null;
  warehouseType?: string | null;
  fireCompliance?: boolean;
}

export interface LocationStats {
  count: number;
  /** "18+" when count ≥ 10, bare "8" below that (per content-doc title rule) */
  count_plus: string;
  min_size: string | null;
  max_size: string | null;
  min_rent: string | null;
  max_rent: string | null;
  median_rent: string | null;
  small_rent: string | null;
  large_rent: string | null;
  min_height: string | null;
  max_height: string | null;
  count_peb: number;
  count_rcc: number;
  count_shed: number;
  count_coldstorage: number;
  count_compliant: number;
}

const median = (nums: number[]): number | null => {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const fmtSqft = (n: number) => n.toLocaleString('en-IN');
const fmtRent = (n: number) => String(Math.round(n));

export const computeLocationStats = (warehouses: WarehouseLike[]): LocationStats => {
  const sizes = warehouses
    .map((w) => w.size)
    .filter((s): s is number => typeof s === 'number' && s > 100);
  const rates = warehouses
    .map((w) => w.rate)
    .filter((r): r is number => typeof r === 'number');
  const heights = warehouses
    .map((w) => w.heightFt)
    .filter((h): h is number => typeof h === 'number');

  // small_rent / large_rent: median asking rate of the smaller vs larger half
  // of listings (by size). Needs enough listings with both fields to mean anything.
  const withBoth = warehouses
    .filter((w) => typeof w.size === 'number' && w.size > 100 && typeof w.rate === 'number')
    .sort((a, b) => (a.size as number) - (b.size as number));
  const half = Math.floor(withBoth.length / 2);
  const smallRent = withBoth.length >= 6 ? median(withBoth.slice(0, half).map((w) => w.rate as number)) : null;
  const largeRent = withBoth.length >= 6 ? median(withBoth.slice(-half).map((w) => w.rate as number)) : null;

  const typeCount = (re: RegExp) =>
    warehouses.filter((w) => w.warehouseType && re.test(w.warehouseType)).length;

  const medianRent = median(rates);
  return {
    count: warehouses.length,
    count_plus: warehouses.length >= 10 ? `${warehouses.length}+` : String(warehouses.length),
    min_size: sizes.length ? fmtSqft(Math.min(...sizes)) : null,
    max_size: sizes.length ? fmtSqft(Math.max(...sizes)) : null,
    min_rent: rates.length ? fmtRent(Math.min(...rates)) : null,
    max_rent: rates.length ? fmtRent(Math.max(...rates)) : null,
    median_rent: medianRent !== null ? fmtRent(medianRent) : null,
    small_rent: smallRent !== null ? fmtRent(smallRent) : null,
    large_rent: largeRent !== null ? fmtRent(largeRent) : null,
    min_height: heights.length ? String(Math.min(...heights)) : null,
    max_height: heights.length ? String(Math.max(...heights)) : null,
    count_peb: typeCount(/peb/i),
    count_rcc: typeCount(/rcc/i),
    count_shed: typeCount(/shed/i),
    count_coldstorage: typeCount(/cold/i),
    count_compliant: warehouses.filter((w) => w.fireCompliance).length,
  };
};

/**
 * Fill {token} placeholders from stats. Returns null when the template
 * references a stat we couldn't compute — the caller should drop that block
 * instead of rendering half-filled copy (content-doc Rule #1).
 */
export const fillLocationTemplate = (template: string, stats: LocationStats): string | null => {
  let missing = false;
  const filled = template.replace(/\{(\w+)\}/g, (raw, key: string) => {
    const value = stats[key as keyof LocationStats];
    if (value === null || value === undefined) {
      missing = true;
      return raw;
    }
    return String(value);
  });
  return missing ? null : filled;
};
