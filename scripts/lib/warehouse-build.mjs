import fs from 'node:fs/promises';

export const WAREHOUSE_BUILD_FILE = 'src/data/warehouse-build.generated.json';

export function highestWarehouseId(warehouses) {
  if (!warehouses.length) throw new Error('No warehouses; refusing to publish an empty build cutoff');
  let maxId = 0;
  for (const { id } of warehouses) {
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) throw new Error(`Invalid warehouse ID: ${id}`);
    maxId = Math.max(maxId, id);
  }
  return maxId;
}

export async function readWarehouseBuildMaxId() {
  const { maxId } = JSON.parse(await fs.readFile(WAREHOUSE_BUILD_FILE, 'utf8'));
  return highestWarehouseId([{ id: maxId }]);
}
