import { supabase } from '@/src/lib/supabase';

export async function isLeadUnlocked(bookingId: number, professionalPhone: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('lead_unlocks')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('professional_phone', professionalPhone)
    .maybeSingle();

  if (error) {
    console.log('isLeadUnlocked error:', error.message);
    return false;
  }
  return !!data;
}
