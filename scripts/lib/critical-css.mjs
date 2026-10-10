import Beasties from 'beasties';

const options = {
  preload: 'media', noscriptFallback: true, pruneSource: false,
  reduceInlineStyles: false, inlineFonts: true,
  allowRules: [/\.wog-nav-header:has\(/], preloadFonts: false,
};

// Beasties 0.1 shares its class/id selector cache across documents and instances.
// Every SSG and paginated catalogue page must use this one queue: overlapping
// process() calls can otherwise remove another page's critical layout rules.
let queue = Promise.resolve();
export function createCriticalCssProcessor({ path = 'dist', ...overrides } = {}) {
  const processor = new Beasties({ path, logLevel: 'warn', ...options, ...overrides });
  return html => {
    const result = queue.then(() => processor.process(html));
    queue = result.catch(() => {});
    return result;
  };
}

export function prioritizeAdPageHtml(route, html) {
  // Ordinary SSG routes omit the leading slash; explicitly included routes
  // and dynamic paths may include it. Both must get the same production HTML.
  if (route.replace(/^\/+|\/+$/g, '') !== 'bangalore') return html;
  return html.replace(/<script type="module" async(?:="")?/g, '<script type="module" defer fetchpriority="low"');
}
