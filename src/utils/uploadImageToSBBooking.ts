import { supabase } from "../lib/supabase";

export type FileItem = {
  uri: string;
  fileName?: string;
};

export const uploadImageToSupabaseBooking = async (
  file: FileItem,
  subFolder = "general" // e.g., "company" or "crc"
) => {
  const fileExt = file.uri.split(".").pop() || "jpg";
  
  // ✅ This builds the path: partnership/company/1718900000-random.jpg
  const fileName = `career/${subFolder}/${Date.now()}-${Math.random()}.${fileExt}`;

  try {
    // 1. Fetch the image file URI locally via the network layer
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // 2. Read the local Blob structure into an ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to cast Blob directly into an ArrayBuffer."));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // 3. Upload raw ArrayBuffer directly to your "uploads" bucket
    const { error } = await supabase.storage
      .from("uploads") // Keeps targeting your "uploads" bucket base
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      });

    if (error) {
      console.error("Supabase Storage Upload Error: ", error.message);
      throw error;
    }

    // 4. Retrieve and return the public URL endpoint
    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error("Failed handling asset preparation/upload: ", err);
    throw err;
  }
};