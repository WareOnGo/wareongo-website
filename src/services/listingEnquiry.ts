import { config, getApiUrl } from '@/config/config';
import { getLeadAttribution } from '@/lib/leadAttribution';
import { listingEnquiryLocation } from '@/lib/listingBreaks';
import type { WarehouseFilters } from '@/lib/listingSearch';

export type ListingEnquiryKind = 'shortlist' | 'callback';

export async function submitListingEnquiry({ kind, name, phone, size, filters }: {
  kind: ListingEnquiryKind; name: string; phone: string; size: string; filters: WarehouseFilters;
}): Promise<{ success: boolean; error?: string; errorCode?: string; leadId?: string }> {
  try {
    const response = await fetch(getApiUrl(config.api.customerRequests), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: kind === 'shortlist' ? 'listing-shortlist' : 'listing-advisor-callback',
        full_name: kind === 'shortlist' ? name.trim() : '',
        phone_number: phone.trim(),
        preferred_location: listingEnquiryLocation(filters),
        ...(kind === 'shortlist' ? { required_space_sqft: Number(size) } : {}),
        listing_filters: filters,
        ...getLeadAttribution(),
      }),
    });
    if (!response.ok) return {
      success: false,
      error: response.status < 500
        ? 'Please check your details and try again.' : 'We couldn’t send your request. Please try again.',
      errorCode: response.status < 500 ? 'validation_server' : 'server',
    };
    const data = await response.json();
    return { success: true, leadId: data.id != null ? `request_${data.id}` : undefined };
  } catch {
    return { success: false, error: 'We couldn’t connect. Check your connection and try again.', errorCode: 'network' };
  }
}
