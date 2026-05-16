import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { config } from "@/config/config";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ListingsSkeleton,
  WarehouseDetailSkeleton,
} from "@/components/PageSkeletons";

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
  <GoogleOAuthProvider clientId={config.googleClientId}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <RouteTracker />
          <Outlet />
          <NavigationSkeleton />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default RootLayout;
