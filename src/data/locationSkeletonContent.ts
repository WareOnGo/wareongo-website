import type { EditorialContent } from './editorial';
import type { LocationPageContent } from './locationPages';
import type { MicromarketContent } from './micromarkets';
import { locationSkeletons } from './locationSkeletons.generated';
import { micromarketSkeletons } from './micromarketSkeletons.generated';
import { DEV_LOCATION_PAGES } from './locationPages.dev';
import { DEV_MICROMARKETS } from './micromarkets.dev';
import { normalizeContentPunctuation } from '@/lib/contentPunctuation';
import { normalizeHeadingCase } from '@/lib/headingCase';

type HeroFields = 'h1' | 'heroEyebrow' | 'heroProse' | 'heroImage' | 'inventoryHeading';
export type LocationSkeletonContent = Pick<LocationPageContent, HeroFields | 'kind' | 'slug' | 'marketHeading' | 'marketProse' | 'marketImage' | 'citiesHeading' | 'stateCities'>;
export type MicromarketSkeletonContent = Pick<MicromarketContent, HeroFields | 'citySlug' | 'slug'>;
export type EditorialHeroContent = Pick<EditorialContent, 'h1' | 'heroEyebrow' | 'heroProse' | 'heroImage'>;

// Match the full content's dev-only placeholders and typography normalization.
// Type-only imports above never load full editorial collections in production.
const locations = normalizeHeadingCase(normalizeContentPunctuation(__DEV_SERVER__
  ? [...locationSkeletons, ...DEV_LOCATION_PAGES.filter(page => !locationSkeletons.some(saved => saved.kind === page.kind && saved.slug === page.slug))]
  : locationSkeletons));
const micromarkets = normalizeHeadingCase(normalizeContentPunctuation(__DEV_SERVER__
  ? [...micromarketSkeletons, ...DEV_MICROMARKETS.filter(page => !micromarketSkeletons.some(saved => saved.citySlug === page.citySlug && saved.slug === page.slug))]
  : micromarketSkeletons));

export const getLocationSkeletonContent = (kind: LocationPageContent['kind'], slug: string) => locations.find(page => page.kind === kind && page.slug === slug);
export const getMicromarketSkeletonContent = (citySlug: string, slug: string) => micromarkets.find(page => page.citySlug === citySlug && page.slug === slug);
