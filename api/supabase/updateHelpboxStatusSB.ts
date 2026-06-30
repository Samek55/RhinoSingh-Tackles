import { supabase } from "@/src/lib/supabase"; // Make sure this path points to your initialized supabase client

/**
 * Updates the status of a helpbox record in Supabase
 * @param id The record identifier (id)
 * @param status 'Completed' | 'Pending' | 'Cancelled'
 */
export const updateHelpboxStatusSB = async (id: string | number, status: string) => {
  try {
    const { data, error } = await supabase
      .from('helpbox') // Replace 'helpbox' with your exact Supabase table name if different
      .update({ status: status })
      .eq('uin', id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating helpbox status in Supabase:', error);
    throw error;
  }
};