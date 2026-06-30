import { supabase } from '@/src/lib/supabase';

export const updateWorkforceStatusSB = async (
  id: string | number,
  status: string
) => {
  try {
    console.log(`🚀 Updating Supabase Workforce - ID: ${id}, New Status: ${status}`);

    const { data, error } = await supabase
      .from('workforce') 
      .update({ status: status }) 
      .eq('uin', id) // Fixed to target the primary key 'id' matching your applicant object
      .select();

    if (error) {
      throw new Error(error.message || 'Failed to update workforce status in Supabase');
    }

    console.log("✅ Supabase Response Data:", data);
    return data;
  } catch (error) {
    console.error('Update workforce status error:', error);
    throw error;
  }
};