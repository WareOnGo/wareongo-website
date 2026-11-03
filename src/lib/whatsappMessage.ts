import { SITE_URL } from '@/config/config';
import { SERVICE_PAGES, type ServiceSlug } from '@/data/serviceCatalog';

// The fields read from the current route's loader data; every one may be absent.
type PageData = {
  id?: number; specifications?: { location?: { city?: string } };
  type?: string; canonical?: string; warehouseType?: string; parentCity?: { canonical: string } | null;
};

/**
 * Prefilled text for the site-wide WhatsApp button: the listing or location the
 * visitor is viewing where known, a general enquiry elsewhere, and none on the
 * homepage and blogs. Ad pages render their own button and message.
 */
export function siteWhatsAppMessage(path: string, data: unknown): string | undefined {
  if (path === '/' || path === '/blogs' || path.startsWith('/blogs/')) return undefined;
  const page = (data ?? {}) as PageData;
  if (path.startsWith('/warehouse/') && page.id != null) {
    const city = page.specifications?.location?.city;
    return `Hi, I'm interested in warehouse ID ${page.id}${city ? ` in ${city}` : ''}: ${SITE_URL}${path}`;
  }
  if (/^\/(listings|overview)\//.test(path) && page.canonical) {
    const place = page.type === 'micromarket' && page.parentCity ? `${page.canonical}, ${page.parentCity.canonical}` : page.canonical;
    return `Hi, I'm looking for a ${page.warehouseType ? `${page.warehouseType} ` : ''}warehouse in ${place}.`;
  }
  const service = path.match(/^\/services\/([^/]+)$/)?.[1];
  if (service && service in SERVICE_PAGES) return `Hi, I'd like to know more about your ${SERVICE_PAGES[service as ServiceSlug]} service.`;
  return "Hi, I'm looking for a warehouse.";
}
