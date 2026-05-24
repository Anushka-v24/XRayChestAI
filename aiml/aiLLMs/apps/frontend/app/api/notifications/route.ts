import { NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const patient = await prisma.user.findUnique({
      where: { authUserId: user.id },
      select: {
        reports: {
          orderBy: { updatedAt: "desc" },
          include: {
            doctor: true,
            diagnosis: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const notifications = patient.reports.flatMap((report) =>
      report.diagnosis.map((diagnosis) => ({
        id: diagnosis.id,
        reportId: report.id,
        title: diagnosis.title || "Doctor Review",
        message: diagnosis.notes || "Your doctor added a review.",
        doctorName: report.doctor?.name || "Assigned doctor",
        createdAt: diagnosis.createdAt,
      }))
    );

    return NextResponse.json({ success: true, notifications });
  } catch (err) {
    console.error("Failed to load notifications:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}
