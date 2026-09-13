/** Public-site analytics. Never pass form values or raw API errors here. */
import { SERVICE_PAGES, servicePath } from '../data/serviceCatalog';

export type AnalyticsEvent = 'page_view' | 'nav_click' | 'cta_click' | 'contact_click'
  | 'listing_open' | 'view_listing' | 'listing_impression' | 'listing_results'
  | 'filter_apply' | 'filter_clear' | 'filter_open' | 'listings_paginate' | 'listing_page_size_change'
  | 'form_open' | 'lead_form_start' | 'form_attempt' | 'form_validation_error' | 'form_error'
  | 'form_close' | 'generate_lead' | 'listing_gallery_interaction' | 'faq_open'
  | 'select_content' | 'content_view_change' | 'content_load_error' | 'content_retry'
  | 'menu_toggle' | 'login' | 'login_error' | 'logout';
export interface AnalyticsParams {
  placement?: string; cta_id?: string; label?: string; destination?: string; action?: string; section_id?: string;
  page_type?: string; page_path?: string; page_location?: string; page_title?: string; page_referrer?: string;
  navigation_variant?: string; form_id?: string; lead_type?: string; lead_source?: string;
  warehouse_id?: string | number; origin_warehouse_id?: string | number; lead_id?: string;
  list_id?: string; list_position?: number; page?: number; page_size?: number; result_count?: number;
  total_count?: number; result_status?: string; trigger?: string; filter_count?: number;
  warehouse_city?: string; warehouse_state?: string; market_slug?: string; warehouse_type?: string | null;
  fire_noc?: boolean; min_sqft?: number; max_sqft?: number; size_sqft?: number; price_per_sqft?: number;
  from_page?: number; to_page?: number; direction?: string; from_page_size?: number;
  error_code?: string; field_id?: string; started?: boolean; submitted?: boolean;
  contact_method?: string; contact_target?: string; image_index?: number; question_id?: string;
  content_type?: string; content_id?: string; view_mode?: string; expanded?: boolean; method?: string;
  origin_cta_id?: string; origin_placement?: string; origin_page_path?: string;
  // Source-only compatibility fields: normalized before transport, never emitted as-is.
  position?: string | number; cta_location?: string; location?: string; source?: string;
  city?: string; state?: string; contact_type?: string; value?: string; address?: string;
}
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __WAREONGO_ANALYTICS_TEST__?: boolean;
  }
}
const ID = 'G-X1FJP93CV6';
const allowedHosts = new Set(['wareongo.com', 'www.wareongo.com']);
const servicePaths = new Set(Object.keys(SERVICE_PAGES).map(servicePath));
const isServicePath = (path: string) => servicePaths.has(path.replace(/\/$/, ''));
const isTest = () => typeof window !== 'undefined' && import.meta.env.DEV && window.__WAREONGO_ANALYTICS_TEST__ === true;
export const analyticsEnabled = () => typeof window !== 'undefined' && (isTest() || (import.meta.env.PROD && allowedHosts.has(window.location.hostname)));
export const pageType = (path: string) => path === '/' ? 'home' : path.startsWith('/warehouse/') ? 'warehouse_detail'
  : path.startsWith('/overview/') ? 'overview' : path.startsWith('/listings/') ? 'location_listings'
  : path === '/request-warehouse' ? 'request' : path.startsWith('/blogs/') ? 'blog'
  : path.startsWith('/casestudies/') ? 'case_study' : isServicePath(path) ? 'service' : path.slice(1).replace(/[^a-z0-9_]/gi, '_') || 'home';
