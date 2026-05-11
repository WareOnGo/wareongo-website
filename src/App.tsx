
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "@/context/AuthContext";
import { config } from "@/config/config";
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
import CaseStudy1 from "./pages/CaseStudy1";
import CaseStudy2 from "./pages/CaseStudy2";
import CaseStudies from "./pages/CaseStudies";
import RequestWarehouse from "./pages/RequestWarehouse";

const queryClient = new QueryClient();

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
  return null;
};

const App = () => (
  <GoogleOAuthProvider clientId={config.googleClientId}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <RouteTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/request-warehouse" element={<RequestWarehouse />} />
              <Route path="/case-study-1" element={<CaseStudy1 />} />
              <Route path="/case-study-2" element={<CaseStudy2 />} />
              <Route path="/casestudies" element={<CaseStudies />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/warehouse/:id" element={<WarehouseDetail />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-panel" element={<AdminPanel />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;
