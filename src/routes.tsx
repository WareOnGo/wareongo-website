import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./RootLayout";
import Index from "./pages/Index";
import { caseStudies } from "./data/caseStudies";
import { guides } from "./data/guides";
import { warehouseLoader, warehouseStaticPaths, listingsLoader } from "./loaders/warehouseLoader";
import {
  cityListingsLoader,
  stateListingsLoader,
  cityStaticPaths,
  stateStaticPaths,
  cityTypeListingsLoader,
  stateTypeListingsLoader,
  cityTypeStaticPaths,
  stateTypeStaticPaths,
} from "./loaders/locationLoader";

// vite-react-ssg's `lazy` accepts a function returning a module with a `Component` field.
// Wrap default-exported pages so we don't have to rename exports across the codebase.
const lazyDefault = (loader: () => Promise<{ default: React.ComponentType }>) =>
  async () => ({ Component: (await loader()).default });

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "privacy-policy", lazy: lazyDefault(() => import("./pages/PrivacyPolicy")) },
      { path: "terms-of-service", lazy: lazyDefault(() => import("./pages/TermsOfService")) },
      { path: "about-us", lazy: lazyDefault(() => import("./pages/AboutUs")) },
      { path: "request-warehouse", lazy: lazyDefault(() => import("./pages/RequestWarehouse")) },
      { path: "casestudies", lazy: lazyDefault(() => import("./pages/CaseStudies")) },
      {
        path: "casestudies/:slug",
        lazy: lazyDefault(() => import("./pages/CaseStudyDetail")),
        getStaticPaths: () => caseStudies.map((cs) => `/casestudies/${cs.slug}`),
      },
      // Informational guides — intentionally unlinked from nav/footer ("hidden"),
      // but in sitemap.xml + llms.txt so search engines and AI assistants find them.
      { path: "guides", lazy: lazyDefault(() => import("./pages/Guides")) },
      {
        path: "guides/:slug",
        lazy: lazyDefault(() => import("./pages/GuideDetail")),
        getStaticPaths: () => guides.map((g) => `/guides/${g.slug}`),
      },
      {
        path: "listings",
        lazy: lazyDefault(() => import("./pages/Listings")),
        loader: listingsLoader,
      },
      {
        path: "listings/city/:city",
        lazy: lazyDefault(() => import("./pages/LocationListings")),
        loader: cityListingsLoader,
        getStaticPaths: cityStaticPaths,
      },
      {
        path: "listings/city/:city/:type",
        lazy: lazyDefault(() => import("./pages/LocationListings")),
        loader: cityTypeListingsLoader,
        getStaticPaths: cityTypeStaticPaths,
      },
      {
        path: "listings/state/:state",
        lazy: lazyDefault(() => import("./pages/LocationListings")),
        loader: stateListingsLoader,
        getStaticPaths: stateStaticPaths,
      },
      {
        path: "listings/state/:state/:type",
        lazy: lazyDefault(() => import("./pages/LocationListings")),
        loader: stateTypeListingsLoader,
        getStaticPaths: stateTypeStaticPaths,
      },
      {
        // :slug carries the descriptive SEO slug with the warehouse ID at the end.
        // The loader parses the trailing number to do the actual lookup.
        path: "warehouse/:slug",
        lazy: lazyDefault(() => import("./pages/WarehouseDetail")),
        loader: warehouseLoader,
        getStaticPaths: warehouseStaticPaths,
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
    ],
  },
];
