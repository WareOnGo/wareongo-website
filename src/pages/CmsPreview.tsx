import { Component, useEffect, useState, type ReactNode } from 'react';
import PageHead from '@/components/PageHead';
import BlogDetail from './BlogDetail';
import ServiceDetail from './ServiceDetail';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import EditorialLocationPage from './EditorialLocationPage';
import { readCmsPreview, type CmsPreviewContent } from '@/lib/cmsPreviewContent';
import { containPreview, trustedPreviewParent } from '@/lib/cmsPreview';
import { previewEditorialPage, type EditorialPageData } from '@/loaders/locationLoader';

const MESSAGE = 'wareongo:cms-preview';
type Draft = { value: CmsPreviewContent; editorial?: EditorialPageData; origin: string; revision: number };
const reply = (origin: string, action: string) => window.parent.postMessage({ type: MESSAGE, action }, origin);

class PreviewBoundary extends Component<{ origin: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { reply(this.props.origin, 'error'); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function PreviewPage({ value, editorial }: Pick<Draft, 'value' | 'editorial'>) {
  if (value.type === 'blog') return <BlogDetail content={value.content} />;
  if (value.type === 'service') return <ServiceDetail content={value.content} />;
  if (value.type === 'legal') return value.content.slug === 'privacy-policy'
    ? <PrivacyPolicy content={value.content} /> : <TermsOfService content={value.content} />;
  return editorial ? <EditorialLocationPage data={editorial} /> : null;
}

function Rendered({ draft }: { draft: Draft }) {
  useEffect(() => { reply(draft.origin, 'rendered'); }, [draft]);
  return <PreviewPage value={draft.value} editorial={draft.editorial} />;
}

/** Content stays in this frame's memory; there is no draft URL, API or storage. */
export default function CmsPreview() {
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => {
    let revision = 0;
    let mounted = true;
    const release = containPreview();
    const receive = async (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent || !trustedPreviewParent(event.origin, window.location.hostname) || event.data?.type !== MESSAGE) return;
      if (event.data.action === 'init') reply(event.origin, 'ready');
      if (event.data.action !== 'content') return;
      const current = ++revision;
      try {
        const value = readCmsPreview(event.data.content);
        const editorial = ['city', 'state', 'micromarket'].includes(value.type)
          ? await previewEditorialPage(value) : undefined;
        if (mounted && current === revision) setDraft({ value, editorial, origin: event.origin, revision: current });
      } catch {
        if (mounted && current === revision) reply(event.origin, 'error');
      }
    };
    window.addEventListener('message', receive);
    if (window.parent !== window) window.parent.postMessage({ type: MESSAGE, action: 'ready' }, '*');
    return () => { mounted = false; revision++; release(); window.removeEventListener('message', receive); };
  }, []);
  if (!draft) return <>
    <PageHead title="Website preview | WareOnGo" description="CMS page preview" path="/preview/cms" noindex />
    <p className="p-8 text-center text-sm text-wareongo-slate">Open this preview from the CMS.</p>
  </>;
  return <PreviewBoundary key={draft.revision} origin={draft.origin}><Rendered draft={draft} /></PreviewBoundary>;
}
