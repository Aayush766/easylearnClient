import api from "./api";

export async function uploadToCloudinary(file, folder) {
  const signed = await api.post("/api/uploads/signature", { folder });
  const resourceType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "raw";
  const endpoint = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`;
  const chunkSize = 20 * 1024 * 1024;
  const chunked = resourceType === "video" && file.size > 100 * 1024 * 1024;
  const uploadId = chunked ? crypto.randomUUID() : null;
  let payload;
  for (let start = 0; start < file.size;) {
    const end = chunked ? Math.min(start + chunkSize, file.size) : file.size;
    const form = new FormData();
    form.append("file", chunked ? file.slice(start, end) : file);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("folder", signed.folder);
    form.append("allowed_formats", signed.allowedFormats);
    form.append("public_id", signed.publicId);
    form.append("overwrite", String(signed.overwrite));
    form.append("signature", signed.signature);
    const headers = chunked ? { "X-Unique-Upload-Id": uploadId, "Content-Range": `bytes ${start}-${end - 1}/${file.size}` } : undefined;
    const response = await fetch(endpoint, { method: "POST", body: form, headers });
    payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || "Cloudinary upload failed.");
    start = end;
  }
  return { publicId: payload.public_id, url: payload.secure_url, resourceType: payload.resource_type };
}



