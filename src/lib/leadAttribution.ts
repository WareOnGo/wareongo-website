const STORAGE_KEY = 'wareongo:lead:gclid';
const validGclid = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,512}$/.test(value);

/** Retain the latest Google click ID across navigation in this browser session.
 * Keep this separate from analytics URL filtering, which can shorten click IDs.
 * Only attribution is stored here; never form/contact values.
 */
export function getLeadAttribution(): { gclid?: string; pagePath?: string } {
  if (typeof window === 'undefined') return {};
  // The inline analytics entry and React can load separate copies of this module.
  // Share the current document's value even when sessionStorage is unavailable.
  const state = window as Window & { __wareongoLeadGclid?: string };
  const pagePath = window.location.pathname;
  if (/^\/preview(?:\/|$)/.test(pagePath)) return { pagePath };
  const incoming = new URL(window.location.href).searchParams.get('gclid');
  if (validGclid(incoming)) {
    state.__wareongoLeadGclid = incoming;
    try { window.sessionStorage.setItem(STORAGE_KEY, incoming); } catch { /* Storage may be blocked. */ }
  } else if (!validGclid(state.__wareongoLeadGclid)) {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (validGclid(saved)) state.__wareongoLeadGclid = saved;
    } catch { /* The current document can still submit without storage. */ }
  }
  return { ...(validGclid(state.__wareongoLeadGclid) ? { gclid: state.__wareongoLeadGclid } : {}), pagePath };
}
