import { lazy, Suspense, useEffect, useState } from 'react';
import type { EdgeContactFormDialogProps } from './EdgeContactFormDialog';

const EdgeContactFormDialog = lazy(() => import('./EdgeContactFormDialog'));

/** Fetch optional dialog code on first use, then retain entered values on close. */
export default function DeferredEdgeContactFormDialog(props: EdgeContactFormDialogProps) {
  const [mounted, setMounted] = useState(props.open);
  useEffect(() => { if (props.open) setMounted(true); }, [props.open]);
  if (!props.open && !mounted) return null;
  return (
    <Suspense fallback={<span role="status" className="sr-only">Loading beta access form…</span>}>
      <EdgeContactFormDialog {...props} />
    </Suspense>
  );
}
