import { supabase } from "@/src/lib/supabase";
import { getContentTypeForExt } from "./fileContentType";

export type FileItem = {
  uri: string;
  fileName?: string;
};

// SIMPLEST VERSION - Upload to storage and return URL only
export const uploadDocumentOnly = async (
  file: FileItem,
  userId: string,
  columnName: 'id_proof' | 'resume_cv'
): Promise<string> => {
  const fileExt = file.uri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${columnName}_${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
  // Store in a folder within the uploads bucket
  const filePath = `workforce_upload_profile/${userId}/${fileName}`;

  try {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => (reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Failed")));
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Upload to the existing 'uploads' bucket
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, arrayBuffer, {
        contentType: getContentTypeForExt(fileExt),
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
};