"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabaseClient";
import Link  from "next/link";
import { Bell, LogIn, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const [userName, setUserName] = useState("Guest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  function getDisplayName(user: any) {
    return user?.user_metadata?.name?.trim() || "User";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserName("Guest");
    setIsLoggedIn(false);
    router.push("/auth/login");
  }

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserName(getDisplayName(session.user));
        setIsLoggedIn(true);
      } else {
        setUserName("Guest");
        setIsLoggedIn(false);
      }
    }

    getUser();


    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserName(getDisplayName(session.user));
        setIsLoggedIn(true);
      } else {
        setUserName("Guest");
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="mx-4 mt-4 flex items-center justify-between rounded-lg border border-white/80 bg-white/60 px-4 py-3 shadow-lg shadow-cyan-900/5 backdrop-blur-xl sm:mx-6 lg:mx-8">
      <div>
        <div className="text-sm font-bold text-slate-900">Your Health, Our Priority</div>
        <div className="text-xs text-slate-500">Reports, insights, and care context</div>
      </div>
      <div className="flex gap-4 items-center">
        <button className="rounded-lg border border-white/90 bg-white/85 p-2 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-teal-700 hover:shadow-md">
          <Bell size={17} />
        </button>
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-md shadow-cyan-900/10 transition hover:-translate-y-0.5"
            >
              <UserRound size={16} />
              {userName}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/90 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-red-700 hover:shadow-md"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="teal-button"
          >
            <LogIn size={16} />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
