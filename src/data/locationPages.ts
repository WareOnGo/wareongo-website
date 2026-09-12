// CMS content for /overview/{state} and /overview/{state}/{city}.
// Listing routes continue to render their own warehouse grids.

import type { EditorialContent } from './editorial';
import type { LocationKind } from '@/services/locationsAPI';

export type { EditorialImage, EditorialFaq, StatOverrides } from './editorial';

export interface LocationPageContent extends EditorialContent {
  kind: LocationKind;
  /**
   * The URL segment. Unique only within its kind: "delhi", "puducherry" and
   * "goa" are each both a city and a state in this catalogue, and the two are
   * different pages with different inventory.
   */
  slug: string;
}

import { locationPages as generated } from './locationPages.generated';
import { DEV_LOCATION_PAGES } from './locationPages.dev';
import { normalizeContentPunctuation } from '@/lib/contentPunctuation';

/**
 * CMS content, plus the dev placeholders when running under `vite dev`.
 *
 * `__DEV_SERVER__` is `command === 'serve'` (vite.config.ts), so this is
 * statically `false` in `build` and `build:dev` alike — Rollup drops the branch
 * and tree-shakes ./locationPages.dev out of the bundle. It is not
 * `import.meta.env.DEV`, which would be true for `build:dev` and let the
 * placeholders ship.
 *
 * Real content wins on a collision, so a placeholder can never shadow a page
 * someone has actually written.
 */
const all: LocationPageContent[] = normalizeContentPunctuation(__DEV_SERVER__
  ? [
      ...generated,
      ...DEV_LOCATION_PAGES.filter(
        (d) => !generated.some((g) => g.kind === d.kind && g.slug === d.slug),
      ),
    ]
  : generated);

export { all as locationPages };

/** Keyed by (kind, slug) — see LocationPageContent.slug for why both are needed. */
export const getLocationPageContent = (
  kind: LocationKind,
  slug: string,
): LocationPageContent | undefined => all.find((l) => l.kind === kind && l.slug === slug);
