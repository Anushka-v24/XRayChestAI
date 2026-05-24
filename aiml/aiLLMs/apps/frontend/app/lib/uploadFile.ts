export async function handleUpload(file: File, patientId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patientId", patientId);

  const res = await fetch("/api/agentA", {
    method: "POST",
    body: formData,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { success: false, error: await res.text() };

  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || "Upload failed");
  }
  console.log("Predictions:", data);
  return data;
}
