import { getApiUrl, config } from '@/config/config';

interface ContactFormData {
  name: string;
  phone: string;
  email: string | null;
  source: string;
  companyName?: string;
}

/**
 * Submit contact form data to the backend API
 */
export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; error?: string; errorCode?: string; leadId?: string }> => {
  try {
    const payload = {
      name: formData.name.trim(),
      phoneNumber: formData.phone.trim(),
      email: formData.email ? formData.email.trim() : null,
      source: formData.source.trim(),
      ...(formData.companyName !== undefined ? { companyName: formData.companyName.trim() } : {}),
    };

    const response = await fetch(getApiUrl(config.api.enquiries), {
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
        error: errorData.error || 'Failed to submit form',
        errorCode: response.status < 500 ? 'validation_server' : 'server',
      };
    }

    const responseData = await response.json();
    return { success: true, leadId: responseData.id != null ? `enquiry_${responseData.id}` : undefined };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      errorCode: 'network',
    };
  }
};
