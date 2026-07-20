import { supabase } from '@/src/firebase/supabaseClient';

let servicesCache: Record<string, string> | null = null;
let servicesPromise: Promise<Record<string, string>> | null = null;

export const fetchServicesMap = async (): Promise<Record<string, string>> => {
  try {
    if (servicesCache) return servicesCache;
    if (servicesPromise) return servicesPromise;

    servicesPromise = (async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name");

      if (error) {
        console.error("Supabase services fetch error:", error);
        // Return an empty object instead of throwing to prevent application crash
        return {};
      }

      const map: Record<string, string> = {};
      data?.forEach((item: any) => {
        const id = item?.id;
        const name = item?.name;
        if (id && name) {
          map[id] = name;
        }
      });

      servicesCache = map;
      return map;
    })();

    return await servicesPromise;
  } catch (error) {
    console.log("Services map fetch error:", error);
    return {};
  }
};
