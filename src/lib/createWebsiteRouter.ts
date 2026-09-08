import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { publishedWarehouseLoader } from '@/loaders/publishedWarehouseLoader';

// vite-react-ssg replaces route loaders before calling customCreateRouter.
// Restore warehouse ID resolution here, after that replacement. Snapshot which
// routes actually had loaders BEFORE SSG mutates the original route objects.
// Otherwise its synthetic layout loaders race the warehouse loader and can
// throw on expired data before our bounded manifest refresh gets to repair it.
type AuthoredRoute = { hasLoader: boolean; children?: AuthoredRoute[] };

export function createWebsiteRouter(originalRoutes: RouteObject[]): typeof createBrowserRouter {
  const snapshot = (records: RouteObject[]): AuthoredRoute[] => records.map((route) => ({
    hasLoader: !!route.loader,
    children: route.children && snapshot(route.children),
  }));
  const authored = snapshot(originalRoutes);

  return (routes, options) => {
    let router: ReturnType<typeof createBrowserRouter> | undefined = undefined;
    if (document.querySelector('[data-server-rendered=true]')) {
      const restore = (records: RouteObject[], originals: AuthoredRoute[]) => {
        records.forEach((route, i) => {
          if (!originals[i].hasLoader) route.loader = undefined;
          else if (route.path === 'warehouse/:slug' && route.id) {
            route.loader = publishedWarehouseLoader(route.id, () => router?.state.navigation.location?.hash ?? '');
          }
          if (route.children && originals[i].children) restore(route.children, originals[i].children);
        });
      };
      restore(routes, authored);
    }
    // Dev retains the API loaders; other data routes retain their SSG loaders.
    router = createBrowserRouter(routes, options);
    return router;
  };
}
