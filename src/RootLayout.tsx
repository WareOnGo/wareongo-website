import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ListingsSkeleton,
  WarehouseDetailSkeleton,
} from "@/components/PageSkeletons";

// Toaster pulls in @radix-ui/react-toast (~14 KB gz). Only mounted forms ever fire it,
// so defer the chunk until after the initial paint.
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));

const queryClient = new QueryClient();

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackEvent("page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
  return null;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Pending-navigation skeleton: react-router blocks the outgoing page until the
// next route's loader resolves. Instead of leaving the user staring at the old
// page, show a skeleton matched to the route they're heading to.
const skeletonForPath = (pathname: string) => {
  if (pathname.startsWith("/warehouse/")) return <WarehouseDetailSkeleton />;
  if (pathname.startsWith("/listings")) return <ListingsSkeleton />;
  return <ListingsSkeleton />;
};

const isLoaderRoute = (pathname: string) =>
  pathname.startsWith("/warehouse/") || pathname.startsWith("/listings");

const NavigationSkeleton = () => {
  const navigation = useNavigation();
  if (navigation.state !== "loading" || !navigation.location) return null;
  const target = navigation.location.pathname;
  if (!isLoaderRoute(target)) return null;
  return (
    <div className="fixed inset-0 z-40 bg-wareongo-ivory overflow-y-auto">
      <Navbar />
      {skeletonForPath(target)}
      <Footer />
    </div>
  );
};

const RootLayout = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <ScrollToTop />
      <RouteTracker />
      <Outlet />
      <NavigationSkeleton />
    </QueryClientProvider>
  </AuthProvider>
);

export default RootLayout;
