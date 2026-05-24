import { HfInference } from "@huggingface/inference";
import supabase from "./supabaseClient";
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
export async function searchReports(query: string) {
  const queryEmbedding = 
    await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: query,
    })
    .then((embeddings) => embeddings[0]);

  function normalize(v: number[]) {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return v.map((x) => x / norm);
}

  const { data, error } = await supabase.rpc(
    "match_report_embeddings",
    {
      query_embedding: normalize(queryEmbedding as number[]),
      match_count: 5
    }
  );

  return data ?? [];
}