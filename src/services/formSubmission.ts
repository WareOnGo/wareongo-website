
import { supabase } from '@/lib/supabase';
import type { FormSubmission } from '@/lib/supabase';

/**
 * Submit contact form data to the form_submissions table
 */
export const submitContactForm = async (formData: Omit<FormSubmission, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('contact_us_submissions')  // Updated to match the actual table name in Supabase
      .insert([{
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,  // Updated to match column name in Supabase
        // Note: source field isn't in the actual table, so we don't insert it
      }]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting form:', error);
    return { 
      success: false, 
      error: error?.message || 'Failed to submit form. Please try again.' 
    };
  }
};
