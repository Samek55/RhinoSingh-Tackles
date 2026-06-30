import { supabase } from "@/src/lib/supabase";

export const fetchHelpboxFromSupabase = async () => {
  try {
    const { data: records, error } = await supabase
      .from("helpbox")
      .select("uin, phone, date_created, status") // No 'id' requested from DB
      .order("date_created", { ascending: false }); 

    if (error) {
      console.log("Supabase Error fetching helpbox:", error);
      return [];
    }

    if (!records || records.length === 0) return [];

    return records.map((item) => ({
      // FIX: Supply the missing 'id' expected by your screen layout 
      id: item.uin || "", 
      helpbox_uin: item.uin || "",
      phone: item.phone || "No Phone",
      rawBookingDate: item.date_created || "", 
      bookingDate: item.date_created || "", 
      status: item.status || "New / Open",
    }));
    
  } catch (error) {
    console.log("Fetch Helpbox Error:", error);
    return [];
  }
};