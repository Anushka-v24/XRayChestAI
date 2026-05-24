"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MotionCard from "../MotionCard";
import StatCard from "./StatCard";
import supabase from "@/app/lib/supabaseClient";
import { FileText, ShieldCheck } from "lucide-react";

type Report = {
  id: string;
  imageUrl: string;
  date: string;
  createdAt: string;
  confirmed: boolean;
  severity?: string | null;
  reportText?: string | null;
  aiAnalysis?: { findings?: string | null } | null;
  diagnosis?: Array<{ title?: string; notes?: string | null }>;
};

type Patient = {
  name: string;
  email: string;
  disease?: string | null;
  reports?: Report[];
};

function displayName(name?: string | null) {
  return name && !name.includes("@") ? name : "User";
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setShowHistory(new URLSearchParams(window.location.search).get("history") === "open");

    async function loadPatientReports() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          setError("Please sign in to view your reports.");
          return;
        }

        const result = await axios.get(`/api/patients?token=${session.user.id}`);
        if (!result.data?.success || !result.data?.result) {
          setError(result.data?.error || "No patient profile found.");
          return;
        }

        setPatient(result.data.result);
      } catch (err) {
        console.error("Failed to load patient dashboard:", err);
        setError("Unable to load your dashboard right now.");
      } finally {
        setLoading(false);
      }
    }

    loadPatientReports();
  }, []);

  const reports = useMemo(
    () =>
      [...(patient?.reports ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [patient]
  );
  const latestReport = reports[0];
  const previousReports = reports.slice(1);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="glass-panel accent-rule rounded-lg p-5 pl-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
              Patient Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your uploaded radiology reports and AI summaries
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-slate-300">
            <ShieldCheck size={16} />
            Private patient view
          </div>
        </div>
      </div>

      <MotionCard>
        <h2 className="text-xl font-semibold mb-2">
          {patient?.name ? `Welcome, ${displayName(patient.name)}` : "Welcome"}
        </h2>
        <p className="text-slate-600 dark:text-gray-300">
          This dashboard summarizes reports uploaded from your patient account.
        </p>
      </MotionCard>

      {loading ? (
        <MotionCard>
          <p className="text-slate-500">Loading your reports...</p>
        </MotionCard>
      ) : error ? (
        <MotionCard>
          <p className="text-sm text-red-600">{error}</p>
        </MotionCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MotionCard>
              <StatCard title="Uploaded Reports" value={reports.length} />
            </MotionCard>
            <MotionCard>
              <StatCard
                title="Latest Upload"
                value={
                  latestReport
                    ? new Date(latestReport.date).toLocaleDateString()
                    : "None"
                }
                tone="cyan"
              />
            </MotionCard>
            <MotionCard>
              <StatCard
                title="Verified"
                value={reports.filter((report) => report.confirmed).length}
                tone="amber"
              />
            </MotionCard>
          </div>

          <MotionCard>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FileText size={18} className="text-teal-700" />
              Latest Uploaded Report
            </h2>
            {latestReport ? (
              <div className="space-y-4">
                <img
                  src={latestReport.imageUrl}
                  alt="Latest uploaded radiology report"
                  className="max-h-96 w-full rounded-lg border bg-white object-contain shadow-sm"
                />
                <div className="text-xs text-slate-500">
                  {new Date(latestReport.date).toLocaleString()}
                </div>
                <div className="rounded-lg bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm whitespace-pre-wrap">
                  {latestReport.aiAnalysis?.findings ||
                    latestReport.reportText ||
                    "AI analysis is still being prepared."}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No reports uploaded yet.</p>
            )}
          </MotionCard>

          {showHistory && (
            <MotionCard>
              <h2 className="text-lg font-semibold mb-3">Previous Reports</h2>
              {previousReports.length ? (
                <div className="space-y-4">
                  {previousReports.map((report) => (
                    <div key={report.id} className="rounded-lg border border-slate-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="flex gap-4">
                        <img
                          src={report.imageUrl}
                          alt="Previously uploaded radiology report"
                            className="h-28 w-28 rounded-lg object-cover shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500">
                            {new Date(report.date).toLocaleString()}
                          </p>
                          <p className="mt-2 line-clamp-4 text-sm text-slate-700">
                            {report.aiAnalysis?.findings ||
                              report.reportText ||
                              "No analysis saved for this report."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No previous reports.</p>
              )}
            </MotionCard>
          )}
        </>
      )}
    </div>
  );
}
