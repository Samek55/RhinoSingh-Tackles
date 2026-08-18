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
  // Goes through a narrow RPC (not a direct table upsert) since customers has
  // no anon insert/update policy anymore — see migration 20260818000000.
  if (payload?.phone) {
    supabase
      .rpc("upsert_customer", { p_phone: payload.phone, p_full_name: payload.full_name })
      .then(({ error: upsertError }: { error: any }) => {
        if (upsertError) console.log("customers upsert error:", upsertError.message);
      });
  }

  return data;
};