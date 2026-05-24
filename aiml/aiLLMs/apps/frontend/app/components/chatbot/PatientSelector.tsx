"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Patient = {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  disease: string;
  createdAt: Date;
  updatedAt: Date;
};
type PatientsApiResponse = {
  success: boolean;
  users: Patient[];
  error?: string;
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function PatientSelector({
  onSelect,
  id,
}: {
  onSelect: (p: Patient | undefined) => void;
  id?: string;
}) {
  const doctorId = id;
  const { data, isLoading } = useSWR<PatientsApiResponse>(
    doctorId ? `/api/doctorPatient?token=${doctorId}` : null,
    fetcher
  );
  const patients = data?.users ?? [];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div>
      {!doctorId ? (
        <span className="text-xs text-slate-500">Loading doctor...</span>
      ) : isLoading ? (
        "Loading..."
      ) : data?.success === false ? (
        <span className="text-xs text-red-600">
          {data.error || "Unable to load patients"}
        </span>
      ) : patients.length === 0 ? (
        <span className="text-xs text-slate-500">No patients found</span>
      ) : (
        <Select
          onValueChange={(patientId) =>
            onSelect(patients.find((p) => p.id === patientId))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Patient" />
          </SelectTrigger>

          <SelectContent>
            {patients?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
