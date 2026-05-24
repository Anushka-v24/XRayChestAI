import Link from "next/link";
import { Activity, Ambulance, HeartPulse, Stethoscope } from "lucide-react";

const departments = [
  { title: "Emergency Care", icon: Ambulance },
  { title: "AI Report Review", icon: Activity },
  { title: "Cardiology Context", icon: HeartPulse },
];

const services = [
  {
    title: "Advanced Diagnostics",
    text: "Upload scans and reports for structured AI-supported summaries.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Specialized Review",
    text: "Doctors can review assigned reports and track patient activity.",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="medical-hero overflow-hidden rounded-lg border border-white/90 shadow-2xl shadow-cyan-900/10">
        <div className="min-h-[520px] p-6 sm:p-10">
          <div className="flex max-w-xl flex-col justify-center py-12 sm:py-20">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-bold uppercase text-teal-700 shadow-sm">
              <Stethoscope size={15} />
              AI Medical Care
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="mt-4 max-w-md text-lg font-medium leading-7 text-slate-700">
              Compassionate care for reports, diagnoses, and patient conversations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="teal-button px-5 py-3" href="/medical-assistant">
                Open Assistant
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg shadow-cyan-900/10 transition hover:-translate-y-0.5"
                href="/patient-dashboard"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-black text-slate-950">
          Our Departments
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {departments.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="glass-panel flex min-h-44 flex-col items-center justify-center rounded-lg p-6 text-center"
            >
              <Icon size={48} className="mb-4 text-teal-500" />
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-black text-slate-950">
          Featured Services
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="glass-panel overflow-hidden rounded-lg p-3"
            >
              <img
                src={service.image}
                alt={service.title}
                className="h-48 w-full rounded-lg object-cover"
              />
              <div className="p-3">
                <h3 className="text-lg font-black text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {service.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
