import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { API_BASE } from './lib/api.mjs';
import { fetchRead } from '../src/lib/fetchRead.mjs';
import { parseMicromarketAdPages } from './lib/micromarket-ad-content.mjs';

export async function generateMicromarketAdPages({ read = fetchRead, write = fs.writeFile, base = API_BASE } = {}) {
  const response = await read(base + '/ad-pages/micromarkets', {
    cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store' }, signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error('Micromarket ad pages API returned HTTP ' + response.status + '. Deploy the backend and seed Peenya first.');
  const pages = parseMicromarketAdPages((await response.json()).data);
  if (!pages.some(page => page.slug === 'peenya')) throw new Error('Approved Peenya ad content is missing; refusing to remove the existing page.');
  await write('src/data/micromarketAdPages.generated.ts', '// Generated from approved CMS micromarket ad pages.\nimport type { MicromarketAdContent } from "./micromarketAdContent";\nexport const micromarketAdPages: MicromarketAdContent[] = ' + JSON.stringify(pages, null, 2) + ';\n');
  await write('src/data/micromarketAdPaths.generated.ts', '// Generated with approved micromarket ad-page content; safe for the inline analytics bootstrap.\nexport const micromarketAdSlugs: readonly string[] = ' + JSON.stringify(pages.map(page => page.slug)) + ';\n');
  return pages;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateMicromarketAdPages().then(pages => console.log('[micromarket-ad-pages] wrote ' + pages.length + ' approved pages'))
    .catch(error => { console.error('[micromarket-ad-pages] generation failed:', error.message); process.exitCode = 1; });
}
