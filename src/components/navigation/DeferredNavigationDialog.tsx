import { lazy, Suspense, useEffect, useState } from 'react';
import type { NavigationDialogProps } from './NavigationDialog';

const NavigationDialog = lazy(() => import('./NavigationDialog'));

export default function DeferredNavigationDialog(props: NavigationDialogProps) {
  const [mounted, setMounted] = useState(props.view !== null);
  useEffect(() => { if (props.view !== null) setMounted(true); }, [props.view]);
  if (props.view === null && !mounted) return null;
  return (
    <Suspense fallback={<span role="status" className="sr-only">Loading navigation…</span>}>
      <NavigationDialog {...props} />
    </Suspense>
  );
}
