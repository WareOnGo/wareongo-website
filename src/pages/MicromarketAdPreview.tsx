import { useEffect, useMemo, useState } from 'react';
import { trustedPreviewParent, containPreview } from '@/lib/cmsPreview';
import PageHead from '@/components/PageHead';
import BangaloreLanding from './BangaloreLanding';
import type { AdPreviewView } from './BangaloreAdPreview';
import { getBangaloreAdPage } from '@/data/adPages';
import type { MicromarketAdContent } from '@/data/micromarketAdContent';
import { configureMicromarketAdPage, micromarketAdContent, type MicromarketLandingData } from '@/data/micromarketAdPages';
import { loadMicromarketAdInventory } from '@/loaders/micromarketLandingLoader';
import { parseMicromarketAdPage, createMicromarketAdTemplate } from '../../scripts/lib/micromarket-ad-content.mjs';
import { toast } from '@/hooks/use-toast';

const MESSAGE = 'wareongo:micromarket-ad-preview';
const VIEWS: AdPreviewView[] = ['page', 'hero-success', 'contact', 'contact-success'];

/** Unsaved local copy stays in memory. Inventory reads never submit a lead. */
export default function MicromarketAdPreview() {
  const [draft, setDraft] = useState<{ content: MicromarketAdContent; origin: string; view: AdPreviewView } | null>(null);
  const [inventory, setInventory] = useState<{ identity: string; data: MicromarketLandingData } | null>(null);
  const page = useMemo(() => draft ? configureMicromarketAdPage(draft.content) : null, [draft]);
  const identity = page ? JSON.stringify([page.citySlug, page.slug, page.name]) : '';
  const origin = draft?.origin;

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || !trustedPreviewParent(event.origin, window.location.hostname) || event.data?.type !== MESSAGE) return;
      if (event.data.action === 'init') window.parent.postMessage({ type: MESSAGE, action: 'ready' }, event.origin);
      else if (event.data.action === 'content') {
        try {
          const content = parseMicromarketAdPage(event.data.content, { draft: true }) as MicromarketAdContent;
          const view = event.data.view ?? 'page';
          if (!VIEWS.includes(view)) throw new Error('Unknown preview state');
          setDraft({ content, origin: event.origin, view });
        } catch { window.parent.postMessage({ type: MESSAGE, action: 'error' }, event.origin); }
      }
    };
    const release = containPreview();
    window.addEventListener('message', receive);
    if (window.parent !== window) window.parent.postMessage({ type: MESSAGE, action: 'ready' }, '*');
    return () => { window.removeEventListener('message', receive); release(); };
  }, []);

  useEffect(() => {
    if (!identity || !origin) return;
    const [citySlug, slug, name] = JSON.parse(identity) as string[];
    // Local prose changes keep the same inventory snapshot during a preview.
    const market = configureMicromarketAdPage(createMicromarketAdTemplate({ citySlug, slug, name }));
    const controller = new AbortController();
    loadMicromarketAdInventory(market, controller.signal, true).then(data => {
      if (!controller.signal.aborted) setInventory({ identity, data });
    }).catch(() => {
      if (!controller.signal.aborted) window.parent.postMessage({ type: MESSAGE, action: 'error' }, origin);
    });
    return () => controller.abort();
  }, [identity, origin]);

  const data = inventory?.identity === identity ? inventory.data : null;
  const content = page && data ? micromarketAdContent(getBangaloreAdPage(), page, data) : null;
  const successMessage = content?.copy.contactSuccess;
  useEffect(() => {
    if (draft && data) window.parent.postMessage({ type: MESSAGE, action: 'rendered' }, draft.origin);
  }, [draft, data]);
  useEffect(() => {
    if (draft?.view !== 'contact-success' || !successMessage) return;
    const notification = toast({ title: 'Success', description: successMessage, duration: Infinity });
    return () => { notification.dismiss(); };
  }, [draft?.view, successMessage]);

  if (!draft || !page || !data || !content) return <>
    <PageHead title="Micromarket ad preview | WareOnGo" description="CMS page preview" path="/preview/ad-pages/micromarket" noindex />
    <p className="p-8 text-center text-sm text-wareongo-slate">{draft ? 'Loading current warehouse inventory…' : 'Open this preview from Micromarket ad pages in the CMS.'}</p>
  </>;
  return <BangaloreLanding key={identity + ':' + draft.view} content={content} market={{ page, data }} previewState={draft.view} />;
}
