"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Stethoscope } from "lucide-react";

type Notification = {
  id: string;
  reportId: string;
  title: string;
  message: string;
  doctorName: string;
  createdAt: string;
};

const SEEN_NOTIFICATIONS_KEY = "seen-notification-ids";

function getStoredSeenNotificationIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(SEEN_NOTIFICATIONS_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load notifications");
        }

        setNotifications(data.notifications ?? []);
        const seenIds = getStoredSeenNotificationIds();
        const nextSeenIds = Array.from(
          new Set([
            ...seenIds,
            ...(data.notifications ?? []).map((notification: Notification) => notification.id),
          ])
        );
        localStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(nextSeenIds));
        window.dispatchEvent(
          new CustomEvent("notifications-seen", { detail: nextSeenIds })
        );
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="glass-panel accent-rule rounded-[28px] p-6 pl-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              Doctor diagnosis notes and report review updates for your account.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-teal-500 text-white shadow-lg shadow-teal-200">
            <Bell size={26} />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="glass-panel rounded-[26px] p-6 text-slate-500">
          Loading notifications...
        </div>
      ) : message ? (
        <div className="glass-panel rounded-[26px] p-6 text-sm font-semibold text-red-600">
          {message}
        </div>
      ) : notifications.length ? (
        <section className="space-y-4">
          {notifications.map((notification) => (
            <article key={notification.id} className="glass-panel rounded-[26px] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-cyan-100 text-teal-700">
                  <Stethoscope size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-black text-slate-950">
                      {notification.title || "Doctor Diagnosis"}
                    </h2>
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-teal-700">
                    {notification.doctorName}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {notification.message}
                  </p>
                  <Link
                    href="/patient-dashboard"
                    className="mt-4 inline-flex rounded-[18px] bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:text-teal-700"
                  >
                    View report
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="glass-panel rounded-[26px] p-6 text-slate-500">
          No doctor diagnosis notifications yet.
        </div>
      )}
    </div>
  );
}
