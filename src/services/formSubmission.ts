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
    
    console.log('Submitting form data:', payload);
    
    const response = await fetch('https://wareongo-website-backend.onrender.com/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      return {
        success: false,
        error: errorData.error || 'Failed to submit form',
      };
    }

    const responseData = await response.json();
    console.log('Success response:', responseData);
    return { success: true };
  } catch (error: any) {
    console.error('Form submission error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
};
