import { supabase } from "@/src/lib/supabase";


const fetchCareerData = async (phone: string) => {
  const { data, error } = await supabase
    .from("career")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.log(error);
    throw error;
  }

  return data;
};