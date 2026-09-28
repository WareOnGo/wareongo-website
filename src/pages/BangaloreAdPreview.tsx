import { useEffect, useState } from 'react';
import PageHead from '@/components/PageHead';
import BangaloreLanding from './BangaloreLanding';
import type { AdPageContent } from '@/data/adPages';
import { parseAdPage } from '../../scripts/lib/ad-page-content.mjs';

const MESSAGE = 'wareongo:ad-page-preview';
const CMS_ORIGINS = new Set(['https://cms.wareongo.com', 'https://wog-cms.vercel.app']);
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);

function trustedParent(origin: string) {
  if (CMS_ORIGINS.has(origin)) return true;
  // A local website can preview a local CMS; production never trusts arbitrary
  // localhost pages or other projects hosted under vercel.app.
  try { return LOOPBACK.has(window.location.hostname) && LOOPBACK.has(new URL(origin).hostname); }
  catch { return false; }
}

/** No draft URL, API or storage: only the authenticated CMS supplies this frame. */
export default function BangaloreAdPreview() {
  const [draft, setDraft] = useState<{ content: AdPageContent; origin: string } | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || !trustedParent(event.origin) || event.data?.type !== MESSAGE) return;
      if (event.data.action === 'init') {
        window.parent.postMessage({ type: MESSAGE, action: 'ready' }, event.origin);
      } else if (event.data.action === 'content') {
        try {
          const content = parseAdPage(event.data.content, { draft: true }) as AdPageContent;
          setDraft({ content, origin: event.origin });
        } catch { window.parent.postMessage({ type: MESSAGE, action: 'error' }, event.origin); }
      }
    };
    // Install before rendering the real forms, including their portal dialogs.
    const blockSubmit = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
    const blockNavigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href]');
      if (link && !link.getAttribute('href')?.startsWith('#')) blockSubmit(event);
    };
    window.addEventListener('message', receive);
    document.addEventListener('submit', blockSubmit, true);
    document.addEventListener('click', blockNavigation, true);
    document.addEventListener('auxclick', blockNavigation, true);
    // This handshake contains no content; the CMS checks this frame's origin
    // and Window before replying with a draft to an explicit target origin.
    if (window.parent !== window) window.parent.postMessage({ type: MESSAGE, action: 'ready' }, '*');
    return () => {
      window.removeEventListener('message', receive);
      document.removeEventListener('submit', blockSubmit, true);
      document.removeEventListener('click', blockNavigation, true);
      document.removeEventListener('auxclick', blockNavigation, true);
    };
  }, []);

  useEffect(() => {
    if (draft) window.parent.postMessage({ type: MESSAGE, action: 'rendered' }, draft.origin);
  }, [draft]);

  if (!draft) return <>
    <PageHead title="Bangalore page preview | WareOnGo" description="CMS page preview" path="/preview/ad-pages/bangalore" noindex />
    <p className="p-8 text-center text-sm text-wareongo-slate">Open this preview from Ad pages in the CMS.</p>
  </>;
  return <BangaloreLanding content={draft.content} />;
}
