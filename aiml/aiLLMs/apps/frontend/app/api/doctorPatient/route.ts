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
//req.nextUrl
// This gives you a URL object of the current request.
// .searchParams
// This gives you the URL's query parameters.
// .get("token")
// This extracts the value associated with the key "token".
const users = await prisma.user.findMany({
  where: {
    reports: {
      some: {
        doctorId: doctor?.id,
      },
    },
  },
  distinct: ["id"],
});
    ;
console.log({users})
// “Give me all users where at least one report has doctorId = this doctor’s ID”
// some means → at least one match
// distinct: ["id"] ensures no duplicates even if a user has multiple reports

    //disease string has all context summed up from all three bots
    //reports can be showed up on left side as toggle
    //reports->diagnosis->Ai analysis could be shown

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to sync user" });
  }
}
