"use client";
import MedicalChat from "../ui/advanced-chat/MedicalChat";
import { PatientSelector } from "../components/chatbot/PatientSelector";
import { PatientCard } from "../components/chatbot/PatientCard";
import { ChatBotPanel } from "../components/chatbot/ChatbotPanel";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import axios from "axios";
import { Bot, FileText, Stethoscope, X } from "lucide-react";

export default function Page() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [role, setRole] = useState("USER");
  const [id, setId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

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
      const userRole = String(session.user.user_metadata.role || "USER").toUpperCase();
      setRole(userRole);
      setId(session.user.id);
      if (userRole !== "DOCTOR") {
        await loadPatient(session.user.id);
      } else {
        setSelectedPatient(null);
      }
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
    <div className="relative flex min-h-[calc(100vh-7rem)] flex-col gap-4">
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
              Upload Xray images and discuss recent findings
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-800">
            <FileText size={15} />
            Latest report context enabled
          </div>
          {role === "DOCTOR" && (
            <PatientSelector onSelect={handleSelectPatient} id={id ?? undefined} />
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4">
        <motion.div
          layout
          className="glass-panel min-h-[calc(100vh-15rem)] overflow-y-auto rounded-[30px]"
        >
          {selectedPatient ? (
            <PatientCard
              patient={selectedPatient}
              role={role}
              doctorId={id}
              onReportUploaded={refreshSelectedPatient}
            />
          ) : role !== "DOCTOR" ? (
            <PatientCard
              patient={selectedPatient}
              role={role}
              doctorId={id}
              onReportUploaded={refreshSelectedPatient}
            />
          ) : (
            <div className="flex min-h-[520px] items-center justify-center p-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-cyan-100 text-teal-700">
                  <Stethoscope size={26} />
                </div>
                <h2 className="text-2xl font-black text-slate-950">Select a patient first</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Choose a patient from the selector above before uploading an Xray image or reviewing report context.
                </p>
              </div>
            </div>
          )}
        </motion.div>

      </main>

      <motion.button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-cyan-500 text-white shadow-2xl shadow-teal-300/60 ring-4 ring-white/80 transition hover:-translate-y-1"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        aria-label="Open AI chatbot"
      >
        <Bot size={30} />
      </motion.button>

      {chatOpen && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          className="fixed bottom-6 right-4 z-50 flex h-[50vh] w-[calc(100vw-2rem)] flex-col rounded-[30px] border border-white/90 bg-white/82 p-4 shadow-2xl shadow-cyan-900/20 backdrop-blur-2xl sm:right-6 sm:w-[50vw] sm:min-w-[460px] sm:max-w-[720px]"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 text-teal-600">
                <Bot size={23} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">AI Medical Chatbot</p>
                <p className="text-xs text-slate-500">
                  {selectedPatient?.name ? `Chatting with ${selectedPatient.name}` : "Latest report context"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-full bg-white p-2 text-slate-600 shadow-md transition hover:-translate-y-0.5 hover:text-teal-700"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>
          {selectedPatient ? (
            <MedicalChat key={selectedPatient.authUserId} id={selectedPatient.authUserId || id} />
          ) : id ? (
            <MedicalChat key={id} id={id} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              Loading chat...
            </div>
          )}
        </motion.aside>
      )}
    </div>
  );
}
