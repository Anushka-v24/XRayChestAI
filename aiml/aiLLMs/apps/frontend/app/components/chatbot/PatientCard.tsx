"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReportUploader } from "./ReportUploader";
import { ReportDownloadButton } from "./ReportDownloadButton";
import { RichMedicalText } from "./RichMedicalText";
import { DiagnosisInput } from "./DiagnosisInput";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { CalendarClock, FileCheck2, History } from "lucide-react";

type Report = {
  id: string;
  imageUrl: string;
  date?: string | Date;
  reportText?: string | null;
  aiAnalysis?: { findings?: string | null; confidence?: number | null } | null;
  diagnosis?: Array<{ title?: string; notes?: string | null; createdAt?: string | Date }>;
};

function displayName(name?: string | null) {
  return name && !name.includes("@") ? name : "Patient";
}

export function PatientCard({
  patient,
  role = "DOCTOR",
  doctorId,
  onReportUploaded,
}: {
  patient: any;
  role?: string;
  doctorId?: string | null;
  onReportUploaded?: () => void | Promise<void>;
}) {
  const [verified, setVerified] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const patientData = patient?.result ?? patient;
  const reports = ([...(patientData?.reports ?? [])] as Report[]).sort(
    (a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
  );
  const latestReport = reports[0];
  const previousReports = reports.slice(1);

  useEffect(() => {
    setShowHistory(new URLSearchParams(window.location.search).get("history") === "open");
  }, []);

  return (
    <Card className="m-3 rounded-[28px] border-0 bg-transparent shadow-none sm:m-5">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-slate-950">
              {displayName(patientData?.name)}
            </CardTitle>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {patientData?.disease || "No disease recorded"}
            </p>
          </div>
          <div className="rounded-[20px] border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800">
            {reports.length} reports
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReportUploader
          patientId={patientData?.authUserId}
          doctorId={role === "DOCTOR" ? doctorId : undefined}
          onUploaded={onReportUploaded}
        />
        {latestReport ? (
          <div className="space-y-5 rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-4 shadow-lg shadow-cyan-100/60 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileCheck2 size={16} className="text-cyan-700" />
                Latest Uploaded Xray Result
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarClock size={14} />
                {latestReport.date
                  ? new Date(latestReport.date).toLocaleString()
                  : "Recently uploaded"}
              </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm">
                Current
              </span>
            </div>
            <img
              src={latestReport.imageUrl}
              alt="Latest uploaded Xray image"
              className="min-h-[420px] w-full rounded-[26px] border border-white bg-white object-contain p-2 shadow-sm lg:min-h-[560px]"
            />
            <div className="rounded-[26px] bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm whitespace-pre-wrap sm:p-5">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-black text-slate-950">Detailed Medical Analysis</p>
                <ReportDownloadButton
                  report={latestReport}
                  patientName={displayName(patientData?.name)}
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
          <p className="text-sm text-slate-500">No Xray images uploaded yet.</p>
        )}

        {showHistory && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <History size={16} className="text-slate-500" />
              Previous Reports
            </p>
            {previousReports.length === 0 ? (
              <p className="text-sm text-slate-500">No previous reports.</p>
            ) : (
              previousReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-[24px] border border-slate-100 bg-white/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex gap-3">
                    <img
                      src={report.imageUrl}
                      alt="Previously uploaded Xray image"
                      className="h-24 w-24 rounded-[18px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">
                        {report.date
                          ? new Date(report.date).toLocaleString()
                          : "Previously uploaded"}
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm text-slate-700">
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
              ))
            )}
          </div>
        )}
        <div className={`${role !== "DOCTOR" ? "hidden" : ""}`}>
          <DiagnosisInput
            reportId={latestReport?.id}
            defaultValue={latestReport?.diagnosis?.[0]?.notes ?? ""}
            onSaved={onReportUploaded}
          />
          <div className="flex items-center gap-2 my-2">
            <Switch checked={verified} onCheckedChange={setVerified} />
            <span className="text-sm text-slate-700">Mark AI Analysis as Verified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// 📌 Displays:
// Patient name
// Disease
// Upload Xray image button
// Diagnosis notes (only if doctor)
// Toggle for AI verification

// Only doctors see:
// DiagnosisInput
// Verification switch
