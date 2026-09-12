// Apply the site's punctuation style to CMS copy before both rendering and
// structured-data generation. Identifiers, dates and media URLs stay intact.
const COPY_FIELDS = new Set([
  'title', 'seoTitle', 'description', 'summary', 'author', 'keywords',
  'text', 'items', 'headers', 'rows', 'q', 'a', 'alt', 'caption', 'notice',
  'metaDescription', 'h1', 'heroEyebrow', 'heroProse', 'marketHeading',
  'marketProse', 'rentsHeading', 'rentsProse', 'specHeading', 'specProse',
  'inventoryHeading',
]);

export function normalizeCopyText(text: string, separator = ', '): string {
  if (/^\s*(?:\u2014|&mdash;|&#0*8212;|&#x0*2014;)\s*$/i.test(text)) return 'Not specified';
  // Preserve inline Markdown link destinations and literal URLs in prose.
  return text.split(/(\]\([^)]*\)|(?:https?:\/\/|mailto:)[^\s<>]+)/gi)
    .map((part, index) => index % 2 ? part
      : part.replace(/[ \t]*(?:\u2014|&mdash;|&#0*8212;|&#x0*2014;)[ \t]*/gi, separator))
    .join('');
}

export function normalizeContentPunctuation<T>(content: T): T {
  function visit(value: unknown, field: string): unknown {
    if (typeof value === 'string') {
      if (!COPY_FIELDS.has(field)) return value;
      const separator = /title|heading|^h1$/i.test(field) ? ': ' : ', ';
      return normalizeCopyText(value, separator);
    }
    if (Array.isArray(value)) return value.map(item => visit(item, field));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, visit(child, key)]));
    }
    return value;
  }
  return visit(content, '') as T;
}
