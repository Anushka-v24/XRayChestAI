import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import axios from "axios";
import { agentC } from "@/app/lib/agentC";
import { v2 as cloudinary } from "cloudinary";
import { storeReportEmbedding } from "@/app/lib/reportVector";

type TopLabel = {
  label: string;
  probability: number;
};

function getUploadError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNREFUSED") {
      return {
        status: 503,
        message:
          "Prediction service is not running. Start the model API on http://localhost:8000 and try again.",
      };
    }

    return {
      status: error.response?.status || 500,
      message:
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message,
    };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : "Unknown error",
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const patientId = formData.get("patientId");
    const doctorId = formData.get("doctorId");
    const file = formData.get("file");

    if (typeof patientId !== "string" || !patientId) {
      return NextResponse.json(
        { success: false, error: "Missing patient id" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Missing report file" },
        { status: 400 }
      );
    }

    const body = new FormData();
    body.append("file", file);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const modelUrl = process.env.MODEL_API_URL || "http://localhost:8000";
    const res = await axios.post(`${modelUrl}/predict`, body);

    const data = res.data;
    if (!data.top3_labels) {
      return NextResponse.json(
        {
          success: false,
          error: "Prediction service did not return labels",
        },
        { status: 502 }
      );
    }

    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const uploadRes = await cloudinary.uploader.upload(base64, {
      folder: "radiology",
      resource_type: "auto", // image, pdf...
    });

    const disease = JSON.stringify(data.top3_labels);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const topLabels = data.top3_labels as TopLabel[];
    const topConfidence = topLabels[0]?.probability ?? null;
    const diseaseInfoResponses = await Promise.all(
      topLabels.map(async (element) => {
        try {
          const res = await axios.get(
            `${baseUrl}/api/agentB?token=${patientId}&disease=${encodeURIComponent(element.label)}`
          );
          return res.data.results as string;
        } catch (error) {
          console.error(`Agent B lookup failed for ${element.label}:`, error);
          return `${element.label}: external medical reference lookup was unavailable during upload.`;
        }
      })
    );
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content:
            "You are a medical explainer for chest diseases. Refer to official medical websites like NIH and give info. Don't provide random data not available on official sources. Provide references",
        },
        {
          role: "user",
          content: `Here are the possible diseases ${disease} and diseaseInfoResponses ${diseaseInfoResponses}. 
          Based on this, provide a concise analysis of the medical image including likely diagnosis, differentials, and recommended next steps for diagnosis and treatment.`,
        },
      ],
    });

    const userId = (
      await prisma.user.findUnique({
        where: { authUserId: patientId },
      })
    )?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Select a valid patient before uploading an Xray image." },
        { status: 404 }
      );
    }

    const reportDoctorId =
      typeof doctorId === "string" && doctorId
        ? (
            await prisma.doctor.findUnique({
              where: { authUserId: doctorId },
            })
          )?.id
        : undefined;

    const reportData = await prisma.report.create({
      data: {
        userId,
        doctorId: reportDoctorId,
        imageUrl: uploadRes.secure_url, //need to upload to s3 or cloudinary and use dynamic url
        aiAnalysis: {
          create: {
            findings: result.text,
            confidence: topConfidence,
          },
        },
      },
      include: {
        aiAnalysis: true,
        diagnosis: true,
        doctor: { include: { specialization: true } },
      },
    });
    console.log({ reportData }, "new report created agent a");
    await storeReportEmbedding(reportData);
    agentC(patientId); //async call to update patient context in background

    // let res = axios.get(`https://www.ncbi.nlm.nih.gov/medgen/?term=${element[0]}`);
    return NextResponse.json({ data, success: true });
  } catch (error: unknown) {
    console.error("Report upload failed:", error);
    const uploadError = getUploadError(error);
    return NextResponse.json(
      {
        success: false,
        error: uploadError.message,
      },
      { status: uploadError.status }
    );
  }
}
