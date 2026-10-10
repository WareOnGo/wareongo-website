import { lazy, Suspense, useEffect, useState } from 'react';
import type { ContactFormDialogProps } from './ContactFormDialog';

const ContactFormDialog = lazy(() => import('./ContactFormDialog'));

/** Fetch optional dialog code on first use, then retain entered values on close. */
export default function DeferredContactFormDialog(props: ContactFormDialogProps) {
  const [mounted, setMounted] = useState(props.open);
  useEffect(() => { if (props.open) setMounted(true); }, [props.open]);
  if (!props.open && !mounted) return null;
  return (
    <Suspense fallback={<span role="status" className="sr-only">Loading contact form…</span>}>
      <ContactFormDialog {...props} />
    </Suspense>
  );
}
