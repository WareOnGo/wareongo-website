import type { BlogBlock, BlogFaq } from './blogs';
import type { ServiceSlug } from './serviceCatalog';
import { servicePages as generated } from './servicePages.generated';
import { normalizeContentPunctuation } from '@/lib/contentPunctuation';

export interface ServicePage {
  slug: ServiceSlug;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  keywords: string[];
  blocks: BlogBlock[];
  faqs: BlogFaq[];
}

export const servicePages: ServicePage[] = normalizeContentPunctuation(generated);
export const getServiceBySlug = (slug: string) => servicePages.find(p => p.slug === slug);
