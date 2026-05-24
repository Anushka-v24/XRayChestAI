"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Cloud,
  Download,
  FileText,
  HeartPulse,
  ImagePlus,
  MessageCircleQuestion,
  Microscope,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

const navItems = ["Home", "Features", "AI Diagnosis", "Reports", "About", "Contact"];

const features = [
  {
    title: "AI Disease Detection",
    text: "Detect key chest conditions with intelligent image triage and probability scoring.",
    icon: BrainCircuit,
  },
  {
    title: "Pneumonia Detection",
    text: "Identify pneumonia-like opacity patterns and receive clear supporting context.",
    icon: Activity,
  },
  {
    title: "Fracture Detection",
    text: "Screen X-ray uploads for fracture indicators and urgent visual abnormalities.",
    icon: Microscope,
  },
  {
    title: "AI Medical Chatbot",
    text: "Ask follow-up questions about symptoms, causes, precautions, and care options.",
    icon: MessageCircleQuestion,
  },
  {
    title: "X-Ray Classification",
    text: "Classify uploaded Xray images into clinically relevant diagnostic categories.",
    icon: ScanLine,
  },
  {
    title: "Report Generation",
    text: "Generate clear AI-assisted summaries for faster review and patient communication.",
    icon: FileText,
  },
  {
    title: "Secure Cloud Storage",
    text: "Keep reports and scan history organized with privacy-first medical data handling.",
    icon: Cloud,
  },
  {
    title: "Doctor Consultation",
    text: "Route AI reports to assigned doctors for review, comments, and prescription notes.",
    icon: Stethoscope,
  },
  {
    title: "PDF Report Download",
    text: "Export detailed medical reports for consultation, records, and follow-up visits.",
    icon: Download,
  },
];

const workflowSteps = [
  { title: "Upload Chest X-Ray", text: "Start with a clear chest scan image.", icon: UploadCloud },
  { title: "AI analyzes the image", text: "The model classifies findings in seconds.", icon: BrainCircuit },
  { title: "Medical explanation generated", text: "Receive readable AI findings and confidence context.", icon: FileText },
  { title: "Chat about detected diseases", text: "Ask symptoms, causes, precautions, and care questions.", icon: MessageCircleQuestion },
  { title: "Download PDF report", text: "Save a polished clinical summary for records.", icon: Download },
  { title: "Consult assigned doctor", text: "Share the report with a doctor for final review.", icon: Stethoscope },
];

const services = [
  {
    title: "Chest X-Ray Analysis",
    text: "AI-enhanced radiology review for high-signal chest scan insights.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Pneumonia Detection",
    text: "Visual pattern recognition for pneumonia-supporting findings.",
    image:
      "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Fracture Detection",
    text: "Fast scan screening for fracture-like abnormalities and urgent markers.",
    image:
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "AI Medical Reports",
    text: "Structured report drafts that help care teams move from image to action.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85",
  },
];

