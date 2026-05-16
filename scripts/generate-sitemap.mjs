import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchAllWarehouses, summarize, locationTypeCombos, warehouseSlug } from './lib/locations.mjs';

const SITE_URL = 'https://wareongo.com';
const today = new Date().toISOString().slice(0, 10);

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/listings', changefreq: 'daily', priority: '0.9' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.6' },
  { path: '/casestudies', changefreq: 'monthly', priority: '0.7' },
  { path: '/request-warehouse', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
];

// Keep in sync with src/data/caseStudies.tsx.
const CASE_STUDY_SLUGS = [
  'hyderabad-automobile-warehouse',
  'devanahalli-fssai-warehouse',
  'hoskote-royal-enfield-warehouse',
  'hyderabad-fire-compliant-warehouse',
  'kochi-3pl-warehouse',
];


function urlEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function flatten404() {
  // Vercel auto-serves dist/404.html with HTTP 404 for unmatched paths.
  // vite-react-ssg writes nested dist/404/index.html — copy to a flat file too.
  const nested = path.join('dist', '404', 'index.html');
  const flat = path.join('dist', '404.html');
  try {
    await fs.copyFile(nested, flat);
    console.log(`[404] copied ${nested} → ${flat}`);
  } catch (err) {
    console.warn('[404] nested 404 page not found; skipping flatten:', err?.message ?? err);
  }
}

async function main() {
  await flatten404();
  const warehouses = await fetchAllWarehouses();
  const warehousePaths = warehouses.map((w) => `/warehouse/${warehouseSlug(w)}`);
  const cities = summarize(warehouses, 'city');
  const states = summarize(warehouses, 'state');
  const cityTypeCombos = locationTypeCombos(warehouses, 'city');
  const stateTypeCombos = locationTypeCombos(warehouses, 'state');

  const entries = [
    ...STATIC_PATHS.map((p) => urlEntry(p.path, p.changefreq, p.priority)),
    ...CASE_STUDY_SLUGS.map((slug) => urlEntry(`/casestudies/${slug}`, 'monthly', '0.7')),
    ...cities.map((c) => urlEntry(`/listings/city/${c.slug}`, 'weekly', '0.8')),
    ...states.map((s) => urlEntry(`/listings/state/${s.slug}`, 'weekly', '0.7')),
    ...cityTypeCombos.map((c) =>
      urlEntry(`/listings/city/${c.location.slug}/${c.warehouseType.toLowerCase()}`, 'weekly', '0.7'),
    ),
    ...stateTypeCombos.map((c) =>
      urlEntry(`/listings/state/${c.location.slug}/${c.warehouseType.toLowerCase()}`, 'weekly', '0.6'),
    ),
    ...warehousePaths.map((p) => urlEntry(p, 'weekly', '0.8')),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
  const outPath = path.join('dist', 'sitemap.xml');
  await fs.writeFile(outPath, xml, 'utf8');
  console.log(
    `[sitemap] wrote ${outPath} — ${entries.length} URLs (${warehousePaths.length} warehouses, ${cities.length} cities, ${states.length} states, ${cityTypeCombos.length} city×type, ${stateTypeCombos.length} state×type)`,
  );
}

main().catch((err) => {
  console.error('[sitemap] generation failed:', err);
  process.exit(1);
});
