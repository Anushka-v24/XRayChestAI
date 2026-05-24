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
    const doctors = await prisma.doctor.findMany({
      orderBy: { name: "asc" },
      include: {
        specialization: true,
        _count: {
          select: {
            reports: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, doctors });
  } catch (err) {
    console.error("Failed to load doctors:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load doctors" },
      { status: 500 }
    );
  }
}
