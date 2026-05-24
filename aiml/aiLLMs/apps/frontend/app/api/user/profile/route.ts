import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

export async function GET() { // fetches the details of the current user
  const supabase = await createSupabaseServerClient();
//   This gives you a secure server-side Supabase client where:
// cookies are automatically attached
// tokens are verified
// user session is read securely
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
// retrieves logged in user's data and authorise
  try {
    const dbUser = await prisma.user.findUnique({
      where: { authUserId: user.id },
    });
// supabase pr upar keval authorisation hoti hai, but details nhi hoti, 
// details k liye hum prisma use kr rhe h
    if (dbUser) {
      return NextResponse.json({ ...dbUser, role: "USER" });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { authUserId: user.id },
      include: {
        reports: {
          select: {
            id: true,
            userId: true,
            confirmed: true,
            diagnosis: { select: { id: true } },
          },
        },
        specialization: true,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reviewedReports = doctor.reports.filter(
      (report) => report.confirmed || report.diagnosis.length > 0
    );
    const pendingReports = doctor.reports.filter(
      (report) => !report.confirmed && report.diagnosis.length === 0
    );

    return NextResponse.json({
      ...doctor,
      role: "DOCTOR",
      stats: {
        totalPatients: new Set(doctor.reports.map((report) => report.userId)).size,
        reviewedPatients: new Set(reviewedReports.map((report) => report.userId)).size,
        reviewedReports: reviewedReports.length,
        pendingReports: pendingReports.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
// agr authorise hogya aur profile nhi mili, means signup authorise nhi hua h
export async function PUT(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
// validation k liye hai ki agr login nhi hai to login krlo
  try {
    const { name, disease } = await req.json();
// front end se name aur disease aaya h
    const existingUser = await prisma.user.findUnique({
      where: { authUserId: user.id },
      select: { id: true },
    });

    if (!existingUser) {
      const updatedDoctor = await prisma.doctor.update({
        where: { authUserId: user.id },
        data: { name },
      });
      return NextResponse.json({ ...updatedDoctor, role: "DOCTOR" });
    }

    const updatedUser = await prisma.user.update({
      where: { authUserId: user.id },
      data: { name, disease },
    });
    //prisma pr update kra h

    return NextResponse.json({ ...updatedUser, role: "USER" });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
