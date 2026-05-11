declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsEvent = {
  event: string;
  [key: string]: unknown;
};

export const trackEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
};
