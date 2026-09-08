import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { indexWarehousePaths } from '../src/lib/warehouseRoutes.mjs';

export async function generateWarehouseRouteMap(dist = 'dist') {
  const manifest = JSON.parse(await fs.readFile(path.join(dist, 'static-loader-data-manifest-stable.json'), 'utf8'));
  const index = indexWarehousePaths(Object.keys(manifest));
  if (!Object.keys(index).length) throw new Error('No published warehouses; refusing to emit an empty redirect map');

  // Verify both sides of every target. A missing page/payload must fail the
  // build rather than ship a redirect to another 404 or a null detail page.
  for (const [id, pathname] of Object.entries(index)) {
    const html = path.join(dist, pathname.slice(1), 'index.html');
    await fs.access(html);
    const dataFile = manifest[pathname];
    if (typeof dataFile !== 'string' || !dataFile.startsWith('static-loader-data/') || dataFile.includes('..')) {
      throw new Error(`Invalid loader data path for ${pathname}`);
    }
    const data = JSON.parse(await fs.readFile(path.join(dist, dataFile), 'utf8'));
    if (!Object.values(data).some((value) => value && value.id === Number(id))) {
      throw new Error(`Warehouse ${id} has no matching published loader data`);
    }
  }

  const json = JSON.stringify(index);
  await fs.writeFile(path.join(dist, 'warehouse-route-map.json'), json + '\n');
  console.log(`[warehouse-routes] ${Object.keys(index).length} published destinations, ${Buffer.byteLength(json)} bytes`);
  return index;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  generateWarehouseRouteMap().catch((error) => {
    console.error('[warehouse-routes]', error.message);
    process.exitCode = 1;
  });
}
