export type LegalSlug = 'privacy-policy' | 'terms-of-service';
export type LegalBlock =
  | { kind: 'h2' | 'h3'; text: string }
  | { kind: 'p'; text: string; compact?: boolean }
  | { kind: 'ul' | 'ol'; items: string[] };

export interface LegalContent {
  slug: LegalSlug;
  title: string;
  seoTitle: string;
  description: string;
  effectiveDate: string;
  updated: string;
  blocks: LegalBlock[];
  notice: string;
}

import { legalPages as generated } from './legalPages.generated';
import { normalizeContentPunctuation } from '@/lib/contentPunctuation';

const legalPages = normalizeContentPunctuation(generated);

export function getLegalPage(slug: LegalSlug): LegalContent {
  const page = legalPages.find(p => p.slug === slug);
  if (!page) throw new Error(`Missing required legal page: ${slug}`);
  return page;
}
