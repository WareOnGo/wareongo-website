import { config } from '@/config/config';
import { fetchInventory } from '@/lib/fetchInventory.mjs';

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

/**
 * The figure types are shared with cities and states — see ./derivedStats.ts —
 * because one wireframe renders all three. Re-exported here so the existing
 * importers of `Spread`, `MixEntry` and `PeerRent` keep working.
 */
export type { Spread, MixEntry, PeerRent, DerivedStats } from './derivedStats';
import type { DerivedStats } from './derivedStats';

export interface Micromarket extends DerivedStats {
  /** Display name, as the tagging data spells it. */
  name: string;
  /** The {micromarket} URL segment. */
  slug: string;
  parentCity: string | null;
  /** The {city} URL segment, or null when no city can host it. */
  citySlug: string | null;
  /** Canonical city geography, supplied by the backend for overview URLs. */
  parentState: string | null;
  stateSlug: string | null;
  /** Whether the site builds a page for this at all. */
  hasPage: boolean;
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
  const res = await fetchInventory(`${config.apiBaseUrl}/micromarkets`, {}, import.meta.env.SSR);
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

/** Separate namespace leaves /overview/:state and /:city available for later. */
export const micromarketOverviewPath = (
  m: Pick<Micromarket, 'stateSlug' | 'citySlug' | 'slug'>,
): string | null => {
  const segments = [m.stateSlug, m.citySlug, m.slug];
  return segments.every((segment) => segment && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))
    ? `/overview/${segments.join('/')}`
    : null;
};
