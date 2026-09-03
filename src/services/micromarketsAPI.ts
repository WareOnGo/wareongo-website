import { config } from '@/config/config';

/**
 * Derived micromarket data, read from the backend.
 *
 * This module replaced three separate local derivations of the same thing — the
 * route loader's own summaries, the sitemap script's copy of them, and the CMS's
 * copy of both plus the statistics. Each had its own parsing rules for free-text
 * rates and clear heights. They agreed when written, which is precisely what
 * makes duplication dangerous: nothing announces the moment they stop agreeing,
 * and the symptom is the editor being shown one median while the site publishes
 * another.
 *
 * The backend owns the derivation now (services/micromarketService.js). Everything
 * here reads.
 */

export interface Spread {
  min: number;
  median: number;
  max: number;
}

export interface MixEntry {
  label: string;
  count: number;
  /** Share of the measured set, 0–100, rounded. */
  share: number;
}

/** One bar of the nearby-market chart. */
export interface PeerRent {
  name: string;
  slug: string;
  citySlug: string | null;
  medianRent: number;
  /** The page's own micromarket, highlighted in the chart. */
  isSelf: boolean;
}

export interface Micromarket {
  /** Display name, as the tagging data spells it. */
  name: string;
  /** The {micromarket} URL segment. */
  slug: string;
  parentCity: string | null;
  /** The {city} URL segment, or null when no city can host it. */
  citySlug: string | null;
  /** Whether the site builds a page for this at all. */
  hasPage: boolean;
  /** Everything tagged with this micromarket, land and build-to-suit included. */
  listings: number;
  /** Built stock only — what every figure below is computed from. */
  measured: number;
  /** Asking rent, ₹/sq ft/month, published min to max with no trimming. */
  rent: Spread | null;
  size: Spread | null;
  clearHeight: Spread | null;
  docksMedian: number | null;
  construction: MixEntry[];
  flooring: MixEntry[];
  fireNoc: number;
  commercialClu: number;
  /** Which warehouses belong to it, so the grid needs no tag matching here. */
  listingIds: number[];
  peers: PeerRent[];
}

/** The thresholds that decide which micromarkets get a page. Reported, not applied. */
export interface MicromarketGates {
  micromarketMinListings: number;
  parentCityMinListings: number;
}

let cache: Micromarket[] | null = null;

/**
 * Every micromarket in the visible inventory, busiest first.
 *
 * Cached per process, which covers the two callers that matter: the SSG
 * prerender walks every micromarket page in one build, and the dev server holds
 * it for the session.
 *
 * Throws on failure rather than returning []. An empty list would silently drop
 * forty-odd pages from the build and the sitemap, which is far worse than a
 * failed deploy — the same reasoning as fetchBlogs.
 */
export async function getMicromarkets(): Promise<Micromarket[]> {
  if (cache) return cache;
  const res = await fetch(`${config.apiBaseUrl}/micromarkets`);
  if (!res.ok) {
    throw new Error(`Failed to fetch micromarkets: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data?: Micromarket[] };
  if (!Array.isArray(json.data)) {
    throw new Error('Micromarkets endpoint returned an unexpected shape');
  }
  cache = json.data;
  return cache;
}

/** Only the ones the site builds a page for. */
export const buildableMicromarkets = async (): Promise<Micromarket[]> =>
  (await getMicromarkets()).filter((m) => m.hasPage);

/** Canonical page path — micromarkets nest under their parent city. */
export const micromarketPath = (m: Pick<Micromarket, 'citySlug' | 'slug'>) =>
  `/listings/city/${m.citySlug}/${m.slug}`;
