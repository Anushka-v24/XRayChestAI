"use client";
import { handleUpload } from "@/app/lib/uploadFile";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
//
export function ReportUploader({
  patientId,
  doctorId,
  onUploaded,
}: {
  patientId?: string;
  doctorId?: string | null;
  onUploaded?: () => void | Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = () => {
    setMessage("");
    // Open the hidden file input when button is clicked
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!patientId) {
        throw new Error("Patient is still loading. Try again in a moment.");
      }

      setUploading(true);
      await handleUpload(file, patientId, doctorId ?? undefined);
      await onUploaded?.();
      setMessage("Upload complete. AI analysis is being saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-teal-100 bg-teal-50/80 p-4 shadow-inner shadow-white/70 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          Upload new Xray image
        </p>
        <p className="mt-1 text-xs text-slate-500">
          JPEG, PNG, and JPG Xray images are supported.
        </p>
        {message && <p className="mt-2 text-xs font-medium text-slate-700">{message}</p>}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
      />

      <Button
        onClick={handleUploadClick}
        disabled={uploading || !patientId}
        className="rounded-lg bg-teal-600 shadow-lg shadow-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-700"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload Xray Image"}
      </Button>
    </div>
  );
}
