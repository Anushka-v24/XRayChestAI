"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PatientSelector } from "../components/chatbot/PatientSelector";
import { PatientCard } from "../components/chatbot/PatientCard";
import { ChatBotPanel } from "../components/chatbot/ChatbotPanel"
import { motion } from "framer-motion";
import {storeReportEmbedding} from "../lib/reportVector";
// useEffect(()=>{
// let result = await storeReportEmbedding({
//     id: 'a1db0d18-6e08-42f0-9a55-0e19d194e9af',
//     imageUrl: 'https://res.cloudinary.com/dkv7cimyy/image/upload/v1763268716/radiology/j6urwhmw2g6yqqsi1ydy.png',
//     reportText: null,
//     date: '2025-11-16T04:52:04.644Z',
//     confirmed: false,
//     severity: null,
//     userId: '329a7c27-d357-4b9d-b560-101d27ea220b',
//     doctorId: null,
//     createdAt: '2025-11-16T04:52:04.644Z',
//     updatedAt: '2025-11-16T04:52:04.644Z',
//     aiAnalysis: {
//       id: '1c5038e1-fae1-4818-aaf0-44ba60979a07',
//       reportId: 'a1db0d18-6e08-42f0-9a55-0e19d194e9af',
//       findings: '{"diagnosis":["Pneumonia"],"differentials":["Tuberculosis","Lung Cancer"],"recommended_next_steps":["Chest X-ray","Sputum Test","CT Scan"]}',
//       confidence: null,
//       createdAt: '2025-11-16T04:52:04.644Z'
//     },
//     diagnosis: [],
//     doctor: null
//   })
//   console.log({ result }, "after storing report embedding");
// }, [])



export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
// This stores which patient the doctor chose.
// Initially → null
// When doctor selects → gets passed into setSelectedPatient()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 border-b bg-white shadow-sm flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-700">
          Doctor Dashboard
        </h1>
        <PatientSelector onSelect={setSelectedPatient} />
      </header>

      <main className="flex flex-1 p-4 gap-4">
        {/* Left Panel - Patient Details */}
        <motion.div
          layout
          className="w-1/2 bg-white rounded-2xl shadow-lg overflow-y-auto"
        >
          {selectedPatient ? (
            <PatientCard patient={selectedPatient} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a patient to view details
            </div>
          )}
        </motion.div>

        {/* Right Panel - Chatbot */}
        <motion.div
          layout
          className="w-1/2 bg-white rounded-2xl shadow-lg flex flex-col"
        >
          <ChatBotPanel />
        </motion.div>
      </main>
    </div>
  );
}
// phle doctor select krega patient from drop down, aur vhi patient paas hoga aage
//then two columns layout is open 
// left hai patient card details : eports, diagnosis, dates, severity, etc.
// right mei chatbot ki history hogi
