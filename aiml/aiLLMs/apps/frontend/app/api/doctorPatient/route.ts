import { NextRequest, NextResponse } from "next/server";
import prisma  from "@/db/prisma/prismaCl";

export async function GET(req: NextRequest) {
  try {
    const doctorAuthId = req.nextUrl.searchParams.get("token");
    if (!doctorAuthId) {
      return NextResponse.json({ success: false, error: "Missing token" });
    }
    const doctor = await prisma.doctor.findUnique({
      where: { authUserId: doctorAuthId },
      select: { id: true },
    });
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      );
    }
//req.nextUrl
// This gives you a URL object of the current request.
// .searchParams
// This gives you the URL's query parameters.
// .get("token")
// This extracts the value associated with the key "token".
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            reports: {
              where: {
                doctorId: doctor.id,
              },
            },
          },
        },
      },
    });
    console.log({ users });
// Give doctors the full patient list so they can upload a first report.
// _count.reports still exposes whether this doctor already has reports for each patient.

    //disease string has all context summed up from all three bots
    //reports can be showed up on left side as toggle
    //reports->diagnosis->Ai analysis could be shown

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to sync user" });
  }
}
