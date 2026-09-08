import publishedPaths from './dist/warehouse-route-map.json';
import { warehouseRedirect } from './src/lib/warehouseRoutes.mjs';

export const config = { matcher: '/warehouse/:path*' };

// Vercel builds the frontend before bundling this middleware, so the map and
// HTML belong to the same deployment. Undefined continues to the static file.
export default function middleware(request: Request) {
  return warehouseRedirect(request, publishedPaths);
}
