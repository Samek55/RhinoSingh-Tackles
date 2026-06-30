import { supabase } from "@/src/lib/supabase";

export const fetchWorkforceFromSupabase = async () => {
  try {
    const { data: records, error } = await supabase
      .from("workforce")
      .select(`
        uin, 
        full_name, 
        email, 
        phone, 
        position_applied_for, 
        preferred_working_area, 
        area_of_expertise, 
        years_of_experience, 
        insurance_policy_number, 
        emergency_contact_number, 
        cover_letter, 
        message, 
        id_proof, 
        resume_cv, 
        application_date, 
        status
      `)
      .order("application_date", { ascending: false }); 

    if (error) {
      console.log("Supabase Error fetching workforce:", error);
      return [];
    }

    if (!records || records.length === 0) return [];

    return records.map((item) => ({
      // FIX: Map 'uin' from the database to the 'id' key the frontend list expects
      id: item.uin || "", 
      workforce_uin: item.uin || "",
      fullName: item.full_name || "N/A",
      email: item.email || "N/A",
      phone: item.phone || "N/A",
      
      positionAppliedFor: item.position_applied_for,
      preferredWorkingArea: item.preferred_working_area,
      areaOfExpertise: item.area_of_expertise,
      yearsOfExperience: item.years_of_experience,
      insurancePolicyNo: item.insurance_policy_number,
      emergencyContactNo: item.emergency_contact_number,
      
      coverLetter: item.cover_letter || "",
      message: item.message || "",
      idProof: item.id_proof || "",
      resumeCV: item.resume_cv || "",

      ApplicationDate: item.application_date || "",
      rawBookingDate: item.application_date || "", 
      status: item.status || "Pending",
    }));
    
  } catch (error) {
    console.log("Fetch Workforce Error:", error);
    return [];
  }
};