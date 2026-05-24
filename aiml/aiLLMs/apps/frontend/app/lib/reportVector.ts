import supabase from "./supabaseClient";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

function sanitizeLLM(text: any) {
  return text.replace(/`/g, "\\`").replace(/\${/g, "\\${");
}

export async function storeReportEmbedding(report: any) {
  console.log("Running storeReportEmbedding...");

  report.aiAnalysis.findings = sanitizeLLM(report.aiAnalysis.findings);
try{
  const text = `Report Date: ${report.date}
  Severity: ${report.severity}
  Doctor: ${report.doctor?.name ?? "N/A"}
  Report Text: ${report.reportText ?? ""}
  AI Findings: ${report.aiAnalysis?.findings ?? ""}
  Diagnosis Notes: ${
    report.diagnosis?.map((d: { notes: string | null }) => d.notes).join(", ") ??
    ""
  }
  `;

  const vector = await embeddings.embedQuery(text);

  const { error } = await supabase.from("report_embeddings").insert({
    report_id: report.id,
    content: text,
    embedding: vector,
  });

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
  
  console.log("Stored embedding:", vector.length);
  return vector;
} catch (err) {
  console.error("Error in storeReportEmbedding:", err);
}
}

// let result = await storeReportEmbedding({
//     id: 'a1db0d18-6e08-42f0-9a55-0e19d194e9af',
//     imageUrl: 'https://res.cloudinary.com/dkv7cimyy/image/upload/v1763268716/radiology/j6urwhmw2g6yqqsi1ydy.png',
//     reportText: null,
//     date: '2025-11-16T04:52:04.644Z',
//     confirmed: false,
//     severity: null,
//     userId: '329a7c27-d357-4b9d-b560-101d27ea220b',
//     doctorId: null,
//     createdAt: '2025-11-16T04:52:04.644Z',
//     updatedAt: '2025-11-16T04:52:04.644Z',
//     aiAnalysis: {
//       id: '1c5038e1-fae1-4818-aaf0-44ba60979a07',
//       reportId: 'a1db0d18-6e08-42f0-9a55-0e19d194e9af',
//       findings: '{"diagnosis":["Pneumonia"],"differentials":["Tuberculosis","Lung Cancer"],"recommended_next_steps":["Chest X-ray","Sputum Test","CT Scan"]}',
//       confidence: null,
//       createdAt: '2025-11-16T04:52:04.644Z'
//     },
//     diagnosis: [],
//     doctor: null
//   })
//   console.log({ result }, "after storing report embedding");
