import { config } from '@/config/config';
import { fetchInventory } from '@/lib/fetchInventory.mjs';
import type { DerivedStats } from './derivedStats';

/**
 * Derived city and state data, read from the backend.
 *
 * The twin of ./micromarketsAPI.ts one and two levels up, and for the same
 * reason: the figures are derived once, on the backend
 * (services/locationService.js), and every consumer reads. The CMS reads the
 * same endpoint, so an editor cannot be shown a median the site would not
 * publish.
 */

export type LocationKind = 'CITY' | 'STATE';

export interface LocationStats extends DerivedStats {
  kind: LocationKind;
  /** Canonical display name, aliases resolved ("Bangalore" → "Bengaluru"). */
  name: string;
  /** The URL segment. Unique only within its kind — "delhi" is both a city and a state. */
  slug: string;
  /** Canonical page path, /listings/city/{slug} or /listings/state/{slug}. */
  path: string;
  /** Cities only: the state most of their listings sit in. */
  parentState: string | null;
  stateSlug: string | null;
  /**
   * Whether the CMS offers this one the editorial wireframe. Note what it does
   * not gate: every city and state page exists and renders its listing grid
   * whatever the count.
   */
  hasPage: boolean;
}

export interface LocationGates {
  locationPageMinListings: number;
}

interface LocationsPayload {
  cities: LocationStats[];
  states: LocationStats[];
}

let cache: LocationsPayload | null = null;

/**
 * Every city and state in the visible inventory, busiest first.
 *
 * Cached per process, which covers the two callers that matter: the SSG
 * prerender walks every location page in one build, and the dev server holds it
 * for the session.
 *
 * Throws on failure rather than returning empty lists. Empty would silently
 * drop the editorial layout from every page that has one and leave no trace in
 * the build log, which is far worse than a failed deploy — the same reasoning
 * as getMicromarkets.
 */
export async function getLocations(): Promise<LocationsPayload> {
  if (cache) return cache;
  const res = await fetchInventory(`${config.apiBaseUrl}/locations`, {}, import.meta.env.SSR);
  if (!res.ok) {
    throw new Error(`Failed to fetch locations: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data?: Partial<LocationsPayload> };
  if (!Array.isArray(json.data?.cities) || !Array.isArray(json.data?.states)) {
    throw new Error('Locations endpoint returned an unexpected shape');
  }
  cache = { cities: json.data.cities, states: json.data.states };
  return cache;
}

/** One location's figures, or null when the slug matches nothing in that kind. */
export async function locationStats(
  kind: LocationKind,
  slug: string,
): Promise<LocationStats | null> {
  const { cities, states } = await getLocations();
  const list = kind === 'CITY' ? cities : states;
  return list.find((l) => l.slug === slug) ?? null;
}

/** Only the ones with enough inventory to carry an editorial page. */
export async function eligibleLocations(kind: LocationKind): Promise<LocationStats[]> {
  const { cities, states } = await getLocations();
  return (kind === 'CITY' ? cities : states).filter((l) => l.hasPage);
}

export const locationPath = (l: Pick<LocationStats, 'kind' | 'slug'>) =>
  l.kind === 'CITY' ? `/listings/city/${l.slug}` : `/listings/state/${l.slug}`;

/** Overview URLs require sufficient inventory and, for cities, a known state. */
export const locationOverviewPath = (l: Pick<LocationStats, 'kind' | 'slug' | 'stateSlug' | 'hasPage'>): string | null => {
  if (!l.hasPage) return null;
  const segments = l.kind === 'STATE' ? [l.slug] : [l.stateSlug, l.slug];
  if (!segments.every(segment => segment && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))) return null;
  if (l.kind === 'STATE') return `/overview/${l.slug}`;
  return l.stateSlug ? `/overview/${l.stateSlug}/${l.slug}` : null;
};
