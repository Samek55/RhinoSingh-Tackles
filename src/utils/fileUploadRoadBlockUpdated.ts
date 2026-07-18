import { supabase } from "../lib/supabase";

export type FileItem = {
  uri: string;
  fileName?: string;
};

export const uploadImageToSupabaseRoadBlockUpdated = async (
  file: FileItem
) => {
  const fileExt = file.uri.split(".").pop() || "jpg";
  
  // Files will be stored directly in the "booking" folder
  const fileName = `roadblock/updated${Date.now()}-${Math.random()}.${fileExt}`;

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

export const uploadMultipleImagesForRoadBlockUpdated = async (
  files: FileItem[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadImageToSupabaseRoadBlockUpdated(file)
    );
    
    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  } catch (err) {
    console.error("Multiple Upload Error: ", err);
    throw err;
  }
};