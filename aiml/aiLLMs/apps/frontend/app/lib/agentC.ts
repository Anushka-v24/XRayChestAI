import { generateText } from "ai";
import prisma from "@/db/prisma/prismaCl";
import { groq } from "@ai-sdk/groq";
import { updateUserVectors } from "./userVector";
import { createEmbeddings } from "./createEmbeddings";
import supabase from "./supabaseClient";

export async function agentC(patientId: string) {
  console.log("Agent C running for:", patientId);

  const patient = await prisma.user.findUnique({
    where: { authUserId: patientId },
    include: {
      reports: {
        include: {
          aiAnalysis: true,
          diagnosis: true,
          doctor: { include: { specialization: true } },
        },
      },
    },
  });

  if (!patient) throw new Error("Patient not found");

 await updateUserVectors(patientId, patient.disease || "", patient);
 async function getPatientContext(patientId: string) {
  // 1. build embedding for the “summarization request”
  const queryEmbedding = await createEmbeddings(
    "summarize patient's entire medical history"
  );

  // 2. retrieve relevant memory from patient's vector DB
  const { data, error } = await supabase.rpc("match_patient_embeddings", {
    patient: patientId,
    query_embedding: queryEmbedding,
    match_count: 8,
  });

  if (error) {
    console.error("Error retrieving embeddings:", error);
    return "";
  }

  return data.map((d: any) => d.content).join("\n\n");
}


  // 2. Instead of JSON.stringify(patient) → get vector context
  const retrievedContext = await getPatientContext(patientId);

  // 3. summarization prompt
  const prompt = `
You are a medical data summarizer.
Use ONLY the retrieved context below:

RETRIEVED CONTEXT:
${retrievedContext}

`;

  const finalSummary = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: `Summarize this patient's entire medical background in concise clinical form:
- Current and past diagnoses
- Key lab findings
- Current medications and treatments
- Any relevant patterns or abnormalities`,
    prompt,
  });

  const processedSummary = finalSummary.text;
console.log({processedSummary}, "from agent c")
  //disease field holds entire medical context summary
 const result =  await prisma.user.update({
    where: { authUserId: patientId },
    data: { disease: processedSummary },
  });
console.log({result}, "after updating disease field in agent c")
  return processedSummary;
}
