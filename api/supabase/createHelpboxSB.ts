import { supabase } from "@/src/lib/supabase";

export const createHelpboxSB = async (payload: any) => {
  const { data, error } = await supabase
    .from("helpbox")
    .insert([payload])
    .select();

  if (error) {
    console.log("Supabase error:", error.message);
    throw error;
  }

  return data;
};