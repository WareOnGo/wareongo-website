const CMS_ORIGINS = new Set(['https://cms.wareongo.com', 'https://wog-cms.vercel.app']);
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);

export function trustedPreviewParent(origin: string, hostname: string) {
  if (CMS_ORIGINS.has(origin)) return true;
  try { return LOOPBACK.has(hostname) && LOOPBACK.has(new URL(origin).hostname); }
  catch { return false; }
}

/** The preview can expand accordions and dialogs, but cannot submit or leave. */
export function containPreview() {
  const block = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
  const blockNavigation = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (link && !link.getAttribute('href')?.startsWith('#')) block(event);
  };
  document.addEventListener('submit', block, true);
  document.addEventListener('click', blockNavigation, true);
  document.addEventListener('auxclick', blockNavigation, true);
  return () => {
    document.removeEventListener('submit', block, true);
    document.removeEventListener('click', blockNavigation, true);
    document.removeEventListener('auxclick', blockNavigation, true);
  };
}