const trustItems = [
  { label: "HIPAA-ready design", icon: ShieldCheck },
  { label: "Subtle AI assistance", icon: Sparkles },
  { label: "Clinician workflow", icon: HeartPulse },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="homepage-shell relative min-h-screen overflow-hidden px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <motion.div
        className="floating-blob left-[4%] top-20 h-56 w-56 bg-cyan-200/70"
        animate={{ y: [0, 24, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-blob right-[8%] top-[18%] h-72 w-72 bg-teal-200/60"
        animate={{ y: [0, -26, 0], x: [0, -16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-blob bottom-10 left-[35%] h-64 w-64 bg-sky-100/80"
        animate={{ y: [0, 18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl rounded-[30px] border border-white/80 bg-white/45 p-3 shadow-[0_35px_100px_rgba(13,116,128,0.18)] backdrop-blur-2xl sm:p-5">
        <nav className="glass-panel flex items-center justify-between rounded-[28px] px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-teal-400 to-cyan-300 text-white shadow-lg shadow-teal-200/80">
              <Activity size={24} />
            </span>
            <span className="text-sm font-black leading-tight tracking-wide">
              CAREPLUS
              <span className="block">RAD AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === "Home" ? "/" : `#${item.toLowerCase().replaceAll(" ", "-")}`}
                className="text-sm font-semibold text-slate-700 transition hover:text-teal-600"
              >
                {item}
              </a>
            ))}
          </div>

          <Link href="/medical-assistant" className="teal-button rounded-[22px] px-5 py-3">
            Get Started
          </Link>
        </nav>

        <section className="relative overflow-hidden rounded-[30px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_72%_20%,rgba(126,221,229,0.36),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.88),rgba(215,248,250,0.62)_52%,rgba(255,255,255,0.5))]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-[20px] border border-white/90 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700 shadow-lg shadow-cyan-900/5 backdrop-blur-xl">
                <Microscope size={15} />
                AI Radiology Platform
              </div>
              <h1 className="text-5xl font-black leading-[1.02] text-slate-950 sm:text-6xl lg:text-7xl">
                AI Powered Chest X-Ray Diagnosis
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
                Upload chest X-rays and receive intelligent AI-generated medical analysis within seconds.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/login" className="teal-button rounded-[24px] px-6 py-4 text-base">
                  <UploadCloud size={19} />
                  Upload X-Ray
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-white/90 bg-white/80 px-6 py-4 text-base font-bold text-slate-800 shadow-xl shadow-cyan-900/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-teal-700"
                >
                  <ScanLine size={19} />
                  Explore Features
                </Link>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {trustItems.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-[22px] border border-white/80 bg-white/58 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-cyan-900/5 backdrop-blur-xl"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] bg-cyan-100 text-teal-600">
                      <Icon size={18} />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-full bg-cyan-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[30px] border border-white/85 bg-white/50 p-3 shadow-[0_35px_80px_rgba(13,116,128,0.18)] backdrop-blur-xl">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=90"
                  alt="Futuristic MRI and X-ray scanning machine"
                  className="h-[360px] w-full rounded-[24px] object-cover sm:h-[460px] lg:h-[520px]"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-[26px] border border-white/80 bg-white/72 p-4 shadow-2xl shadow-cyan-900/10 backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
                        Live scan insight
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">DenseNet-121 Analysis</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-200 to-teal-300 text-white shadow-lg shadow-teal-200">
                      <ImagePlus size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="workflow" className="px-3 py-12 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mx-auto mb-8 max-w-3xl text-center"
          >
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">How The Diagnosis Workflow Works</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A simple end-to-end journey from scan upload to AI explanation, doctor review, and downloadable records.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workflowSteps.map(({ title, text, icon: Icon }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.48, delay: index * 0.06 }}
                className="glass-panel soft-float relative min-h-[210px] overflow-hidden rounded-[28px] p-6"
              >
                <span className="absolute right-5 top-4 text-5xl font-black text-cyan-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.18 }}
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-white to-cyan-100 text-teal-600 shadow-lg shadow-cyan-900/10"
                >
                  <Icon size={30} />
                </motion.div>
                <h3 className="text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="features" className="px-3 py-12 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mx-auto mb-8 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Main Features</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A refined AI workflow for fast scan review, secure reporting, and healthcare collaboration.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ title, text, icon: Icon }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="glass-panel soft-float min-h-[260px] rounded-[28px] p-6"
              >
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-100 to-teal-200 text-teal-600 shadow-lg shadow-cyan-900/10">
                  <Icon size={31} />
                </div>
                <h3 className="text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="reports" className="px-3 py-12 sm:px-6 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.55 }}
            >
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">AI Medical Chatbot</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                Users can ask the AI chatbot questions about detected diseases, symptoms, precautions, causes, medications, and treatment suggestions in a calm guided interface.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Symptoms explained simply", "Precautions and causes", "Medication guidance prompts", "Treatment discussion support"].map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/80 bg-white/62 px-4 py-3 text-sm font-bold text-slate-700 shadow-lg shadow-cyan-900/5 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6 }}
              className="glass-panel rounded-[30px] p-4 sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-teal-300 to-cyan-200 text-white shadow-lg shadow-teal-200">
                    <MessageCircleQuestion size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">CarePlus AI Assistant</p>
                    <p className="text-xs font-semibold text-teal-600">Typing medical context...</p>
                  </div>
                </div>
                <span className="h-3 w-3 rounded-full bg-teal-400 shadow-lg shadow-teal-300" />
              </div>
              <div className="space-y-4">
                <div className="max-w-[86%] rounded-[24px] rounded-tl-md bg-white/86 p-4 text-sm leading-6 text-slate-700 shadow-lg shadow-cyan-900/8">
                  What does pneumonia mean on my AI X-ray report?
                </div>
                <div className="ml-auto max-w-[88%] rounded-[24px] rounded-tr-md bg-gradient-to-br from-cyan-100 to-teal-100 p-4 text-sm leading-6 text-slate-700 shadow-lg shadow-cyan-900/8">
                  Pneumonia is an infection that can inflame air sacs in the lungs. Your report may describe opacity patterns, confidence scores, and recommended doctor review.
                </div>
                <div className="flex w-fit items-center gap-2 rounded-[20px] bg-white/82 px-4 py-3 shadow-lg shadow-cyan-900/8">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400 [animation-delay:160ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400 [animation-delay:320ms]" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="ai-diagnosis" className="rounded-[30px] bg-white/35 px-3 py-12 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Services</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Premium AI medical imaging tools wrapped in a calm, clinician-friendly experience.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex w-fit items-center gap-2 rounded-[22px] bg-white/80 px-5 py-3 text-sm font-bold text-teal-700 shadow-lg shadow-cyan-900/10 transition hover:-translate-y-1 hover:bg-white"
            >
              Explore diagnosis
              <ArrowRight size={17} />
            </Link>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.52, delay: index * 0.08 }}
                className="glass-panel soft-float overflow-hidden rounded-[28px] p-3"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-52 w-full rounded-[23px] object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-black text-slate-950">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{service.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
