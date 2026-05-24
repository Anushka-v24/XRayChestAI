import { NextRequest, NextResponse } from "next/server";
import { processPatientContext } from "@/app/lib/processPatientContext";

export async function POST(req: NextRequest) {
  const { patientId } = await req.json();

  if (!patientId) {
    return NextResponse.json(
      { success: false, error: "Missing patientId" },
      { status: 400 }
    );
  }

  const summary = await processPatientContext(patientId);
  return NextResponse.json({ success: true, summary });
}
