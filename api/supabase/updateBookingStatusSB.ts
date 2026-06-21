import { supabase } from '@/src/lib/supabase';

export const updateBookingStatusSB = async (
  bookingId: string | number,
  status: string
) => {
  try {
    console.log(`🚀 Sending update to Supabase - Column: bookingid, Value: ${bookingId}, Status: ${status}`);

    const { data, error } = await supabase
      .from('booking') 
      .update({ status: status }) 
      .eq('bookingid', bookingId) // Lowercase primary key column name
      .select();

    if (error) {
      throw new Error(error.message || 'Failed to update status in Supabase');
    }

    console.log("✅ Supabase Response Data:", data);
    return data;
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error;
  }
};