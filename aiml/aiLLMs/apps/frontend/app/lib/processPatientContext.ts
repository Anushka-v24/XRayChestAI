import { generateText } from "ai";
import prisma from "@/db/prisma/prismaCl";
import { groq } from "@ai-sdk/groq";

export async function processPatientContext(patientId: string) {
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

  const prompt = `
You are a medical data summarizer.
Patient details:
${JSON.stringify(patient, null, 2)}

Summarize this patient's entire medical background in concise clinical form:
- Current and past diagnoses
- Key lab findings
- Current medications and treatments
- Any relevant patterns or abnormalities
`;

  const summary = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: `Summarize this patient's entire medical background in concise clinical form:
- Current and past diagnoses
- Key lab findings
- Current medications and treatments
- Any relevant patterns or abnormalities`,
    prompt,
  });

  const processedSummary = summary.text;
  console.log({ processedSummary }, "from agent c");

  await prisma.user.update({
    where: { authUserId: patientId },
    data: { disease: processedSummary },
  });

  return processedSummary;
}
