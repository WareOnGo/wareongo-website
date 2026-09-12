import { useEffect, useRef } from 'react';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';

export function useListingResults(params: AnalyticsParams, ready = true) {
  const key = JSON.stringify(params);
  const last = useRef('');
  useEffect(() => {
    if (!ready || key === last.current) return;
    last.current = key;
    trackEvent('listing_results', JSON.parse(key));
  }, [key, ready]);
}
/** At least half the card must be visible. One impression per mounted list/page/card. */
export function useListingImpression<T extends HTMLElement = HTMLDivElement>(params: AnalyticsParams) {
  const ref = useRef<T>(null);
  const key = JSON.stringify(params);
  const seen = useRef('');
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined' || seen.current === key) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && document.visibilityState === 'visible') {
        seen.current = key; trackEvent('listing_impression', JSON.parse(key)); observer.disconnect();
      }
    }, { threshold: 0.5 });
    const node = ref.current;
    observer.observe(node);
    const resume = () => {
      if (document.visibilityState === 'visible' && seen.current !== key) { observer.unobserve(node); observer.observe(node); }
    };
    document.addEventListener('visibilitychange', resume);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', resume); };
  }, [key]);
  return ref;
}
