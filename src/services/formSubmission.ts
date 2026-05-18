import { getApiUrl, config } from '@/config/config';

interface ContactFormData {
  name: string;
  phone: string;
  email: string | null;
  source: string;
}

/**
 * Submit contact form data to the backend API
 */
export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload = {
      name: formData.name.trim(),
      phoneNumber: formData.phone.trim(),
      email: formData.email ? formData.email.trim() : null,
      source: formData.source.trim(),
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
      console.error('Form submission error response:', errorData);
      return {
        success: false,
        error: errorData.error || 'Failed to submit form',
      };
    }

    await response.json();
    return { success: true };
  } catch (error) {
    console.error('Form submission error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
};
