import { agentC } from "@/app/lib/agentC";
import { groq } from "@ai-sdk/groq";

import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const diseases = [
  "Atelectasis",
  "Cardiomegaly",
  "Effusion",
  "Infiltration",
  "Mass",
  "Nodule",
  "Pneumonia",
  "Pneumothorax",
  "Pleural Effusion",
  "Consolidation",
  "Edema",
  "Emphysema",
  "Fibrosis",
  "Pleural Thickening",
  "Hernia",
];
//initially- first report
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("token");
    const disease = req.nextUrl.searchParams.get("disease");
    if (!patientId || !disease) {
      return NextResponse.json({
        success: false,
        error: "Missing token or disease",
      });
    }

    if (!disease || !diseases.includes(disease))
      return NextResponse.json(
        { success: false, error: `Invalid or unsupported disease: ${disease}` },
        { status: 400 }
      );

    const medlineUrl = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=title:${encodeURIComponent(
      disease
    )}`;
    let content = "";
    try {
      const response = await fetch(medlineUrl);
      content = await response.text();
    } catch (error) {
      console.error("MedlinePlus lookup failed:", error);
      content = `No external MedlinePlus content was available for ${disease}. Use general clinical knowledge and note that reference lookup was unavailable.`;
    }

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content:
            "You are a medical explainer that summarizes MedlinePlus pages clearly and factually.",
        },
        {
          role: "user",
          content: `Here is content about ${disease}:\n\n${content}\n\nSummarize this condition including symptoms, causes, diagnosis, and treatment.`,
        },
      ],
    });
  //agentA will update AI analysis field based on probabilities from model
  //agentB will provide with Ai analysis + medline info sumup to agentC
  //agentC will sum up entire patient context(age, health, bp, etc. if provided + agentA & B) into disease field (based on fresh report)
  //diagnosis relation will have doctor diagnosis based on actual report (updated by doctor dashboard for current report it will be after completion of agents)
  //Agent D will be chat agent for patient based on entire patient db(current summation i.e disease field + prev db + having diagnosis too if uploaded by doctor). Doctor could switch agent d context based on patients assigned while patient have only access to his. Need to include timestamps with each diagnosis, ai analysis and reports too(upload date)

  //Dynamic disease field: On each new report, disease field will be updated: based on fresh report only
  
    const results = await result.text;
    // console.log({ results }, "from agent b");
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Agent B failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Agent B failed",
      },
      { status: 500 }
    );
  }
}
