// frontend/app/lib/api.ts
export async function uploadFileAPI(file: File, meta: Record<string, any>) {
  // stub: send multipart form to /api/upload (make sure your server supports App Router API routes)
  const fd = new FormData();
  fd.append("file", file);
  fd.append("meta", JSON.stringify(meta));

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function fetchUserReports(user_id: string) {
  const res = await fetch(`/api/docs?user_id=${encodeURIComponent(user_id)}`);
  if (!res.ok) return { documents: [] };
  return res.json();
}

export async function fetchGlobalStats() {
  // stubbed stats endpoint
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
