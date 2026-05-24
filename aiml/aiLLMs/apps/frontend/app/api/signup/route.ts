import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prismaCl";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const { name, email, password, role } = payload; //extracts:
  const displayName = String(name || "").trim();
// name
// email
// password
// role ("USER" or "DOCTOR")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase server credentials" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: displayName,
      role,
    },
  });
  // supabase auth user create krdiya hai, auth k andr role daal diya aur new user in data.user
  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || "Signup failed" },
      { status: 400 }
    );
  }
  const authUserId = data.user.id;
  // ye id supabase auth user aur prisma db users ko link krta h
  try {
    if (role === "DOCTOR") {
      const doctor = await prisma.doctor.create({
        data: { authUserId, name: displayName, email },
      });
      return NextResponse.json({ username: doctor.name, success: true }); //greet popup with name
    }
    if (role === "USER") {
      const user = await prisma.user.create({
        data: { authUserId, name: displayName, email },
      });
      return NextResponse.json({ username: user.name, success: true });
    }
    if (role === "ADMIN") {
      const admin = await prisma.admin.create({
        data: { email, password },
      });
      return NextResponse.json({ username: admin.email, success: true });
    }
    //depending upon role, save user inside prima database
    await supabase.auth.admin.deleteUser(authUserId);
    return NextResponse.json(
      { error: "Unsupported role" },
      { status: 400 }
    );
  } catch (err) {
    //rollback supabase user creation
    await supabase.auth.admin.deleteUser(authUserId);
    return NextResponse.json(
      { error: "Signup failed during database operation" },
      { status: 500 }
    );
    //if error, half hi create hogi file
  }
}
