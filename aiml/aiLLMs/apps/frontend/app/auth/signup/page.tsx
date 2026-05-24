"use client";

import Link from "next/link";
import supabase from "@/app/lib/supabaseClient";
import { useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setMessage("");
    const selectedRole = role.trim().toUpperCase() || "USER";
    const displayName = name.trim();

    if (!displayName) {
      setMessage("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: displayName,
          role: selectedRole,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Signup failed");
      }

      const loginResult = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginResult.error) {
        setMessage("Account created. Please sign in.");
        setLoading(false);
        return;
      }

      window.location.href =
        selectedRole === "ADMIN"
          ? "/dashboard"
          : selectedRole === "DOCTOR"
            ? "/doctor-dashboard"
            : "/patient-dashboard";
    } catch (err) {
      console.error("Signup request failed:", err);
      setMessage(err instanceof Error ? err.message : "Signup failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/45 shadow-2xl shadow-cyan-900/10 backdrop-blur-2xl">
        <div className="absolute left-8 top-10 h-48 w-48 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute bottom-8 right-10 h-64 w-64 rounded-full bg-teal-200/50 blur-3xl" />
        <div className="relative grid min-h-[650px] grid-cols-1 items-center gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-[20px] bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700 shadow-sm">
              <ShieldCheck size={15} />
              Role-based access
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
              Create your medical AI account
            </h1>
            <p className="mt-4 max-w-md text-lg font-medium leading-7 text-slate-700">
              Choose Patient, Doctor, or Admin access and enter the secure workspace designed for your role.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/90 bg-white/78 p-5 shadow-2xl shadow-cyan-900/15 backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-teal-300 to-cyan-200 text-white shadow-lg shadow-teal-200">
              <UserPlus size={25} />
            </div>
            <h2 className="text-2xl font-black text-slate-950">Signup</h2>
            <p className="mt-1 text-sm text-slate-500">
              Accounts use secure Supabase sessions with app-level role routing.
            </p>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="soft-input w-full"
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="soft-input w-full"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soft-input w-full"
                disabled={loading}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="soft-input w-full"
                disabled={loading}
              >
                <option value="USER">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>

              {message && (
                <p className="rounded-[20px] bg-red-50 p-3 text-center text-sm text-red-600">
                  {message}
                </p>
              )}

              <button onClick={handleSignup} className="teal-button w-full py-3" disabled={loading}>
                <UserPlus size={17} />
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-center text-sm font-semibold text-slate-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-700 hover:text-teal-900">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
