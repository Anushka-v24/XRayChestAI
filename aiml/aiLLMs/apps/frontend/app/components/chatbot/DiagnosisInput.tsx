"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function DiagnosisInput({
  reportId,
  defaultValue = "",
  onSaved,
}: {
  reportId?: string;
  defaultValue?: string;
  onSaved?: () => void | Promise<void>;
}) {
  const [notes, setNotes] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveReview() {
    if (!reportId || !notes.trim()) {
      setMessage("Select a report and enter diagnosis notes first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/reports/${reportId}/review`, {
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
        throw new Error(data.error || "Failed to save doctor review");
      }

      setMessage("Doctor review sent to patient.");
      await onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save doctor review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">Add Diagnosis Notes</p>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Enter diagnosis for this report..."
        className="resize-none"
        rows={4}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {message && <p className="text-xs font-medium text-slate-600">{message}</p>}
        <Button
          type="button"
          onClick={saveReview}
          disabled={saving || !reportId}
          className="rounded-lg bg-teal-600 shadow-lg shadow-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-700"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {saving ? "Sending..." : "Send Doctor Review"}
        </Button>
      </div>
    </div>
  );
}
// Used when the doctor writes:
// diagnosis notes
// impressions
// manual verification of AI output
