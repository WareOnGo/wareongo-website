// Editorial content for micromarket overview pages, authored in the CMS
// (MicromarketPage table) and pulled into ./micromarkets.generated.ts at build
// time by scripts/generate-micromarkets.mjs. Same shape as ./blogs.ts — this
// module holds the types and re-exports the generated data, so importers never
// touch the generated file directly.
//
// Published rows produce /overview/{state}/{city}/{micromarket}. The existing
// /listings/city/{city}/{micromarket} route always renders the plain grid.
//
// Nothing here carries a number. Counts, rent and size ranges, the construction
// mix, compliance counts and the peer rent chart are all computed from live
// inventory in src/lib/micromarketStats.ts, so authored copy can never
// contradict the listings sitting underneath it on the same page.

// The content shape is shared with city and state pages — see ./editorial.ts —
// because one wireframe renders all three. Aliased here so existing importers
// of the Micromarket* names keep working.
export type {
  EditorialImage as MicromarketImage,
  EditorialFaq as MicromarketFaq,
  StatOverrides as MicromarketStatOverrides,
} from './editorial';
import type { EditorialContent } from './editorial';

export interface MicromarketContent extends EditorialContent {
  /** The {city} segment of /listings/city/{citySlug}/{slug}. */
  citySlug: string;
  /** The {micromarket} segment. Unique only within its parent city. */
  slug: string;
}


import { micromarkets as generated } from './micromarkets.generated';
import { DEV_MICROMARKETS } from './micromarkets.dev';
import { normalizeContentPunctuation } from '@/lib/contentPunctuation';

/**
 * CMS content, plus the dev placeholders when running under `vite dev`.
 *
 * `__DEV_SERVER__` is `command === 'serve'` (vite.config.ts), so this is
 * statically `false` in `build` and `build:dev` alike — Rollup drops the branch
 * and tree-shakes ./micromarkets.dev out of the bundle. It is not
 * `import.meta.env.DEV`, which would be true for `build:dev` and let the
 * placeholders ship.
 *
 * Real content wins on a slug collision, so a placeholder can never shadow a
 * page someone has actually written.
 */
const all: MicromarketContent[] = normalizeContentPunctuation(__DEV_SERVER__
  ? [
      ...generated,
      ...DEV_MICROMARKETS.filter(
        (d) => !generated.some((g) => g.citySlug === d.citySlug && g.slug === d.slug),
      ),
    ]
  : generated);

export { all as micromarkets };

/**
 * A micromarket is keyed by (citySlug, slug): the same locality tag can exist
 * under two cities, and only the parent city's URL is the one that resolves.
 */
export const getMicromarketContent = (
  citySlug: string,
  slug: string,
): MicromarketContent | undefined =>
  all.find((m) => m.citySlug === citySlug && m.slug === slug);
