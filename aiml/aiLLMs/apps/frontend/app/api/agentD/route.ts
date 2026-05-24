import prisma from "@/db/prisma/prismaCl";
const db = prisma;
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role?: string;
  parts?: Array<{ type?: string; text?: string }>;
};

type ReportContext = {
  date: Date;
  imageUrl: string;
  reportText?: string | null;
  aiAnalysis?: { findings?: string | null } | null;
  diagnosis?: Array<{ title: string; notes?: string | null }>;
};

export async function POST(req: NextRequest) {
  try {
const { messages, userId } = await req.json();

const message = messages
  .filter((m: ChatMessage) => m.role === "user")
  .at(-1)?.parts?.[0]?.text || "";
    console.log(JSON.stringify(messages));
console.log({message})
    const user = await db.user.findUnique({
      where: { authUserId: userId },
      include: {
        reports: {
          orderBy: { date: "desc" },
          take: 5,
          include: {
            aiAnalysis: true,
            diagnosis: true,
            doctor: {
              include: {
                specialization: true,
              },
            },
          },
        },
      },
    });
    console.log({user}, "from agentD")
    const reports = ((user as typeof user & { reports?: ReportContext[] })?.reports ?? []);
    const latestReport = reports[0];
    const previousReports = reports.slice(1);
    const context = `
Patient:
Name: ${user?.name ?? "Unknown"}
Email: ${user?.email ?? "Unknown"}
Current patient summary: ${user?.disease ?? "No medical summary available yet."}

Most recently uploaded Xray image report:
Date: ${latestReport?.date?.toISOString() ?? "No report uploaded yet"}
Image URL: ${latestReport?.imageUrl ?? "N/A"}
AI findings:
${latestReport?.aiAnalysis?.findings ?? "No AI analysis is available for the latest report yet."}
Doctor diagnoses:
${
  latestReport?.diagnosis?.length
    ? latestReport.diagnosis
        .map((d) => `- ${d.title}${d.notes ? `: ${d.notes}` : ""}`)
        .join("\n")
    : "No doctor diagnosis notes for the latest report yet."
}

Previous uploaded Xray image reports:
${
  previousReports.length
    ? previousReports
        .map(
          (report) => `- ${report.date.toISOString()}: ${
            report.aiAnalysis?.findings ?? report.reportText ?? "No analysis saved."
          }`
        )
        .join("\n\n")
    : "No previous reports."
}
`;
    const response = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content: `You are a patient-facing AI medical assistant.
            Always be empathetic and factual. Answer questions using the patient context below.
            Prioritize the most recently uploaded Xray image report when the user asks about "this report", "latest report", detected diseases, findings, probabilities, diagnosis, or next steps.
            Clearly say when something is not present in the uploaded report context.
            Do not invent measurements, diagnoses, or treatments that are not supported by the context. Encourage follow-up with a qualified clinician for clinical decisions.

            Patient medical context:
            ${context}`,
        },
        { role: "user", content: message },
      ],
    });
    console.log({response})
    return response.toUIMessageStreamResponse();
  } catch (error) {
    console.log({error})
    return NextResponse.json({
      success: false,
      error: "Error processing request",
    });
  }
}
// Agent A gotta push user req to model, get data, feed it to llm -> get something, something to db

// Agent A and B will be called as a group to prepare fresh current report. Agent C will prepare all context and save it to db. Agent D will be a clean chatbot based on it.
