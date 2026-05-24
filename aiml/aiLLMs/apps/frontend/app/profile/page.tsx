"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Download,
  FileImage,
  HeartPulse,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/app/lib/supabaseClient";

const profileCards = [
  { title: "Medical History", text: "Track disease notes, symptoms, and prior clinical context.", icon: HeartPulse },
  { title: "Previous Uploads", text: "Review the X-rays and reports attached to your account.", icon: FileImage },
  { title: "Downloaded Reports", text: "Access PDFs generated for consultations and follow-ups.", icon: Download },
  { title: "Notifications", text: "Manage doctor comments, approvals, and report status alerts.", icon: Bell },
  { title: "Security Settings", text: "Keep your session and account access protected.", icon: ShieldCheck },
];

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [disease, setDisease] = useState("");
  const [role, setRole] = useState("USER");
  const [doctorStats, setDoctorStats] = useState({
    totalPatients: 0,
    reviewedPatients: 0,
    reviewedReports: 0,
    pendingReports: 0,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/user/profile`);

        if (!res.ok) {
          setMessage("Failed to load profile");
          setLoading(false);
          return;
        }

        const user = await res.json();

        setName(user.name || "");
        setEmail(user.email || "");
        setDisease(user.disease || "");
        setRole(user.role || "USER");
        if (user.stats) {
          setDoctorStats({
            totalPatients: user.stats.totalPatients ?? 0,
            reviewedPatients: user.stats.reviewedPatients ?? 0,
            reviewedReports: user.stats.reviewedReports ?? 0,
            pendingReports: user.stats.pendingReports ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, disease }),
      });

      if (res.ok) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { name },
        });
        if (authUpdateError) {
          console.warn("Profile saved, but auth metadata sync failed:", authUpdateError);
        }
        window.dispatchEvent(
          new CustomEvent("profile-updated", {
            detail: { name },
          })
        );
        router.refresh();
        setMessage("Profile updated successfully!");
      } else {
        const error = await res.json();
        setMessage(error.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="glass-panel accent-rule rounded-[28px] p-6 pl-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage personal details, {role === "DOCTOR" ? "clinical review workload" : "medical history"}, notifications, and secure access.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-teal-300 to-cyan-200 text-white shadow-lg shadow-teal-200">
            <UserRound size={26} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel rounded-[28px] p-6">
          <h2 className="text-xl font-black text-slate-950">Editable Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            {role === "DOCTOR" ? "Update your doctor profile." : "Update your name and medical context."}
          </p>

          <div className="mt-5 space-y-4">
            <input type="email" value={email} disabled className="soft-input w-full opacity-75" />
            <input
              type="text"
              value={name}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              className="soft-input w-full"
            />
            {role !== "DOCTOR" && (
              <textarea
                value={disease}
                placeholder="Medical history or known conditions"
                onChange={(e) => setDisease(e.target.value)}
                className="soft-input min-h-32 w-full resize-none"
              />
            )}

            {role === "DOCTOR" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-cyan-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Patients Seen</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">
                    {doctorStats.reviewedPatients}
                  </p>
                </div>
                <div className="rounded-[22px] bg-teal-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Total Assigned Patients</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">
                    {doctorStats.totalPatients}
                  </p>
                </div>
                <div className="rounded-[22px] bg-amber-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Reviews Given</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">
                    {doctorStats.reviewedReports}
                  </p>
                </div>
                <div className="rounded-[22px] bg-rose-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Reviews Left</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">
                    {doctorStats.pendingReports}
                  </p>
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="teal-button w-full py-3">
              <Save size={17} />
              {loading ? "Saving..." : "Save changes"}
            </button>

            {message && (
              <p
                className={`rounded-[20px] p-3 text-center text-sm font-semibold ${
                  message.includes("success")
                    ? "bg-teal-50 text-teal-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {profileCards.map(({ title, text, icon: Icon }) => (
            <article key={title} className="glass-panel soft-float rounded-[26px] p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[20px] bg-cyan-100 text-teal-600">
                <Icon size={23} />
              </div>
              <h3 className="font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
