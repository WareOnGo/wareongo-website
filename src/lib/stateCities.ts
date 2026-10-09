import type { StateCityEntry } from '@/services/cityOverview';

/** What the list needs to know about one of our cities in the state. */
export interface StateCityCandidate { name: string; slug: string; listings: number; hasPage: boolean }

/** Busiest first, then by name: the default list's order and the "other cities" line's. */
const byListings = (a: StateCityCandidate, b: StateCityCandidate) =>
  b.listings - a.listings || a.name.localeCompare(b.name);

/**
 * Which cities a state page lists, shared by its loader and its loading layout.
 *
 * The editor's list when it has entries, else the four cities with the most
 * listings. Each entry resolves to one of our cities by slug; an entry without
 * one (a city outside our listings) keeps only its name and photo. `others` are
 * the remaining cities with listing pages, busiest first.
 */
export function resolveStateCities<C extends StateCityCandidate>(entries: StateCityEntry[] | null | undefined, candidates: C[]) {
  const sorted = [...candidates].sort(byListings);
  const chosen = entries?.filter(entry => typeof entry?.name === 'string' && entry.name.trim()).slice(0, 8);
  const list = (chosen?.length ? chosen : sorted.slice(0, 4).map(c => ({ name: c.name, slug: c.slug, image: null })))
    .map(entry => ({ name: entry.name.trim(), image: entry.image ?? null,
      city: entry.slug ? sorted.find(c => c.slug === entry.slug) : undefined }));
  const listed = new Set(list.flatMap(entry => entry.city ? [entry.city.slug] : []));
  return { list, others: sorted.filter(c => c.hasPage && !listed.has(c.slug)) };
}
