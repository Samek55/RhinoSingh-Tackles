import { supabase } from "@/src/lib/supabase";

export const createBookingSupabase = async (payload: any) => {
  const { data, error } = await supabase
    .from("booking")
    .insert([payload])
    .select();

  if (error) {
    console.log("Supabase error:", error.message);
    throw error;
  }

  return data;
};