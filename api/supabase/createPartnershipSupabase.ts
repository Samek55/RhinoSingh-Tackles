import { supabase } from "@/src/lib/supabase";

export const createPartnershipSupabase = async (payload: any) => {
  const { data, error } = await supabase
    .from("partnership")
    .insert([payload])
    .select();

  if (error) {
    console.log("Supabase error:", error.message);
    throw error;
  }

  return data;
};