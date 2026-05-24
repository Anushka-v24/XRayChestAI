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
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(dbUser);
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
    const updatedUser = await prisma.user.update({
      where: { authUserId: user.id },
      data: { name, disease },
    });
    //prisma pr update kra h

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}