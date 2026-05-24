import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";

type DoctorReport = {
  id: string;
  userId: string;
  createdAt: Date;
  severity: string | null;
};

type DoctorWithReports = {
  reports: DoctorReport[];
};

export async function GET(req: NextRequest) {
  try {
    const doctorId = req.nextUrl.searchParams.get("token");
    if (!doctorId) {
      return NextResponse.json({ success: false, error: "Missing token" });
    }
    const doctor = await prisma.doctor.findUnique({
      where: { authUserId: doctorId },
      include: {
        specialization: true,
        reports: {
          orderBy: { createdAt: "desc" },
          include: {
            doctor: true,
            user: true,
            aiAnalysis: true,
            diagnosis: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      );
    }

    const result = doctor;
    console.log({ result });
    //disease string has all context summed up from all three bots
    //reports can be showed up on left side as toggle
    //reports->diagnosis->Ai analysis could be shown
    const reports = (doctor as unknown as DoctorWithReports).reports;
    const totalReports = reports.length;
    const totalPatients =
      new Set(reports.map((r) => r.userId)).size ?? 0;
    const reviewedReports = reports.filter((report) => report.confirmed).length;
    const reviewedPatients = new Set(
      reports.filter((report) => report.confirmed).map((report) => report.userId)
    ).size;
    const pendingReports = reports.filter((report) => !report.confirmed).length;
    const accuracy = "0.75";

 const trend = reports.reduce((acc: Record<string, number>, report) => {
  const month = new Date(report.createdAt).toLocaleString('default', { month: 'short' });
  acc[month] = (acc[month] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const trendData = Object.entries(trend).map(([month, count]) => ({
  month,
  reports: count,
}));


 const severityCounts = reports.reduce((acc: Record<string, number>, report) => {
  const key = report.severity || "Unknown";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const scanDist = Object.entries(severityCounts).map(([type, count]) => ({
  type,
  count,
}));

    return NextResponse.json({
      success: true,
      doctor,
      stats: {
        totalReports,
        totalPatients,
        reviewedReports,
        reviewedPatients,
        pendingReports,
        accuracy,
        trend: trendData,
        scanDist,
      },
      reports,
    });
   
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to sync user" });
  }
}
