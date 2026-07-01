import { supabase } from "../lib/supabase";

export type FileItem = {
  uri: string;
  fileName?: string;
};

export const uploadImageToSupabasePartnership = async (
  file: FileItem,
  subFolder: string // This will be used as a prefix if needed, or simply ignored
) => {
  const fileExt = file.uri.split(".").pop() || "jpg";

  // FIXED: Consolidated path. 
  // If you want them all in "partnership", use this exact structure:
  const fileName = `partnership/${Date.now()}-${Math.random()}.${fileExt}`;

  try {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) resolve(reader.result);
        else reject(new Error("Failed to cast Blob to ArrayBuffer."));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    const { error } = await supabase.storage
      .from("uploads")
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error("Upload Error: ", err);
    throw err;
  }
};