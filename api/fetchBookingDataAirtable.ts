import { fetchServicesMap } from "./helper/fetchServicesID";

const BASE_URL = process.env.EXPO_PUBLIC_AIRTABLE_API_URL_BOOKING;
const TOKEN = process.env.EXPO_PUBLIC_AIRTABLE_TOKEN;

export const fetchBookingsFromAirtable = async () => {
  try {
    const servicesMap = await fetchServicesMap();

    const response = await fetch(BASE_URL!, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Airtable Error:", data);
      return [];
    }

    return data.records.map((item: any) => ({
      id: item.id,

      fullName: item.fields["Full name"],
      email: item.fields["eMail"],
      phone: item.fields["Phone"],

      city: item.fields["City"],
      street: item.fields["Street"],
      zip: item.fields["Zip"],
      landmark: item.fields["Nearest Landmark"],
      propertyType: item.fields["Property Type"],

      // 🔥 FIXED (recXXXX → real name)
      service:
        item.fields["Select Services"]
          ?.map((id: string) => servicesMap[id])
          .filter(Boolean)
          .join(", ") || "",

      startingDate: item.fields["Starting Date"],
      deadline: item.fields["Deadline"],

      shift: item.fields["Select Shift"],
      priority: item.fields["Priority"],

      source: item.fields["How did you know about us?"],
      workForce: item.fields["workForce"],

      status: item.fields["Status"],
       budget: item.fields["Budget"],
    }));
  } catch (error) {
    console.log("Fetch Error:", error);
    return [];
  }
};