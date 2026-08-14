import { supabase } from "@/src/lib/supabase";

export const fetchPartnershipFromSupabase = async () => {
  try {
    const { data: records, error } = await supabase
      .from("partnership")
      .select(`
        partner_id,
        full_name,
        phone_number,
        email,
        name_of_organisation,
        city,
        number_of_employees,
        business_type,
        partnership_interests,
        how_did_you_hear_about_us,
        message,
        services_offered,
        name_from_services_offered,
        company_photos,
        company_registration_certificates
      `)
      .order("partner_id", { ascending: false })
      .limit(200);

    if (error) {
      console.log("Supabase Error fetching partnership applications:", error);
      return [];
    }

    if (!records || records.length === 0) return [];

    return records.map((item) => ({
      id: item.partner_id,
      fullName: item.full_name || "N/A",
      phoneNumber: item.phone_number || "N/A",
      email: item.email || "N/A",
      organisationName: item.name_of_organisation || "N/A",
      city: item.city || "N/A",
      numberOfEmployees: item.number_of_employees || "N/A",
      businessType: item.business_type || "N/A",
      partnershipInterests: item.partnership_interests || "N/A",
      howDidYouHear: item.how_did_you_hear_about_us || "N/A",
      message: item.message || "",
      servicesOffered: item.services_offered || [],
      companyPhotos: item.company_photos || [],
      companyRegistrationCertificates: item.company_registration_certificates || [],
    }));
  } catch (error) {
    console.log("Fetch Partnership Applications Error:", error);
    return [];
  }
};
