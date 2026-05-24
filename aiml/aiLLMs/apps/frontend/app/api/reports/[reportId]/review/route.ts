import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { processPatientContext } from "@/app/lib/processPatientContext";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reportId } = await params;
    const { title, notes, confirmed } = await req.json();
    const cleanNotes = String(notes || "").trim();

    if (!cleanNotes) {
      return NextResponse.json(
        { success: false, error: "Diagnosis notes are required" },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { authUserId: user.id },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Only doctors can submit reviews" },
        { status: 403 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true, doctorId: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.doctorId && report.doctorId !== doctor.id) {
      return NextResponse.json(
        { success: false, error: "This report is assigned to another doctor" },
        { status: 403 }
      );
    }

    const diagnosis = await prisma.diagnosis.create({
      data: {
        reportId,
        title: String(title || "Doctor Review").trim(),
        notes: cleanNotes,
      },
    });

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        confirmed: Boolean(confirmed ?? true),
        doctorId: doctor.id,
      },
      include: {
        aiAnalysis: true,
        diagnosis: true,
        doctor: { include: { specialization: true } },
        user: true,
      },
    });

    processPatientContext(report.userId).catch(console.error);

    return NextResponse.json({ success: true, diagnosis, report: updatedReport });
  } catch (err) {
    console.error("Failed to save doctor review:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save doctor review" },
      { status: 500 }
    );
  }
}
