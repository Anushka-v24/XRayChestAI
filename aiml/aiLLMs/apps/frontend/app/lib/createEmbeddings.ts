import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
export async function createEmbeddings(text: string) {
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: "sentence-transformers/all-MiniLM-L6-v2",  // 384 dims
});

const vector = await embeddings.embedQuery(text);
return vector;  
}