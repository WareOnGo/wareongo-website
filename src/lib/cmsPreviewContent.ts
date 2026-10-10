import { normalizeHeadingCase } from './headingCase';
import { normalizeContentPunctuation } from './contentPunctuation';
import type { Blog } from '@/data/blogs';
import type { ServicePage } from '@/data/servicePages';
import { SERVICE_PAGES } from '@/data/serviceCatalog';
import type { LegalContent } from '@/data/legalPages';
import type { LocationPageContent } from '@/data/locationPages';
import type { MicromarketContent } from '@/data/micromarkets';

export type CmsPreviewContent =
  | { type: 'blog'; content: Blog }
  | { type: 'service'; content: ServicePage }
  | { type: 'legal'; content: LegalContent }
  | { type: 'city' | 'state'; content: LocationPageContent }
  | { type: 'micromarket'; content: MicromarketContent };

// Match the CMS server-action request limit; a valid native save can exceed
// the separate AI writing import limit of 750 KB.
const MAX_PREVIEW_BYTES = 1_048_576;

/** Drafts allow unfinished text. They use the same display transforms as builds. */
export function readCmsPreview(value: unknown): CmsPreviewContent {
  if (!value || typeof value !== 'object' || new TextEncoder().encode(JSON.stringify(value)).byteLength > MAX_PREVIEW_BYTES) throw new Error('Invalid preview');
  const { type, content: input } = value as { type: string; content: Record<string, unknown> };
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid preview');
  // Native CMS schemas trim authored text on save. Optional editorial inputs
  // are empty strings in the form and absent/null in the published payload.
  const trim = (item: unknown): unknown => typeof item === 'string' ? item.trim()
    : Array.isArray(item) ? item.map(trim)
      : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, child]) => [key, trim(child)])) : item;
  const content = trim(input) as Record<string, unknown>;
  const strings = (...keys: string[]) => {
    if (keys.some(key => typeof content[key] !== 'string')) throw new Error('Invalid preview text');
  };
  const arrays = (...keys: string[]) => {
    if (keys.some(key => !Array.isArray(content[key]))) throw new Error('Invalid preview list');
  };
  strings('slug', 'seoTitle');
  if (type === 'blog' || type === 'service') {
    strings('title', 'summary', 'description');
    arrays('blocks', 'faqs');
    if (type === 'blog') {
      strings('dateModified');
      arrays('related');
      content.updated = content.dateModified;
      content.published = content.datePublished || undefined;
    } else if (!Object.prototype.hasOwnProperty.call(SERVICE_PAGES, String(content.slug))) throw new Error('Unknown service');
  } else if (type === 'legal') {
    strings('title', 'description', 'effectiveDate', 'updated', 'notice');
    arrays('blocks');
    if (!['privacy-policy', 'terms-of-service'].includes(String(content.slug))) throw new Error('Unknown legal page');
  } else if (['city', 'state', 'micromarket'].includes(type)) {
    strings('h1', 'metaDescription', 'heroProse');
    arrays('faqs', 'relatedBlogs');
    if (!/^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(String(content.slug))) throw new Error('Choose a location');
    if (type === 'micromarket') strings('citySlug');
    else content.kind = type === 'city' ? 'CITY' : 'STATE';
    for (const key of ['heroEyebrow', 'marketHeading', 'marketProse', 'rentsHeading', 'rentsProse', 'specHeading', 'specProse', 'inventoryHeading', 'corridorHeading', 'corridorProse', 'complianceHeading', 'complianceProse', 'citiesHeading']) {
      if (content[key] === '') content[key] = undefined;
    }
  } else throw new Error('Unknown preview type');
  return { type, content: normalizeHeadingCase(normalizeContentPunctuation(content)) } as unknown as CmsPreviewContent;
}
