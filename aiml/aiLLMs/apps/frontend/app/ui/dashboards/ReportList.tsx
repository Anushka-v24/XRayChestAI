"use client";
import React from "react";

interface Doc {
  id?: string;
  source?: string;
  snippet?: string;
  uploaded_at?: string;
  metadata?: Record<string, any>;
}

interface Props {
  docs: Doc[];
}

export default function ReportList({ docs }: Props) {
  if (!docs || docs.length === 0) {
    return <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-500">No reports found.</div>;
  }

  return (
    <div className="space-y-3">
      {docs.map((d, i) => (
        <div key={d.id ?? i} className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="text-sm text-gray-500">Source: {d.source ?? "unknown"}</div>
              <div className="mt-2 text-gray-800">{(d.snippet ?? d.metadata?.summary ?? "").slice(0, 240)}{(d.snippet ?? "").length > 240 ? "..." : ""}</div>
            </div>
            <div className="text-xs text-gray-400 text-right">
              <div>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : ""}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
