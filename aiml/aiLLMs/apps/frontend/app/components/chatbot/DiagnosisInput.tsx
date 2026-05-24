"use client";
import { Textarea } from "@/components/ui/textarea";

export function DiagnosisInput() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">Add Diagnosis Notes</p>
      <Textarea
        placeholder="Enter diagnosis for this report..."
        className="resize-none"
        rows={4}
      />
    </div>
  );
}
// Used when the doctor writes:
// diagnosis notes
// impressions
// manual verification of AI output