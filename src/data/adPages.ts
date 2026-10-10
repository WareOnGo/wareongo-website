import { parseAdPage } from '../../scripts/lib/ad-page-content.mjs';
import type initialContent from './ad-pages/bangalore.json';
import { adPages } from './adPages.generated';

export type AdPageContent = typeof initialContent;
export type AdPageCopy = AdPageContent['copy'];
export function getBangaloreAdPage(): AdPageContent {
  const content = adPages.find(page => page.slug === 'bangalore');
  if (!content) throw new Error('The Bangalore ad page is missing from the approved content.');
  return parseAdPage(content) as AdPageContent;
}
