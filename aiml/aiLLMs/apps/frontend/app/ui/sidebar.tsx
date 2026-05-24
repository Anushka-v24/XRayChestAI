"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MdDashboard, MdChat, MdHistory, MdLocalHospital, MdPerson } from "react-icons/md";

const links = [
  { href: "/patient-dashboard", label: "Patient Dashboard", icon: <MdPerson size={20} /> },
  { href: "/doctor-dashboard", label: "Doctor Dashboard", icon: <MdDashboard size={20} /> },
  { href: "/medical-assistant", label: "Medical Assistant", icon: <MdChat size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyBasePath = pathname?.startsWith("/auth") ? "/patient-dashboard" : pathname || "/patient-dashboard";
  const historyHref = `${historyBasePath}?history=open`;

  useEffect(() => {
    setHistoryOpen(new URLSearchParams(window.location.search).get("history") === "open");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500 text-white shadow-lg shadow-teal-200">
          <MdLocalHospital size={25} />
        </div>
        <div>
          <h1 className="text-sm font-black leading-tight text-slate-950">
            CAREPLUS
            <span className="block">MEDICAL</span>
          </h1>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto lg:items-center lg:overflow-visible">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition duration-200
              ${
                pathname === l.href
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-200"
                  : "text-slate-700 hover:bg-white hover:text-teal-700 hover:shadow-md"
              }
            `}
          >
            {l.icon}
            {l.label}
          </Link>
        ))}
        <Link
          href={historyHref}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition duration-200
            ${
              historyOpen
                ? "bg-teal-500 text-white shadow-lg shadow-teal-200"
                : "text-slate-700 hover:bg-white hover:text-teal-700 hover:shadow-md"
            }
          `}
        >
          <MdHistory size={20} />
          Report History
        </Link>
      </nav>
      </div>
    </header>
  );
}
