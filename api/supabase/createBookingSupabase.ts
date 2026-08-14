import { supabase } from "@/src/lib/supabase";

export const createBookingSupabase = async (payload: any) => {
  const { data, error } = await supabase
    .from("booking")
    .insert([payload])

  if (error) {
    console.log("Supabase error:", error.message);
    throw error;
  }

  // Best-effort — keeps the customers table (used by admin/UserManagement's
  // Customers tab) in sync without blocking the booking itself if it fails.
  if (payload?.phone) {
    supabase
      .from("customers")
      .upsert(
        { phone: payload.phone, full_name: payload.full_name, last_booking_at: new Date().toISOString() },
        { onConflict: "phone" }
      )
      .then(({ error: upsertError }) => {
        if (upsertError) console.log("customers upsert error:", upsertError.message);
      });
  }

  return data;
};