const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export const getContentTypeForExt = (fileExt: string): string =>
  CONTENT_TYPES[fileExt.toLowerCase()] || "application/octet-stream";
