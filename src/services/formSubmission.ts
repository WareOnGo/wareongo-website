
import { supabase, FormSubmission } from '@/lib/supabase';

/**
 * Submit contact form data to the form_submissions table
 */
export const submitContactForm = async (formData: Omit<FormSubmission, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('form_submissions')
      .insert([formData]);
    
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