// Only known discovery/acquisition keys; never forward arbitrary query values.
const queryKeys = new Set(['city', 'state', 'fire', 'type', 'minSqft', 'maxSqft', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid']);
export function safeUrl(raw: string, query = true): string {
  if (!raw) return '';
  try {
    const u = new URL(raw, 'https://wareongo.com');
    if (!/^https?:$/.test(u.protocol)) return '';
    u.username = ''; u.password = ''; u.hash = '';
    for (const [key, value] of [...u.searchParams]) {
      if (!query || !queryKeys.has(key) || value.length > 100 || /@|%40|\b\d{10,}\b/i.test(value)) u.searchParams.delete(key);
    }
    // Unknown paths can contain private values. Keep only known public path shapes.
    if (!isServicePath(u.pathname) && !/^\/(?:$|(?:warehouse|listings|overview|blogs|casestudies)(?:\/[a-z0-9-]+)*\/?$|(?:request-warehouse|about-us|privacy-policy|terms-of-service|login|unauthorized|404)\/?$)/i.test(u.pathname)) u.pathname = '/other';
    return u.toString();
  } catch { return ''; }
}
const slug = (s: string) => s.toLowerCase().replace(/bangalore/g, 'bengaluru').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 100);
let context: AnalyticsParams = {};
let lastUrl = '';
let initialized = false;
let clickHandled = false;
export const beginAnalyticsClick = () => { clickHandled = false; };
export const wasAnalyticsClickHandled = () => clickHandled;
function command(...args: unknown[]) {
  if (!analyticsEnabled()) return;
  window.dataLayer ||= [];
  // Keep Google's documented Arguments queue shape for a delayed gtag.js load.
  // eslint-disable-next-line prefer-rest-params
  window.gtag ||= function () { window.dataLayer!.push(arguments); };
  window.gtag(...args);
}
export function recordAnalyticsPage(title: string) {
  if (!analyticsEnabled()) return;
  const url = safeUrl(window.location.href);
  if (lastUrl === url) { context.page_title = title; command('set', { page_title: title }); return; }
  const previous = lastUrl || safeUrl(document.referrer, false);
  lastUrl = url;
  const parsed = new URL(url);
  context = { page_location: url, page_path: parsed.pathname + parsed.search, page_title: title, page_referrer: previous, page_type: pageType(parsed.pathname) };
  // Update the DOM and gtag defaults before Enhanced Measurement's history callback.
  document.title = title;
  command('set', context);
  if (!initialized) {
    initialized = true;
    command('js', new Date());
    command('config', ID, { send_page_view: true });
    if (!isTest()) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
      document.head.appendChild(script);
    }
  }
  // Subsequent page_view events belong exclusively to Enhanced Measurement.
}
const allowed = new Set(('placement cta_id label destination action section_id page_type page_path page_location page_title page_referrer navigation_variant form_id lead_type lead_source warehouse_id origin_warehouse_id lead_id list_id list_position page page_size result_count total_count result_status trigger filter_count warehouse_city warehouse_state market_slug warehouse_type fire_noc min_sqft max_sqft size_sqft price_per_sqft from_page to_page direction from_page_size error_code field_id started submitted contact_method contact_target image_index question_id content_type content_id view_mode expanded method origin_cta_id origin_placement origin_page_path').split(' '));
export function normalizeAnalytics(params: AnalyticsParams): AnalyticsParams {
  const p = { ...params };
  p.placement ||= p.cta_location || (typeof p.position === 'string' ? p.position : undefined);
  p.list_position ??= typeof p.position === 'number' ? p.position : undefined;
  p.warehouse_city ||= p.city;
  p.warehouse_state ||= p.state;
  p.contact_method ||= p.contact_type;
  if (p.contact_method) { p.contact_target ||= `sales_${p.contact_method}`; p.placement ||= p.location; }
  if (p.warehouse_city) p.warehouse_city = slug(p.warehouse_city);
  if (p.warehouse_state) p.warehouse_state = slug(p.warehouse_state);
  if (p.market_slug) p.market_slug = slug(p.market_slug);
  if (p.placement?.startsWith('header_')) { p.navigation_variant ||= p.placement.slice(7); p.placement = 'header'; }
  if (p.warehouse_id != null) p.warehouse_id = String(p.warehouse_id);
  if (p.origin_warehouse_id != null) p.origin_warehouse_id = String(p.origin_warehouse_id);
  if (p.destination?.startsWith('#')) { p.section_id ||= slug(p.destination.slice(1)); p.action ||= 'scroll'; }
  if (p.destination) p.destination = safeUrl(p.destination, false);
  if (p.page_location) p.page_location = safeUrl(p.page_location);
  if (p.page_referrer) p.page_referrer = safeUrl(p.page_referrer, false);
  for (const key of ['page_path', 'origin_page_path'] as const) {
    if (!p[key]) continue;
    const url = new URL(safeUrl(p[key], key === 'page_path'));
    p[key] = url.pathname + url.search;
  }
  return Object.fromEntries(Object.entries(p).filter(([k,v]) => allowed.has(k) && v !== undefined && v !== null && (typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)))).map(([k,v]) => [k, typeof v === 'string' ? v.slice(0, k.startsWith('page_') || k === 'destination' || k === 'origin_page_path' ? 1000 : 100) : v]));
}
const originKey = 'wareongo:lead-origin';
let originMemory: { at: number; context: AnalyticsParams } | null = null;
export function rememberLeadOrigin(params: AnalyticsParams) {
  const p = normalizeAnalytics(params);
  originMemory = { at: Date.now(), context: { origin_cta_id: p.cta_id || 'request_warehouse', origin_placement: p.placement || pageType(window.location.pathname), origin_page_path: new URL(safeUrl(window.location.href, false)).pathname } };
  try { sessionStorage.setItem(originKey, JSON.stringify(originMemory)); } catch { /* storage can be disabled */ }
}
export function takeLeadOrigin(): AnalyticsParams {
  if (typeof window === 'undefined') return {};
  try { originMemory ||= JSON.parse(sessionStorage.getItem(originKey) || 'null'); sessionStorage.removeItem(originKey); } catch { /* no storage */ }
  const saved = originMemory; originMemory = null;
  return saved && Date.now() - saved.at < 30 * 60_000 ? normalizeAnalytics(saved.context) : {};
}
export function trackEvent(event: AnalyticsEvent, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return;
  if (['nav_click', 'cta_click', 'contact_click', 'listing_open', 'select_content'].includes(event)) clickHandled = true;
  const p = normalizeAnalytics(params);
  if (p.destination?.endsWith('/request-warehouse')) { event = 'cta_click'; p.cta_id ||= 'request_warehouse'; rememberLeadOrigin(p); }
  if (event === 'cta_click') p.cta_id ||= slug(p.label || 'contact');
  if (!analyticsEnabled()) return;
  // PageHead owns resolved metadata. Never derive a title from the previous route.
  command('event', event, { ...context, ...p, transport_type: 'beacon' });
}

/** Stable, non-PII content key; changing editorial text intentionally creates a new question. */
export function stableContentId(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `content_${(hash >>> 0).toString(36)}`;
}
export const analyticsPageContext = () => ({ ...context });
