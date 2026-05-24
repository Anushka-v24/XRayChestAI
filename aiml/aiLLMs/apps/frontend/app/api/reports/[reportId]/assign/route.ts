import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

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
    const { doctorId } = await req.json();

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "Select a doctor first" },
        { status: 400 }
      );
    }

    const patient = await prisma.user.findUnique({
      where: { authUserId: user.id },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Only patients can send reports to doctors" },
        { status: 403 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: String(doctorId) },
      select: { id: true, name: true },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true },
    });

    if (!report || report.userId !== patient.id) {
      return NextResponse.json(
        { success: false, error: "Report not found for this patient" },
        { status: 404 }
      );
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { doctorId: doctor.id },
      include: {
        aiAnalysis: true,
        diagnosis: { orderBy: { createdAt: "desc" } },
        doctor: true,
      },
    });

    return NextResponse.json({ success: true, doctor, report: updatedReport });
  } catch (err) {
    console.error("Failed to send report to doctor:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send report to doctor" },
      { status: 500 }
    );
  }
}
