"use client";
import React, { useState } from "react";

interface Props {
  onUpload: (file: File | null) => void;
  accept?: string;
}

export default function FileUploader({ onUpload, accept = "application/pdf,image/*" }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileName(f?.name ?? null);
    onUpload(f);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <label className="block text-sm text-gray-600 mb-2">Upload X-ray or Report</label>
      <div className="flex gap-3 items-center">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="block w-full text-sm text-gray-600 file:rounded-md file:px-3 file:py-2 file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
        />
        <div className="text-sm text-gray-500">{fileName ?? "No file selected"}</div>
      </div>
    </div>
  );
}
