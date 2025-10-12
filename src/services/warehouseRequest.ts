
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
export const submitWarehouseRequest = async (formData: WarehouseRequestData): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload = {
      full_name: formData.name.trim(),
      phone_number: formData.phone.trim(),
      company_name: formData.company.trim(),
      preferred_location: formData.location.trim(),
      additional_requirements: formData.requirements ? formData.requirements.trim() : '',
    };
    
    console.log('Submitting warehouse request:', payload);
    
    const response = await fetch('https://wareongo-website-backend.onrender.com/customer-requests', {
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
        error: errorData.error || 'Failed to submit request' 
      };
    }
    
    const responseData = await response.json();
    console.log('Success response:', responseData);
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting warehouse request:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};
