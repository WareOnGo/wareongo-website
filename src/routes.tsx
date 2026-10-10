import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./RootLayout";
import { listingShouldRevalidate } from "./lib/listingSearch";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { servicePages } from "./data/servicePages";
import { servicePath } from "./data/serviceCatalog";

// SSG replaces these loaders with generated JSON readers in production. Keep
// inventory fetching and build-only path discovery out of the entry bundle;
// development and static generation still run the original loaders on demand.
const warehouseLoaders = () => import('./loaders/warehouseLoader');
const locationLoaders = () => import('./loaders/locationLoader');
const bangaloreLoader = async () => (await import('./loaders/bangaloreLandingLoader')).bangaloreLandingLoader();

// vite-react-ssg's `lazy` accepts a function returning a module with a `Component` field.
// Wrap default-exported pages so we don't have to rename exports across the codebase.
const lazyDefault = (loader: () => Promise<{ default: React.ComponentType }>) =>
  async () => ({ Component: (await loader()).default });

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        // Pathless wrapper so loader/render failures anywhere below render the
        // boundary instead of react-router's raw "Unexpected Application Error!".
        // It has to sit *inside* RootLayout rather than on the root route: an
        // errorElement replaces its own route's element, which would strip
        // AuthProvider/QueryClientProvider out from under the boundary's Navbar.
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, lazy: lazyDefault(() => import("./pages/Index")) },
          { path: "privacy-policy", lazy: lazyDefault(() => import("./pages/PrivacyPolicy")) },
          { path: "terms-of-service", lazy: lazyDefault(() => import("./pages/TermsOfService")) },
          { path: "about-us", lazy: lazyDefault(() => import("./pages/AboutUs")) },
          { path: "request-warehouse", lazy: lazyDefault(() => import("./pages/RequestWarehouse")) },
          { path: "casestudies", lazy: lazyDefault(() => import("./pages/CaseStudies")) },
          {
            path: "casestudies/:slug",
            lazy: lazyDefault(() => import("./pages/CaseStudyDetail")),
            // Only the static build needs the entire content collection here.
            // Keep it out of the initial browser bundle for every route.
            getStaticPaths: async () => (await import("./data/caseStudies")).caseStudies.map((cs) => `/casestudies/${cs.slug}`),
          },
          // Informational blogs — intentionally unlinked from nav/footer ("hidden"),
          // but in sitemap.xml + llms.txt so search engines and AI assistants find them.
          { path: "blogs", lazy: lazyDefault(() => import("./pages/Blogs")) },
          {
            path: "blogs/:slug",
            lazy: lazyDefault(() => import("./pages/BlogDetail")),
            getStaticPaths: async () => (await import("./data/blogs")).blogs.map((g) => `/blogs/${g.slug}`),
          },
          {
            path: "listings",
            lazy: lazyDefault(() => import("./pages/Listings")),
            loader: async () => (await warehouseLoaders()).listingsLoader(),
            shouldRevalidate: listingShouldRevalidate,
          },
          {
            path: "listings/city/:city",
            lazy: lazyDefault(() => import("./pages/LocationListings")),
            loader: async args => (await locationLoaders()).cityListingsLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).cityStaticPaths(),
          },
          {
            // Shared slot: "peb"/"rcc" plus the micromarket (locality) pages
            // that nest under a city — cityTypeListingsLoader resolves both.
            path: "listings/city/:city/:type",
            lazy: lazyDefault(() => import("./pages/LocationListings")),
            loader: async args => (await locationLoaders()).cityTypeListingsLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).cityTypeStaticPaths(),
          },
          {
            path: "listings/state/:state",
            lazy: lazyDefault(() => import("./pages/LocationListings")),
            loader: async args => (await locationLoaders()).stateListingsLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).stateStaticPaths(),
          },
          {
            path: "listings/state/:state/:type",
            lazy: lazyDefault(() => import("./pages/LocationListings")),
            loader: async args => (await locationLoaders()).stateTypeListingsLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).stateTypeStaticPaths(),
          },
          {
            // :slug carries the descriptive SEO slug with the warehouse ID at the end.
            // The loader parses the trailing number to do the actual lookup.
            path: "warehouse/:slug",
            lazy: lazyDefault(() => import("./pages/WarehouseDetail")),
            loader: async args => (await warehouseLoaders()).warehouseLoader(args),
            getStaticPaths: async () => (await warehouseLoaders()).warehouseStaticPaths(),
          },
          // Auth-gated routes — pre-rendered as unauthenticated shells, hydrate client-side
          { path: "user-dashboard", lazy: lazyDefault(() => import("./pages/UserDashboard")) },
          { path: "unauthorized", lazy: lazyDefault(() => import("./pages/Unauthorized")) },
          { path: "login", lazy: lazyDefault(() => import("./pages/Login")) },
          // Static /404 page — emitted as dist/404/index.html then flattened to dist/404.html
          // by scripts/generate-sitemap.mjs so Vercel auto-serves it with HTTP 404 status.
          { path: "404", lazy: lazyDefault(() => import("./pages/NotFound")) },
          {
            lazy: lazyDefault(() => import("./components/AdminRoute")),
            children: [{ path: "admin-panel", lazy: lazyDefault(() => import("./pages/AdminPanel")) }],
          },
          { path: "*", lazy: lazyDefault(() => import("./pages/NotFound")) },
          {
            // Append new routes: SSG loader IDs depend on sibling positions,
            // and older tabs read the current deploy's loader-data manifest.
            // Router specificity ranks this above '*', regardless of position.
            path: "overview/:state/:city/:micromarket",
            lazy: lazyDefault(() => import("./pages/MicromarketOverview")),
            loader: async args => (await locationLoaders()).micromarketOverviewLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).micromarketOverviewStaticPaths(),
          },
          {
            path: "overview/:state",
            lazy: lazyDefault(() => import("./pages/MicromarketOverview")),
            loader: async args => (await locationLoaders()).stateOverviewLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).stateOverviewStaticPaths(),
          },
          {
            path: "overview/:state/:city",
            lazy: lazyDefault(() => import("./pages/MicromarketOverview")),
            loader: async args => (await locationLoaders()).cityOverviewLoader(args),
            shouldRevalidate: listingShouldRevalidate,
            getStaticPaths: async () => (await locationLoaders()).cityOverviewStaticPaths(),
          },
          {
            path: "services/:slug",
            lazy: lazyDefault(() => import("./pages/ServiceDetail")),
            getStaticPaths: () => servicePages.map(page => servicePath(page.slug)),
          },
          {
            path: "bangalore",
            lazy: lazyDefault(() => import("./pages/BangaloreLanding")),
            // lazyDefault hides the import from SSG's asset detection. Include
            // the page's styles in the initial HTML, before hydration.
            entry: "src/pages/BangaloreLanding.tsx",
            loader: bangaloreLoader,
          },
          {
            path: "preview/cms",
            lazy: lazyDefault(() => import("./pages/CmsPreview")),
            entry: "src/pages/CmsPreview.tsx",
          },
          {
            path: "preview/ad-pages/bangalore",
            lazy: lazyDefault(() => import("./pages/BangaloreAdPreview")),
            entry: "src/pages/BangaloreAdPreview.tsx",
            loader: bangaloreLoader,
          },
        ],
      },
    ],
  },
];
