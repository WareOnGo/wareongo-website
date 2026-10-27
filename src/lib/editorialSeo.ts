import type { EditorialContent } from '@/data/editorial';
import { plainInlineText } from '@/lib/inline-format';

/** JSON-LD is raw script text: CMS copy must not be able to close its script tag. */
export const serializeEditorialLd = (value: object) => JSON.stringify(value).replace(/</g, '\\u003c');

/** Collapsed answers remain in the HTML, matching this structured data. */
export const editorialFaqLd = (faqs: EditorialContent['faqs']) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: plainInlineText(a) },
  })),
});
