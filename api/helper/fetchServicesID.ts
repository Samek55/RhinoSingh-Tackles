const SERVICES_URL = process.env.EXPO_PUBLIC_AIRTABLE_API_URL_SERVICES;

const TOKEN = process.env.EXPO_PUBLIC_AIRTABLE_TOKEN;

export const fetchServicesMap = async () => {
  try {
    const res = await fetch(SERVICES_URL!, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const data = await res.json();

    const map: Record<string, string> = {};

    data.records?.forEach((item: any) => {
      const id = item.id;
      const name = item.fields?.["Name"];

      if (id && name) {
        map[id] = name;
      }
    });

    return map;
  } catch (error) {
    console.log("Services fetch error:", error);
    return {};
  }
};