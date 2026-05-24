"use client";
import MedicalChat from "../ui/advanced-chat/MedicalChat";
import { PatientSelector } from "../components/chatbot/PatientSelector";
import { PatientCard } from "../components/chatbot/PatientCard";
import { ChatBotPanel } from "../components/chatbot/ChatbotPanel";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import axios from "axios";
import { Activity, FileText, Stethoscope } from "lucide-react";

export default function Page() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [role, setRole] = useState("USER");
  const [id, setId] = useState<string | null>(null);

  async function loadPatient(patientAuthId: string) {
    const result = await axios.get(`/api/patients?token=${patientAuthId}`);
    setSelectedPatient(result.data?.result ?? null);
    return result.data?.result ?? null;
  }

  async function getUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const name =
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        session.user.email;
      setRole(session.user.user_metadata.role);
      setId(session.user.id);
      await loadPatient(session.user.id);
    }
  }

  async function handleSelectPatient(patient: any) {
    if (!patient?.authUserId) {
      setSelectedPatient(patient ?? null);
      return;
    }

    await loadPatient(patient.authUserId);
  }

  async function refreshSelectedPatient() {
    const patientAuthId = selectedPatient?.authUserId || id;
    if (patientAuthId) {
      await loadPatient(patientAuthId);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  //if logged in user is doctor, show doctor dashboard + add diagnosis tab and allow patient selector else remove header,'add diagnosis' field  and just show option to add new report and chatbot in right
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4">
      <header
        className={`glass-panel accent-rule flex flex-col gap-5 rounded-lg p-5 pl-6 ring-1 ring-white/70 sm:flex-row sm:items-center sm:justify-between ${
          role == "DOCTOR" ? "" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-600 p-2 text-white shadow-lg shadow-teal-200">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Medical Assistant
            </h1>
            <p className="text-sm text-slate-500">
              Upload reports and discuss recent findings
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-800">
            <FileText size={15} />
            Latest report context enabled
          </div>
          <PatientSelector onSelect={handleSelectPatient} id={id as string} />
        </div>
      </header>
      <main className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
        {/* Left Panel - Patient Details */}
        <motion.div
          layout
          className="glass-panel min-h-[420px] overflow-y-auto rounded-lg"
        >
          {selectedPatient ? (
            <PatientCard
              patient={selectedPatient}
              role={role}
              onReportUploaded={refreshSelectedPatient}
            />
          ) : (
            <PatientCard
              patient={selectedPatient}
              role={role}
              onReportUploaded={refreshSelectedPatient}
            />
          )}
        </motion.div>

        {/* Right Panel - Chatbot */}
        <motion.div
          layout
          className="glass-panel flex min-h-[520px] flex-col rounded-lg p-4"
        >
       {selectedPatient ? (
  <>
    <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
      <Activity size={16} className="text-teal-600" />
      Chatting with <b className="text-slate-800">{selectedPatient.name}</b>
    </p>
    <MedicalChat key={selectedPatient.authUserId}  id={selectedPatient.authUserId || id} />
  </>
) : id ? (
  // If user is patient, auto-load their own chat
  <MedicalChat key={id}  id={id} />
) : (
  <div>Loading chat...</div>
)}
        </motion.div>
      </main>
    </div>
  );
}
