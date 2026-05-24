import { NextRequest, NextResponse } from "next/server";
import prisma  from "@/db/prisma/prismaCl";

export async function GET(req: NextRequest) {
  //function will run when a GET request hits this API route.
  try {
    const patientId = req.nextUrl.searchParams.get("token");
    if (!patientId) {
      return NextResponse.json({ success: false, error: "Missing token" });
    }
    const appUser = await prisma.user.findUnique({
      where: { authUserId: patientId },
      include: {
        reports: {
          include: {
            aiAnalysis: true,
            diagnosis: true,
            doctor: true,
          },
        },
      },
    });
// Search in User table by authUserId
// If found, load all reports
// For each report load:
// ✔ aiAnalysis
// ✔ diagnosis
// ✔ doctor information
// So you get a full patient profile + all connected reports.
    const doctor = await prisma.doctor.findUnique({
      where: { authUserId: patientId },
      include: {
        specialization: true,
      },
    });
//If the token belongs to a doctor, this returns:
// Doctor details
// Their specialization
    const result = appUser || doctor;
console.log({result})
    //disease string has all context summed up from all three bots
    //reports can be showed up on left side as toggle
    //reports->diagnosis->Ai analysis could be shown

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to sync user" });
  }
}
