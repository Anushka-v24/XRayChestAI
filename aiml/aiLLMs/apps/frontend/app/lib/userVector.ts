import supabase from "@/app/lib/supabaseClient";
import { createEmbeddings } from "./createEmbeddings";
import { VectorMap } from "@react-jvectormap/core";

export async function updateUserVectors(patientId: string, summary: string, rawData: any) {
  // 1. Build long semantic text from patient
  const baseText = `
PATIENT SUMMARY
-------------------
${summary}

RAW HISTORY
-------------------
${JSON.stringify(rawData, null, 2)}
`;

  // 2. Chunk
  const chunkSize = 1200;
  const chunks: string[] = [];

  for (let i = 0; i < baseText.length; i += chunkSize) {
    chunks.push(baseText.slice(i, i + chunkSize));
  }

  // 3. Remove old vectors for that user (optional)
  await supabase
    .from("patient_embeddings")
    .delete()
    .eq("patient_id", patientId);

  // 4. Insert chunked embeddings
  for (const chunk of chunks) {
    const vector = await createEmbeddings(chunk);

    await supabase.from("patient_embeddings").insert({
      patient_id: patientId,
      content: chunk,
      embedding: vector,
    });
  }

  console.log("Vector DB updated for user:", patientId);
  
}
