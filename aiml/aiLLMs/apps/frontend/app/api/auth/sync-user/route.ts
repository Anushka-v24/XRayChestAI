import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(req: Request) { //Api will handle post requests only
  try {
    console.log("Sync user called");
    const { authUserId, email, name, role } = await req.json(); // extracts data sent by client
    const normalizedRole = String(role || "USER").trim().toUpperCase();
    const displayName = String(name || "").trim() || "User";

    if (!authUserId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing auth user id or email" },
        { status: 400 }
      );
    }
    //authUserId: ID from your auth provider (Clerk, Firebase, NextAuth, etc.)
    const existingUser =
      normalizedRole === "DOCTOR"
        ? await prisma.doctor.findUnique({ where: { authUserId } })
        : await prisma.user.findUnique({ where: { authUserId } });
//checks in doctor table and then checks in user table
    if (existingUser) {
      return NextResponse.json({ success: true, message: "Already synced", profile: existingUser });
    }
    //already exists, no need to insert
    if (normalizedRole === "DOCTOR") {
      const doctor = await prisma.doctor.create({
        data: { authUserId, email, name: displayName },
      });
      return NextResponse.json({ success: true, doctor });
    } else {
      const user = await prisma.user.create({
        data: { authUserId, email, name: displayName },
      });
      return NextResponse.json({ success: true, user });
    }
  } catch (err) {
    console.error(err);
    const error = err instanceof Error ? err.message : "Failed to sync user";

    if (
      error.includes("P6008") ||
      error.includes("Can't reach database server") ||
      error.includes("Accelerate was not able to connect")
    ) {
      return NextResponse.json(
        {
          success: true,
          synced: false,
          warning: "Auth succeeded, but database sync is temporarily unavailable.",
        },
        { status: 202 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}
