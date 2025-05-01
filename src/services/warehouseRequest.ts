
import { supabase } from '@/lib/supabase';
import type { WarehouseRequest } from '@/lib/supabase';

/**
 * Submit warehouse request form data to the warehouse_requests table
 */
export const submitWarehouseRequest = async (formData: Omit<WarehouseRequest, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('warehouse_enquiries')  // Updated to match the actual table name in Supabase
      .insert([{
        person_name: formData.name,  // Updated to match column name in Supabase
        phone_number: formData.phone,  // Updated to match column name in Supabase
        company_name: formData.company,  // Updated to match column name in Supabase
        city_location: formData.location,  // Updated to match column name in Supabase
        additional_requirements: formData.requirements,  // Updated to match column name in Supabase
        // Note: email field isn't used in this form
      }]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting warehouse request:', error);
    return { 
      success: false, 
      error: error?.message || 'Failed to submit request. Please try again.' 
    };
  }
};
