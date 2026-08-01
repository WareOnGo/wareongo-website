import { useEffect } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { claimReloadAttempt } from '@/lib/staleDeployReload';

// Reloading is a real fix here, not a shrug: prerendered pages inline their loader
// payload as window.__staticRouterHydrationData, so a fresh load of one of these
// URLs skips the loader entirely. Anything that failed *during* a client-side
// navigation — a dead static-loader-data hash after a deploy, a backend blip, a
// dropped connection — is therefore likely to come back clean on reload.
//
// The exception is a thrown Response: a genuine 404/500 from a loader reproduces
// exactly, so reloading just costs the user a page load to reach the same screen.
const shouldAutoReload = (error: unknown): boolean => !isRouteErrorResponse(error);

const RouteErrorBoundary = () => {
  const error = useRouteError();

  useEffect(() => {
    console.error('Route error:', error);
    if (typeof window === 'undefined' || !shouldAutoReload(error)) return;
    if (!claimReloadAttempt(`route:${window.location.pathname}`)) {
      // Already burned this path's one reload — the failure is sticking around.
      console.error('Route error persisted across a reload; not retrying again.');
      return;
    }
    window.location.reload();
  }, [error]);

  const status = isRouteErrorResponse(error) ? error.status : null;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHead
        title="Something went wrong | WareOnGo"
        description="This page didn't load correctly. Please try again."
        path="/404"
        noindex
      />
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12">
        <h1 className="text-4xl font-bold text-wareongo-blue mb-4">
          {status === 404 ? '404' : 'Something went wrong'}
        </h1>
        <p className="text-xl mb-8 max-w-md">
          {status === 404
            ? 'Page not found'
            : "This page didn't load correctly. Reloading usually fixes it."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="btn-primary">
            Reload page
          </Button>
          <Button asChild variant="outline">
            <Link to="/listings">Browse all warehouses</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RouteErrorBoundary;
