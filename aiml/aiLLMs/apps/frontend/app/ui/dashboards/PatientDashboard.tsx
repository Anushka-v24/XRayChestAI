"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MotionCard from "../MotionCard";
import StatCard from "./StatCard";
import supabase from "@/app/lib/supabaseClient";
import Link from "next/link";
import { ReportDownloadButton } from "@/app/components/chatbot/ReportDownloadButton";
import { RichMedicalText } from "@/app/components/chatbot/RichMedicalText";
import {
  Bot,
  Bell,
  Download,
  FileText,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  X,
} from "lucide-react";

type Report = {
  id: string;
  imageUrl: string;
  date: string;
  createdAt: string;
  confirmed: boolean;
  severity?: string | null;
  reportText?: string | null;
  aiAnalysis?: { findings?: string | null; confidence?: number | null } | null;
  diagnosis?: Array<{ title?: string; notes?: string | null; createdAt?: string | Date }>;
  doctor?: { name?: string | null; email?: string | null } | null;
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

function formatConfidence(value?: number | null) {
  if (typeof value !== "number") return "Pending";
  const percent = value <= 1 ? value * 100 : value;
  if (percent > 0 && percent < 1) return "<1%";
  if (percent < 10) return `${percent.toFixed(1)}%`;
  return `${Math.round(percent)}%`;
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
  const latestConfidence = formatConfidence(latestReport?.aiAnalysis?.confidence);
  const latestDoctorReview = latestReport?.diagnosis?.[0];
  const [showReviewPop, setShowReviewPop] = useState(false);
  const quickActions = [
    { title: "Upload X-Ray", text: "Send a scan for AI prediction.", href: "/medical-assistant", icon: UploadCloud },
    { title: "Chat with AI", text: "Ask about symptoms and precautions.", href: "/chatbot", icon: Bot },
    { title: "Downloads", text: "Save PDF medical reports.", href: "?downloads=open", icon: Download },
  ];

  useEffect(() => {
    if (!latestDoctorReview || !latestReport?.id) return;

    const seenKey = `doctor-review-seen:${latestDoctorReview.createdAt ?? latestReport.id}`;
    if (window.localStorage.getItem(seenKey)) return;

    setShowReviewPop(true);
    window.localStorage.setItem(seenKey, "true");
  }, [latestDoctorReview, latestReport?.id]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="glass-panel accent-rule rounded-[28px] p-5 pl-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
              Patient Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your uploaded Xray images and AI summaries
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[20px] bg-teal-500 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-teal-200">
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
          Upload Xray images, review AI predictions, download reports, and continue guided medical conversations.
        </p>
      </MotionCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickActions.map(({ title, text, href, icon: Icon }) => (
          <Link
            key={title}
            href={href}
            className="glass-panel soft-float rounded-[26px] p-5"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[20px] bg-cyan-100 text-teal-600">
              <Icon size={23} />
            </div>
            <h3 className="font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </Link>
        ))}
      </div>

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
                title="Confidence Score"
                value={latestConfidence}
                tone="amber"
              />
            </MotionCard>
          </div>

          <MotionCard>
            <div className="rounded-[26px] bg-gradient-to-br from-white via-cyan-50/70 to-white p-5 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
                <HeartPulse size={18} className="text-teal-700" />
                Disease Details
              </h2>
              <div className="min-h-[220px] whitespace-pre-wrap text-sm leading-8 text-slate-600 sm:text-base">
                <RichMedicalText
                  text={
                    latestReport?.aiAnalysis?.findings ||
                    latestReport?.reportText ||
                    "Upload an Xray image to generate a detailed disease explanation."
                  }
                />
              </div>
            </div>
          </MotionCard>

          <MotionCard>
            <div className="rounded-[26px] bg-white p-5 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
                <ShieldCheck size={18} className="text-teal-700" />
                Suggestions
              </h2>
              <ul className="grid gap-3 text-sm leading-7 text-slate-600 sm:grid-cols-2">
                <li className="rounded-[20px] bg-cyan-50 p-4">Keep prior Xray images and reports handy for comparison.</li>
                <li className="rounded-[20px] bg-cyan-50 p-4">Consult a qualified doctor before making treatment decisions.</li>
                <li className="rounded-[20px] bg-cyan-50 p-4">Monitor breathing changes, fever, chest pain, and fatigue.</li>
                <li className="rounded-[20px] bg-cyan-50 p-4">Seek urgent care for severe breathlessness, chest pain, or bluish lips.</li>
              </ul>
            </div>
          </MotionCard>

          <MotionCard>
            <div className="rounded-[26px] bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-5 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
                <Stethoscope size={18} className="text-teal-700" />
                Assigned Doctor Review
              </h2>
              {latestDoctorReview ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Reviewed by{" "}
                      <b className="text-slate-800">
                        {latestReport?.doctor?.name || "Assigned doctor"}
                      </b>
                    </span>
                    <span>
                      {latestDoctorReview.createdAt
                        ? new Date(latestDoctorReview.createdAt).toLocaleString()
                        : "Recently reviewed"}
                    </span>
                  </div>
                  <div className="rounded-[22px] border border-teal-100 bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm whitespace-pre-wrap">
                    <p className="mb-2 font-black text-slate-950">
                      {latestDoctorReview.title || "Doctor Review"}
                    </p>
                    {latestDoctorReview.notes || "Your doctor has reviewed this report."}
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-600">
                  Your assigned doctor has not added review notes for the latest report yet.
                </p>
              )}
            </div>
          </MotionCard>

          <MotionCard>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FileText size={18} className="text-teal-700" />
              Latest Uploaded Report
            </h2>
            {latestReport ? (
              <div className="space-y-4">
                <img
                  src={latestReport.imageUrl}
                  alt="Latest uploaded Xray image"
                  className="max-h-96 w-full rounded-[24px] border bg-white object-contain shadow-sm"
                />
                <div className="text-xs text-slate-500">
                  {new Date(latestReport.date).toLocaleString()}
                </div>
                <div className="rounded-[24px] bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm whitespace-pre-wrap">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-black text-slate-950">Formatted AI Medical Report</p>
                    <ReportDownloadButton
                      report={latestReport}
                      patientName={displayName(patient?.name)}
                    />
                  </div>
                  <p>
                    <RichMedicalText
                      text={
                        latestReport.aiAnalysis?.findings ||
                        latestReport.reportText ||
                        "AI analysis is still being prepared."
                      }
                    />
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No Xray images uploaded yet.</p>
            )}
          </MotionCard>

          {showHistory && (
            <MotionCard>
              <h2 className="text-lg font-semibold mb-3">Previous Reports</h2>
              {previousReports.length ? (
                <div className="space-y-4">
                  {previousReports.map((report) => (
                    <div key={report.id} className="rounded-[24px] border border-slate-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="flex gap-4">
                        <img
                          src={report.imageUrl}
                          alt="Previously uploaded Xray image"
                            className="h-28 w-28 rounded-lg object-cover shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500">
                            {new Date(report.date).toLocaleString()}
                          </p>
                          <p className="mt-2 line-clamp-4 text-sm text-slate-700">
                            <RichMedicalText
                              text={
                                report.aiAnalysis?.findings ||
                                report.reportText ||
                                "No analysis saved for this report."
                              }
                            />
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

      {showReviewPop && latestDoctorReview && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-[24px] border border-teal-100 bg-white p-4 shadow-2xl shadow-cyan-900/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-teal-100 text-teal-700">
              <Bell size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-slate-950">Doctor review received</p>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
                {latestDoctorReview.notes}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewPop(false)}
              className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
