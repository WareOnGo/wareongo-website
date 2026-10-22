import type initialContent from './ad-pages/bangalore.json';
import { adPages } from './adPages.generated';

type CityAdContent = typeof initialContent;
/** Micromarket pages may follow the rent introduction with titled sections. */
export type AdPageContent = Omit<CityAdContent, 'rentGuide'> & {
  rentGuide: CityAdContent['rentGuide'] & { sections?: { title: string; body: string }[] };
};
export type AdPageCopy = AdPageContent['copy'];
export function getBangaloreAdPage(): AdPageContent {
  const content = adPages.find(page => page.slug === 'bangalore');
  if (!content) throw new Error('The Bangalore ad page is missing from the approved content.');
  // The generator validates and migrates approved content before publishing it.
  // Keep that build/CMS-only work (and its duplicate defaults) out of this route.
  return content;
}
