import { supabase } from "@/src/lib/supabase";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";

  const t = Date.parse(dateString);
  if (isNaN(t)) return "";

  return new Date(t).toDateString();
};

export const fetchBookingsFromSupabase = async () => {
  try {
    const { data: records, error } = await supabase
      .from("booking")
      .select("*")
      .order("service_booking_datetime", { ascending: false }); // 1. FIX: Sort directly at the database layer

    if (error) {
      console.log("Supabase Error fetching bookings:", error);
      return [];
    }

    if (!records || records.length === 0) {
      return [];
    }

    const result = new Array(records.length);

    for (let i = 0; i < records.length; i++) {
      const item = records[i];

      let servicesString = "";
      if (Array.isArray(item.select_services)) {
        servicesString = item.select_services.filter(Boolean).join(", ");
      } else if (typeof item.select_services === 'string') {
        try {
          const parsed = JSON.parse(item.select_services);
          servicesString = Array.isArray(parsed) ? parsed.filter(Boolean).join(", ") : parsed;
        } catch {
          servicesString = item.select_services;
        }
      }

      let areaString = "";
      if (Array.isArray(item.area)) {
        areaString = item.area.filter(Boolean).join(", ");
      } else if (typeof item.area === 'string') {
        try {
          const parsed = JSON.parse(item.area);
          areaString = Array.isArray(parsed) ? parsed.filter(Boolean).join(", ") : parsed;
        } catch {
          areaString = item.area;
        }
      }

      result[i] = {
        id: item.id || item.push_id || i.toString(),
        bookingId: item.bookingid, 

        fullName: item.full_name || "",
        email: item.email || "",
        phone: item.phone || "",

        city: item.city || "",
        area: areaString,
        street: item.street || "",
        zip: item.zip || "",
        landmark: item.nearest_landmark || "",
        propertyType: item.property_type || "",

        select_services: servicesString, 
        service: servicesString, 

        // Keep raw date string for accurate sorting properties if needed
        rawBookingDate: item.service_booking_datetime || "", 
        bookingDate: formatDate(item.service_booking_datetime),
        startingDate: formatDate(item.starting_date),
        completionDate: formatDate(item.service_completion_date),
        deadline: formatDate(item.deadline),

        shift: item.select_shift || "",
        priority: item.priority || "",

        source: item.how_did_you_know_about_us || "",
        workForce: item.workforce || 1,

        status: item.status || "New / Open",
        budget: item.budget || "",
        specialRequests: item.work_description || "",
        
        whatsapp: item.whatsapp || "",
        modifiedDatetime: item.modified_datetime || "",
        addPhotosPicture: item.add_photos_picture || null,
        completionPhotos: item.completion_photos || null,
      };
    }

    return result;
  } catch (error) {
    console.log("Fetch Error:", error);
    return [];
  }
};