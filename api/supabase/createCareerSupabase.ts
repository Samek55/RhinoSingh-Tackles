import { supabase } from "@/src/lib/supabase";

export const createCareerSupabase = async (payload: any) => {
  const { data, error } = await supabase
    .from("workforce")
    .insert([payload])
    .select("uin")
    .single();

  if (error) {
    console.log("Supabase error:", error.message);
    throw error;
  }

  return data;
};