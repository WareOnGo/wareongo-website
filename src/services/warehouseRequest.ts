
import { supabase, WarehouseRequest } from '@/lib/supabase';

/**
 * Submit warehouse request form data to the warehouse_requests table
 */
export const submitWarehouseRequest = async (formData: Omit<WarehouseRequest, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('warehouse_requests')
      .insert([formData]);
    
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
