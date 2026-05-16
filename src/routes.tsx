import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./RootLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AboutUs from "./pages/AboutUs";
import Listings from "./pages/Listings";
import WarehouseDetail from "./pages/WarehouseDetail";
import AdminPanel from "./pages/AdminPanel";
import UserDashboard from "./pages/UserDashboard";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import AdminRoute from "./components/AdminRoute";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import RequestWarehouse from "./pages/RequestWarehouse";
import LocationListings from "./pages/LocationListings";
import { caseStudies } from "./data/caseStudies";
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

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "terms-of-service", element: <TermsOfService /> },
      { path: "about-us", element: <AboutUs /> },
      { path: "request-warehouse", element: <RequestWarehouse /> },
      { path: "casestudies", element: <CaseStudies /> },
      {
        path: "casestudies/:slug",
        element: <CaseStudyDetail />,
        getStaticPaths: () => caseStudies.map((cs) => `/casestudies/${cs.slug}`),
      },
      { path: "listings", element: <Listings />, loader: listingsLoader },
      {
        path: "listings/city/:city",
        element: <LocationListings />,
        loader: cityListingsLoader,
        getStaticPaths: cityStaticPaths,
      },
      {
        path: "listings/city/:city/:type",
        element: <LocationListings />,
        loader: cityTypeListingsLoader,
        getStaticPaths: cityTypeStaticPaths,
      },
      {
        path: "listings/state/:state",
        element: <LocationListings />,
        loader: stateListingsLoader,
        getStaticPaths: stateStaticPaths,
      },
      {
        path: "listings/state/:state/:type",
        element: <LocationListings />,
        loader: stateTypeListingsLoader,
        getStaticPaths: stateTypeStaticPaths,
      },
      {
        // :slug carries the descriptive SEO slug with the warehouse ID at the end.
        // The loader parses the trailing number to do the actual lookup.
        path: "warehouse/:slug",
        element: <WarehouseDetail />,
        loader: warehouseLoader,
        getStaticPaths: warehouseStaticPaths,
      },
      // Auth-gated routes — pre-rendered as unauthenticated shells, hydrate client-side
      { path: "user-dashboard", element: <UserDashboard /> },
      { path: "unauthorized", element: <Unauthorized /> },
      { path: "login", element: <Login /> },
      // Static /404 page — emitted as dist/404/index.html then flattened to dist/404.html
      // by scripts/generate-sitemap.mjs so Vercel auto-serves it with HTTP 404 status.
      { path: "404", element: <NotFound /> },
      {
        element: <AdminRoute />,
        children: [{ path: "admin-panel", element: <AdminPanel /> }],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];
