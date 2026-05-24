"use client"
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ProfileButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
console.log({user});    
  return user ? <p>{user.email} {user.user_metadata?.role}</p> : <p>Not logged in</p>;
}
