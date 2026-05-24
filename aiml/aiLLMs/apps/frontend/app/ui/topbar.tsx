"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabaseClient";
import Link  from "next/link";
import { Bell, LogIn, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string;
  doctorName: string;
  createdAt: string;
};

export default function Topbar() {
  const [userName, setUserName] = useState("Guest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
        loadNotifications();
      } else {
        setUserName("Guest");
        setIsLoggedIn(false);
        setNotifications([]);
      }
    }

    getUser();

    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications ?? []);
        }
      } catch (error) {
        console.warn("Failed to load notifications:", error);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserName(getDisplayName(session.user));
        setIsLoggedIn(true);
        loadNotifications();
      } else {
        setUserName("Guest");
        setIsLoggedIn(false);
        setNotifications([]);
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
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative rounded-lg border border-white/90 bg-white/85 p-2 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-teal-700 hover:shadow-md"
            aria-label="Open notifications"
          >
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-black text-white">
                {notifications.length}
              </span>
            )}
            <Bell size={17} />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 z-50 mt-3 w-80 rounded-[22px] border border-white/90 bg-white p-3 shadow-2xl shadow-cyan-900/20">
              <div className="border-b border-slate-100 pb-2 text-sm font-black text-slate-950">
                Notifications
              </div>
              <div className="max-h-80 overflow-y-auto py-2">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href="/patient-dashboard"
                      onClick={() => setNotificationsOpen(false)}
                      className="block rounded-[18px] p-3 transition hover:bg-cyan-50"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-teal-700">
                        {notification.doctorName} •{" "}
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500">
                    No doctor reviews yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
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
