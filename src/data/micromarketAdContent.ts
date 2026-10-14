import type { AdPageCopy } from './adPages';

/** CMS-authored local copy. Shared sections and inventory are deliberately absent. */
export interface MicromarketAdContent {
  version: number;
  citySlug: string;
  slug: string;
  name: string;
  copy: Pick<AdPageCopy, 'heroHeading' | 'availableHeading' | 'locationsHeading' | 'areaHeading' | 'rentHeading' | 'seoTitle' | 'metaDescription'>;
  area: { whereItIs: string; whoItSuits: string };
  mapBylines: { slug: string; byline: string }[];
  rentGuide: { intro: string; description: string };
  faqs: { q: string; a: string }[];
}
