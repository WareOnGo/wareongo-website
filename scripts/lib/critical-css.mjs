import Beasties from 'beasties';
import { AD_CITY_PAGES } from './micromarket-ad-content.mjs';

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
  const path = route.replace(/^\/+|\/+$/g, '');
  if (!/^bangalore(?:\/[a-z0-9-]+)?$/.test(path) && !Object.hasOwn(AD_CITY_PAGES, path)) return html;
  let result = html.replace(/<script type="module" async(?:="")?/g, '<script type="module" defer fetchpriority="low"');
  if (path !== 'bangalore') {
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    const bootstrap = html.match(/<script\b[^>]*\bid="wareongo-analytics-bootstrap"[^>]*>[\s\S]*?<\/script>/i)?.[0];
    if (title && bootstrap) {
      const early = bootstrap.replace('<script', `<script data-page-title="${title.replace(/"/g, '&quot;').replace(/</g, '&lt;')}"`);
      result = result.replace(bootstrap, '').replace(/<head\b[^>]*>/i, head => `${head}${early}`);
    }
  }
  // Encoding must precede large preloads, inline CSS and the analytics entry.
  const charset = result.match(/<meta\b[^>]*\bcharset\s*=[^>]*>/i)?.[0];
  if (charset) result = result.replace(charset, '').replace(/<head\b[^>]*>/i, head => `${head}${charset}`);
  return result;
}
