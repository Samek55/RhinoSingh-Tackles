// Add this to your API file (e.g., api/supabase/updateWorkforceStatusSB.ts or a new file)

import { supabase } from "@/src/lib/supabase";

export const updateWorkforceStatusSA = async (id: string, status: string) => {
  try {
    // First, check if there's a pending update for this workforce member
    const { data: pendingUpdate, error: fetchError } = await supabase
      .from('workforce_update_profile')
      .select('*')
      .eq('id_uin', id)
      .eq('status', 'Pending')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching pending update:', fetchError);
      throw fetchError;
    }

    // If there's a pending update and status is 'Accepted' or 'Rejected'
    if (pendingUpdate && (status === 'Accepted' || status === 'Rejected')) {
      // Only 'Accepted' merges the pending update's data into the live row.
      // 'Rejected' must leave the existing, already-verified workforce data
      // untouched — it previously took the identical branch as 'Accepted'
      // and silently applied the disputed change anyway, just under a
      // "Rejected" status label.
      const { error: updateError } = await supabase
        .from('workforce')
        .update(
          status === 'Accepted'
            ? {
                full_name: pendingUpdate.full_name,
                phone: pendingUpdate.phone,
                email: pendingUpdate.email,
                area_of_expertise: pendingUpdate.area_of_expertise,
                preferred_working_area: pendingUpdate.preferred_working_area,
                emergency_contact_number: pendingUpdate.emergency_contact_number,
                id_proof: pendingUpdate.id_proof,
                resume_cv: pendingUpdate.resume_cv,
                status: status,
              }
            : { status: status }
        )
        .eq('uin', id);

      if (updateError) {
        console.error('Error updating workforce:', updateError);
        throw updateError;
      }

      // Delete the pending update record
      const { error: deleteError } = await supabase
        .from('workforce_update_profile')
        .delete()
        .eq('id_uin', id);

      if (deleteError) {
        console.error('Error deleting pending update:', deleteError);
        throw deleteError;
      }

      return { success: true, message: 'Workforce updated successfully with pending changes' };
    } else {
      // If no pending update or status is not Accepted/Rejected, just update the status
      const { error: updateError } = await supabase
        .from('workforce')
        .update({ status: status })
        .eq('uin', id);

      if (updateError) {
        console.error('Error updating workforce status:', updateError);
        throw updateError;
      }

      return { success: true, message: 'Status updated successfully' };
    }
  } catch (error) {
    console.error('Error in updateWorkforceStatusSB:', error);
    throw error;
  }
};