import { useEffect, useState } from 'react';
import { trustedPreviewParent, containPreview } from '@/lib/cmsPreview';
import PageHead from '@/components/PageHead';
import BangaloreLanding from './BangaloreLanding';
import type { AdPageContent } from '@/data/adPages';
import { parseAdPage } from '../../scripts/lib/ad-page-content.mjs';
import { toast } from '@/hooks/use-toast';

const MESSAGE = 'wareongo:ad-page-preview';
const VIEWS = ['page', 'hero-success', 'contact', 'contact-success'] as const;
export type AdPreviewView = typeof VIEWS[number];
/** No draft URL, API or storage: only the authenticated CMS supplies this frame. */
export default function BangaloreAdPreview() {
  const [draft, setDraft] = useState<{ content: AdPageContent; origin: string; view: AdPreviewView } | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || !trustedPreviewParent(event.origin, window.location.hostname) || event.data?.type !== MESSAGE) return;
      if (event.data.action === 'init') {
        window.parent.postMessage({ type: MESSAGE, action: 'ready' }, event.origin);
      } else if (event.data.action === 'content') {
        try {
          const content = parseAdPage(event.data.content, { draft: true }) as AdPageContent;
          const view = event.data.view ?? 'page';
          if (!VIEWS.includes(view)) throw new Error('Unknown preview state');
          setDraft({ content, origin: event.origin, view });
        } catch { window.parent.postMessage({ type: MESSAGE, action: 'error' }, event.origin); }
      }
    };
    const release = containPreview();
    window.addEventListener('message', receive);
    // This handshake contains no content; the CMS checks this frame's origin
    // and Window before replying with a draft to an explicit target origin.
    if (window.parent !== window) window.parent.postMessage({ type: MESSAGE, action: 'ready' }, '*');
    return () => {
      window.removeEventListener('message', receive);
      release();
    };
  }, []);

  useEffect(() => {
    if (draft) window.parent.postMessage({ type: MESSAGE, action: 'rendered' }, draft.origin);
  }, [draft]);

  useEffect(() => {
    if (draft?.view !== 'contact-success') return;
    // Use the website's actual notification without submitting a lead.
    const notification = toast({ title: 'Success', description: draft.content.copy.contactSuccess, duration: Infinity });
    return () => { notification.dismiss(); };
  }, [draft?.view, draft?.content.copy.contactSuccess]);

  if (!draft) return <>
    <PageHead title="Bangalore page preview | WareOnGo" description="CMS page preview" path="/preview/ad-pages/bangalore" noindex />
    <p className="p-8 text-center text-sm text-wareongo-slate">Open this preview from Ad pages in the CMS.</p>
  </>;
  return <BangaloreLanding key={draft.view} content={draft.content} previewState={draft.view} />;
}
