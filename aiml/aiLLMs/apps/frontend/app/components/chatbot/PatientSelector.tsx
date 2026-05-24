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
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function PatientSelector({
  onSelect,
  id,
}: {
  onSelect: (p: Patient | undefined) => void;
  id?: string;
}) {
  const doctorId = id ?? "bf3814e2-9318-4eff-b4af-444db46b7167";
  const { data, isLoading } = useSWR<PatientsApiResponse>(
    `/api/doctorPatient?token=${doctorId}`,
    fetcher
  );
  const patients = data?.users;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : (
        <Select
          onValueChange={(patientId) =>
            onSelect(patients?.find((p) => p.id === patientId))
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
