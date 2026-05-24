"use client";

import React from "react";
import MotionCard from "../ui/MotionCard";

interface ReportCarouselProps {
  reports: any[];
}

export default function ReportCarousel({ reports }: ReportCarouselProps) {
  if (!reports.length)
    return (
      <div className="text-gray-500 dark:text-gray-400">
        No reports found yet.
      </div>
    );
console.log({reports})
  return (
    <>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {reports.map((r, i) => (
          <MotionCard
            key={i}
            className="snap-center min-w-[300px] md:min-w-[380px] p-4 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
  {new Date(r.createdAt).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })}
</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  r.confirmed ? "bg-green-500" : "bg-yellow-500"
                } text-white`}
              >
                {r.confirmed ? "Confirmed" : "Pending"}
              </span>
            </div>

            {/* Image */}
            {r.imageUrl && (
              <img
                src={r.imageUrl}
                alt="Report Image"
                className="mt-3 rounded-xl max-h-52 object-cover w-full border hover:scale-[1.02] transition"
              />
            )}

            {/* Details */}
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-3 space-y-2">
              <div>
                <b>Date:</b> {new Date(r.date).toLocaleDateString()}
              </div>

              {r.severity && (
                <div>
                  <b>Severity:</b>{" "}
                  <span
                    className={`px-2 py-1 rounded-md text-xs ${
                      r.severity === "SEVERE"
                        ? "bg-red-500 text-white"
                        : r.severity === "MODERATE"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {r.severity}
                  </span>
                </div>
              )}
   <div>
                <b>{r.user.name}</b> 
              </div>
              {r.diagnosis?.length > 0 && (
                <div>
                  <b>Diagnosis:</b>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {r.diagnosis.map((d: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-full"
                      >
                        {d.type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-1 whitespace-pre-line">
                {r.reportText?.slice(0, 200)}...
              </div>
            </div>
          </MotionCard>
        ))}
      </div>

      <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
        Swipe to view more
      </div>
    </>
  );
}
