import { createSupabaseServerClient } from "./supabaseServer";
import axios from "axios";
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  const dbUser = await axios.get("/api/patients", {
    params: { token: user.id },
  });
  return dbUser;
}
