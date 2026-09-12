import { useEffect } from 'react';
import { beginAnalyticsClick, pageType, safeUrl, trackEvent, wasAnalyticsClickHandled } from '@/lib/analytics';

/** Covers public links, including CMS-rendered content; explicit handlers take precedence. */
export default function AnalyticsInteractions() {
  useEffect(() => {
    const capture = () => beginAnalyticsClick();
    const click = (event: MouseEvent) => {
      if (wasAnalyticsClickHandled() || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.closest('[data-analytics-ignore]')) return;
      const href = link.getAttribute('href') || '';
      const placement = link.closest<HTMLElement>('[data-analytics-placement]')?.dataset.analyticsPlacement
        || (link.closest('footer') ? 'footer' : link.closest('header,nav') ? 'navigation' : `${pageType(location.pathname)}_${link.closest('section[id]')?.id || 'content'}`);
      const label = (link.getAttribute('aria-label') || link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
      if (/^(tel:|mailto:)|wa\.me|api\.whatsapp\.com/i.test(href)) {
        const method = href.startsWith('tel:') ? 'phone' : href.startsWith('mailto:') ? 'email' : 'whatsapp';
        trackEvent('contact_click', { placement, contact_method: method, contact_target: `sales_${method}` });
        return;
      }
      if (href.startsWith('#')) {
        const section = href.slice(1).replace(/[^a-z0-9_-]/gi, '').slice(0, 60);
        if (section) trackEvent('cta_click', { placement, cta_id: `scroll_${section}`, section_id: section, action: 'scroll', destination: location.pathname, label });
        return;
      }
      const url = safeUrl(href, false);
      if (!url) return;
      const target = new URL(url);
      const destination = target.origin === location.origin ? target.pathname : url;
      if (target.pathname === '/request-warehouse') {
        trackEvent('cta_click', { placement, cta_id: 'request_warehouse', destination, label });
      } else if (/^\/(blogs|casestudies)\//.test(target.pathname)) {
        trackEvent('select_content', { placement, destination, content_type: target.pathname.startsWith('/blogs/') ? 'blog' : 'case_study', content_id: target.pathname.split('/').pop() });
      } else { trackEvent('nav_click', { placement, destination, label }); }
    };
    document.addEventListener('click', capture, true);
    document.addEventListener('click', click);
    document.addEventListener('auxclick', capture, true);
    document.addEventListener('auxclick', click);
    return () => {
      document.removeEventListener('click', capture, true); document.removeEventListener('click', click);
      document.removeEventListener('auxclick', capture, true); document.removeEventListener('auxclick', click);
    };
  }, []);
  return null;
}
