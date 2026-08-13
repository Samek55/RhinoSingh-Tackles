import { supabase } from "../lib/supabase";
import { getContentTypeForExt } from "./fileContentType";

export type FileItem = {
  uri: string;
  fileName?: string;
};

export const uploadImageToSupabaseCareer = async (
  file: FileItem
) => {
  const fileExt = file.uri.split(".").pop() || "jpg";
  
  // FIXED: All files now land directly inside the "career/" folder
  const fileName = `career/${Date.now()}-${Math.random()}.${fileExt}`;

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
        contentType: getContentTypeForExt(fileExt),
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