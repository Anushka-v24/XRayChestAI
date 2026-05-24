"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import MotionCard from "../MotionCard";
import StatCard from "./StatCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import supabase from "@/app/lib/supabaseClient";
import { CheckCircle2, ClipboardList, MessageCircle, Search, Stethoscope, XCircle } from "lucide-react";
import { ReportDownloadButton } from "@/app/components/chatbot/ReportDownloadButton";

type Report = {
  id: string;
  imageUrl: string;
  date: string;
  createdAt: string;
  confirmed: boolean;
  severity?: string | null;
  reportText?: string | null;
  aiAnalysis?: { findings?: string | null } | null;
  diagnosis?: Array<{ title?: string; notes?: string | null; createdAt?: string | Date }>;
  user?: { name?: string; email?: string; authUserId?: string };
};

export default function DoctorDashboard() {
  const [stats, setStats] = useState<any>({});
  const [trend, setTrend] = useState<any[]>([]);
  const [scanDist, setScanDist] = useState<any[]>([]);
  const [queryUser, setQueryUser] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [searchedReports, setSearchedReports] = useState<Report[]>([]);
  const [status, setStatus] = useState("Loading doctor dashboard...");

  useEffect(() => {
    loadDoctorDashboard();
  }, []);

  async function loadDoctorDashboard() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setStatus("Please sign in as a doctor to view assigned reports.");
        return;
      }

      const result = await axios.get(`/api/doctor?token=${session.user.id}`, {
        validateStatus: () => true,
      });
      if (!result.data?.success) {
        setStatus(
          result.data?.error ||
            "No doctor profile found for the signed-in account."
        );
        return;
      }

      const doctorReports = [...(result.data.reports ?? [])].sort(
        (a: Report, b: Report) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setStats(result.data.stats ?? {});
      setTrend(result.data.stats?.trend ?? []);
      setScanDist(result.data.stats?.scanDist ?? []);
      setReports(doctorReports);
      setStatus("");
    } catch (err) {
      console.warn("Failed to load doctor dashboard:", err);
      setStatus("Unable to load doctor dashboard right now.");
    }
  }

  async function handleFetch() {
    if (!queryUser.trim()) return;

    try {
      const result = await axios.get(
        `/api/patients?token=${encodeURIComponent(queryUser.trim())}`,
        { validateStatus: () => true }
      );

      if (!result.data?.success || !result.data?.result) {
        setSearchedReports([]);
        return;
      }

      const patientReports = [...(result.data?.result?.reports ?? [])].sort(
        (a: Report, b: Report) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSearchedReports(patientReports);
    } catch (err) {
      console.warn("Failed to search patient reports:", err);
      setSearchedReports([]);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="glass-panel accent-rule rounded-[28px] p-5 pl-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
              Doctor Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Assigned reports, patient review, and scan activity
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[20px] bg-teal-500 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-teal-200">
            <Stethoscope size={16} />
            Clinical review
          </div>
        </div>
      </div>
      {status && (
        <MotionCard>
          <p className="text-sm text-slate-600">{status}</p>
        </MotionCard>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MotionCard>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients ?? 0}
            hint="Assigned through reports"
          />
        </MotionCard>
        <MotionCard>
          <StatCard
            title="Total Reports"
            value={stats.totalReports ?? reports.length}
            hint="Uploaded reports"
            tone="cyan"
          />
        </MotionCard>
        <MotionCard>
          <StatCard
            title="Reviewed Patients"
            value={stats.reviewedPatients ?? 0}
            hint="Patients with doctor review"
            tone="amber"
          />
        </MotionCard>
        <MotionCard>
          <StatCard
            title="Reviews Left"
            value={stats.pendingReports ?? 0}
            hint="Reports waiting for notes"
            tone="cyan"
          />
        </MotionCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionCard>
          <h2 className="font-medium mb-2">Scans Over Time</h2>
          <div className="h-72 min-h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#0f766e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard>
          <h2 className="font-medium mb-2">Disease Distribution</h2>
          <div className="h-72 min-h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scanDist}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>
      </div>

      <MotionCard>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <ClipboardList size={18} className="text-teal-700" />
          Assigned Patient Reports
        </h2>
        {reports.length ? (
          <ReportGrid reports={reports} onReviewed={loadDoctorDashboard} />
        ) : (
          <div className="text-slate-500 dark:text-gray-400">
            No assigned reports found for this doctor account.
          </div>
        )}
      </MotionCard>

      <MotionCard>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <Search size={18} className="text-teal-700" />
          Search Patient Reports
        </h2>
        <div className="flex gap-3">
          <input
            value={queryUser}
            onChange={(e) => setQueryUser(e.target.value)}
            className="soft-input min-w-0 flex-1"
            placeholder="Enter patient auth user id..."
          />
          <button
            onClick={handleFetch}
            className="teal-button px-4 py-2"
          >
            Search
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {searchedReports.length > 0 ? (
            <ReportGrid reports={searchedReports} onReviewed={handleFetch} />
          ) : (
            <div className="text-slate-500 dark:text-gray-400">
              No searched reports loaded yet.
            </div>
          )}
        </div>
      </MotionCard>
    </div>
  );
}

function ReportGrid({
  reports,
  onReviewed,
}: {
  reports: Report[];
  onReviewed?: () => void | Promise<void>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {reports.map((report) => (
        <ReviewableReportCard
          key={report.id}
          report={report}
          onReviewed={onReviewed}
        />
      ))}
    </div>
  );
}

function ReviewableReportCard({
  report,
  onReviewed,
}: {
  report: Report;
  onReviewed?: () => void | Promise<void>;
}) {
  const [notes, setNotes] = useState(report.diagnosis?.[0]?.notes ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveReview() {
    if (!notes.trim()) {
      setMessage("Add diagnosis notes before sending the review.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/reports/${report.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Doctor Review",
          notes,
          confirmed: true,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send doctor review");
      }

      setMessage("Doctor review sent to patient.");
      await onReviewed?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send doctor review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[26px] border border-white/90 bg-white/85 p-4 shadow-lg shadow-cyan-900/8 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">
            {report.user?.name ?? "Patient report"}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(report.date).toLocaleString()}
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
            report.confirmed ? "bg-green-600" : "bg-yellow-600"
          }`}
        >
          {report.confirmed ? "Reviewed" : "Pending"}
        </span>
      </div>
      <img
        src={report.imageUrl}
        alt="Radiology report"
        className="mt-3 max-h-56 w-full rounded-[22px] border object-contain shadow-sm"
      />
      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {report.aiAnalysis?.findings ||
          report.reportText ||
          "No AI analysis saved for this report."}
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="soft-input mt-4 min-h-24 w-full resize-none"
        placeholder="Add diagnosis notes, prescriptions, or follow-up instructions..."
      />
      {message && <p className="mt-2 text-xs font-semibold text-slate-600">{message}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={saveReview}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[18px] bg-teal-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-teal-200 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          <CheckCircle2 size={15} />
          {saving ? "Sending..." : "Send Review"}
        </button>
        <button className="inline-flex items-center gap-2 rounded-[18px] bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-md transition hover:-translate-y-0.5">
          <XCircle size={15} />
          Reject
        </button>
        <button className="inline-flex items-center gap-2 rounded-[18px] bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-md transition hover:-translate-y-0.5">
          <MessageCircle size={15} />
          Chat
        </button>
        <ReportDownloadButton
          report={report}
          patientName={report.user?.name ?? "Patient"}
          className="px-3 py-2 text-xs"
        />
      </div>
    </div>
  );
}
