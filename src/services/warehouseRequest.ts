import { getApiUrl, config } from '@/config/config';

interface WarehouseRequestData {
  name: string;
  phone: string;
  company: string;
  location: string;
  requirements: string | null;
  email: string | null;
}

/**
 * Submit warehouse request form data to the backend API
 */
export const submitWarehouseRequest = async (formData: WarehouseRequestData): Promise<{ success: boolean; error?: string; errorCode?: string; leadId?: string }> => {
  try {
    const payload = {
      full_name: formData.name.trim(),
      phone_number: formData.phone.trim(),
      company_name: formData.company.trim(),
      preferred_location: formData.location.trim(),
      additional_requirements: formData.requirements ? formData.requirements.trim() : '',
    };


    const response = await fetch(getApiUrl(config.api.customerRequests), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });


    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to submit request',
        errorCode: response.status < 500 ? 'validation_server' : 'server'
      };
    }

    const responseData = await response.json();
    return { success: true, leadId: responseData.id != null ? `request_${responseData.id}` : undefined };
  } catch (error: any) {
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      errorCode: 'network'
    };
  }
};
