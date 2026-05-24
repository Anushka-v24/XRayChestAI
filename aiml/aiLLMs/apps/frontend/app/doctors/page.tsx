"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import supabase from "@/app/lib/supabaseClient";
import { FileText, Mail, Stethoscope, UserRoundCheck } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  email: string;
  verified?: boolean;
  specialization?: { type?: string | null; description?: string | null } | null;
  _count?: { reports?: number };
};

type Report = {
  id: string;
  date: string;
  doctor?: { name?: string | null } | null;
};

type Patient = {
  reports?: Report[];
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingDoctorId, setSendingDoctorId] = useState("");
  const [message, setMessage] = useState("");

  const latestReport = useMemo(
    () =>
      [...(patient?.reports ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0],
    [patient]
  );

  async function loadData() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const [doctorResult, patientResult] = await Promise.all([
        axios.get("/api/doctors", { validateStatus: () => true }),
        session?.user?.id
          ? axios.get(`/api/patients?token=${session.user.id}`, {
              validateStatus: () => true,
            })
          : Promise.resolve({ data: null }),
      ]);

      if (doctorResult.data?.success) {
        setDoctors(doctorResult.data.doctors ?? []);
      } else {
        setMessage(doctorResult.data?.error || "Unable to load doctors.");
      }

      if (patientResult.data?.success) {
        setPatient(patientResult.data.result);
      }
    } catch (error) {
      console.warn("Failed to load doctor list:", error);
      setMessage("Unable to load doctor list right now.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReport(doctor: Doctor) {
    if (!latestReport?.id) {
      setMessage("Upload an Xray image before sending a report to a doctor.");
      return;
    }

    setSendingDoctorId(doctor.id);
    setMessage("");

    try {
      const res = await fetch(`/api/reports/${latestReport.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctor.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send report to doctor");
      }

      setMessage(`Latest report sent to Dr. ${doctor.name}.`);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send report to doctor");
    } finally {
      setSendingDoctorId("");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="glass-panel accent-rule rounded-[28px] p-6 pl-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Doctor List</h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a doctor and send your latest generated Xray report for review.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-teal-500 text-white shadow-lg shadow-teal-200">
            <Stethoscope size={26} />
          </div>
        </div>
      </section>

      {message && (
        <div className="glass-panel rounded-[22px] p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}

      <section className="glass-panel rounded-[26px] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-slate-950">Latest Report Status</h2>
            <p className="mt-1 text-sm text-slate-500">
              {latestReport
                ? `Latest report from ${new Date(latestReport.date).toLocaleString()}`
                : "No generated report available yet."}
            </p>
          </div>
          <div className="rounded-[18px] bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
            {latestReport?.doctor?.name
              ? `Sent to Dr. ${latestReport.doctor.name}`
              : "Not sent yet"}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="glass-panel rounded-[26px] p-6 text-slate-500">
          Loading doctors...
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="glass-panel soft-float rounded-[26px] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-cyan-100 text-teal-600">
                  <UserRoundCheck size={23} />
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm">
                  {doctor.verified ? "Verified" : "Available"}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-950">Dr. {doctor.name}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Mail size={14} />
                {doctor.email}
              </p>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                {doctor.specialization?.type || "General Medicine"}
                {doctor.specialization?.description
                  ? ` - ${doctor.specialization.description}`
                  : ""}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-[18px] bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800">
                <FileText size={14} />
                {doctor._count?.reports ?? 0} assigned reports
              </div>
              <button
                type="button"
                onClick={() => sendReport(doctor)}
                disabled={!latestReport || sendingDoctorId === doctor.id}
                className="teal-button mt-4 w-full justify-center py-3 disabled:opacity-60"
              >
                {sendingDoctorId === doctor.id ? "Sending..." : "Send Latest Report"}
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
