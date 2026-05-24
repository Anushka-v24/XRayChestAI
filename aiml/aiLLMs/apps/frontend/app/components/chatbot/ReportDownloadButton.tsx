"use client";

import { Download } from "lucide-react";

type Report = {
  id?: string;
  imageUrl?: string;
  date?: string | Date;
  reportText?: string | null;
  severity?: string | null;
  confirmed?: boolean;
  aiAnalysis?: { findings?: string | null; confidence?: number | null } | null;
  diagnosis?: Array<{ title?: string; notes?: string | null }>;
  user?: { name?: string; email?: string };
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value?: string | Date) {
  if (!value) return "Recently generated";
  return new Date(value).toLocaleString();
}

const CONFIDENT_PERCENT_THRESHOLD = 30;

function formatPercent(value: number) {
  if (value > 0 && value < 0.01) return "<0.01%";
  if (value > 0 && value < 1) return `${value.toFixed(2)}%`;
  if (value < 10) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
}

function formatConfidence(value?: number | null) {
  if (typeof value !== "number") return "Pending";
  const percent = value <= 1 ? value * 100 : value;
  if (percent < CONFIDENT_PERCENT_THRESHOLD) {
    return `No confident disease detected (${formatPercent(percent)})`;
  }
  return formatPercent(percent);
}

function medicalHtml(value: string) {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function ReportDownloadButton({
  report,
  patientName = "Patient",
  className = "",
}: {
  report?: Report | null;
  patientName?: string;
  className?: string;
}) {
  function downloadReport() {
    if (!report) return;

    const findings =
      report.aiAnalysis?.findings ||
      report.reportText ||
      "AI analysis is still being prepared.";
    const confidence = formatConfidence(report.aiAnalysis?.confidence);
    const diagnosis =
      report.diagnosis?.length
        ? report.diagnosis
            .map(
              (item) =>
                `<li><strong>${escapeHtml(item.title || "Diagnosis")}</strong><br/>${escapeHtml(
                  item.notes || "No notes added."
                )}</li>`
            )
            .join("")
        : "<li>No doctor diagnosis notes added yet.</li>";

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AI Chest X-Ray Medical Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      color: #0f172a;
      background: linear-gradient(135deg, #effefe 0%, #ffffff 45%, #dff8fb 100%);
    }
    .page {
      min-height: 100vh;
      padding: 34px;
      background: rgba(255,255,255,0.88);
      border: 1px solid rgba(255,255,255,0.95);
      border-radius: 28px;
      box-shadow: 0 28px 80px rgba(15, 118, 128, 0.16);
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 24px;
      border-bottom: 2px solid #c7f3f6;
    }
    .brand {
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .mark {
      width: 54px;
      height: 54px;
      border-radius: 18px;
      background: linear-gradient(135deg, #69d3d8, #18aab3);
      display: grid;
      place-items: center;
      color: white;
      font-size: 28px;
      font-weight: 900;
    }
    h1 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
    h2 { margin: 0 0 12px; font-size: 17px; }
    p { line-height: 1.65; }
    .muted { color: #64748b; font-size: 13px; margin-top: 4px; }
    .status {
      padding: 10px 14px;
      border-radius: 999px;
      background: #dff8fb;
      color: #0f766e;
      font-size: 12px;
      font-weight: 800;
      height: fit-content;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin: 24px 0;
    }
    .metric, .section {
      border: 1px solid #d8f5f7;
      background: rgba(255,255,255,0.9);
      border-radius: 22px;
      padding: 16px;
      box-shadow: 0 12px 32px rgba(15, 118, 128, 0.08);
    }
    .label { color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
    .value { margin-top: 6px; font-size: 18px; font-weight: 900; }
    .scan {
      width: 100%;
      max-height: 390px;
      object-fit: contain;
      background: white;
      border: 1px solid #d8f5f7;
      border-radius: 24px;
      padding: 10px;
    }
    .section { margin-top: 18px; }
    .findings { white-space: pre-wrap; font-size: 14px; color: #334155; }
    ul { margin: 0; padding-left: 20px; color: #334155; line-height: 1.7; }
    .footer {
      margin-top: 26px;
      padding-top: 18px;
      border-top: 1px solid #d8f5f7;
      color: #64748b;
      font-size: 12px;
    }
    strong { font-weight: 900; color: #0f172a; }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div class="brand">
        <div class="mark">+</div>
        <div>
          <h1>AI Chest X-Ray Medical Report</h1>
          <div class="muted">CarePlus RAD AI | Generated ${escapeHtml(new Date().toLocaleString())}</div>
        </div>
      </div>
      <div class="status">${escapeHtml(report.confirmed ? "Doctor Verified" : "AI Generated")}</div>
    </header>

    <section class="grid">
      <div class="metric"><div class="label">Patient</div><div class="value">${escapeHtml(patientName)}</div></div>
      <div class="metric"><div class="label">Report Date</div><div class="value">${escapeHtml(formatDate(report.date))}</div></div>
      <div class="metric"><div class="label">Confidence</div><div class="value">${escapeHtml(confidence)}</div></div>
    </section>

    ${
      report.imageUrl
        ? `<section class="section"><h2>Uploaded Chest X-Ray</h2><img class="scan" src="${escapeHtml(report.imageUrl)}" alt="Uploaded chest X-ray" /></section>`
        : ""
    }

    <section class="section">
      <h2>AI Medical Analysis</h2>
      <div class="findings">${medicalHtml(findings)}</div>
    </section>

    <section class="section">
      <h2>Doctor Notes / Diagnosis</h2>
      <ul>${diagnosis}</ul>
    </section>

    <section class="section">
      <h2>Suggested Precautions</h2>
      <ul>
        <li>Consult a qualified doctor before making treatment decisions.</li>
        <li>Seek urgent medical care for chest pain, severe breathlessness, bluish lips, or worsening symptoms.</li>
        <li>Keep this report with previous scans for comparison during consultation.</li>
      </ul>
    </section>

    <footer class="footer">
      This AI-generated report is intended for clinical assistance and patient education. It is not a replacement for professional medical diagnosis.
    </footer>
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safePatientName = patientName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    anchor.href = url;
    anchor.download = `${safePatientName || "patient"}-chest-xray-ai-report.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadReport}
      disabled={!report}
      className={`inline-flex items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-lg shadow-cyan-900/10 transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Download size={16} />
      Download Report
    </button>
  );
}
