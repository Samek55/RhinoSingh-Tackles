import { supabase } from "@/src/lib/supabase";

export type FileItem = {
  uri: string;
  fileName?: string;
};

interface WorkforceRecord {
  id_proof?: string[];
  resume_cv?: string[];
}

export const uploadWorkforceDocument = async (
  file: FileItem,
  userId: string,
  columnName: 'id_proof' | 'resume_cv'
) => {
  const fileExt = file.uri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
  
  // REMOVED '/image' from the path
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

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    const newPublicUrl = data.publicUrl;

    // Fetch existing data to append
    const { data: currentRecord, error: fetchError } = await supabase
      .from("workforce")
      .select(columnName)
      .eq("phone", userId)
      .single();

    if (fetchError) throw fetchError;

    const record = currentRecord as WorkforceRecord;
    const existingArray = record[columnName] || [];
    const updatedArray = [...existingArray, newPublicUrl];

    // Update the database
    const { error: updateError } = await supabase
      .from("workforce")
      .update({ [columnName]: updatedArray })
      .eq("phone", userId);

    if (updateError) throw updateError;

    return newPublicUrl;
  } catch (err) {
    throw err;
  }
};