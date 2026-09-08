export type WarehousePathIndex = Record<string, string>;
export function warehouseIdFromPath(pathname: string): number | null;
export function indexWarehousePaths(paths: Iterable<string>): WarehousePathIndex;
export function warehouseRedirect(request: Request, index: WarehousePathIndex): Response | undefined;
