"use client";

import Link from "next/link";
import supabase from "@/app/lib/supabaseClient";
import { useState } from "react";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      setMessage(error ? error.message : "Password reset instructions have been sent to your email.");
    } catch (err) {
      console.error("Password reset failed:", err);
      setMessage("Unable to send reset email right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <section className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/48 p-5 shadow-2xl shadow-cyan-900/10 backdrop-blur-2xl sm:p-8">
        <div className="absolute left-10 top-10 h-52 w-52 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="relative mx-auto max-w-md rounded-[30px] border border-white/90 bg-white/78 p-6 shadow-2xl shadow-cyan-900/15 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-teal-300 to-cyan-200 text-white shadow-lg shadow-teal-200">
            <MailCheck size={25} />
          </div>
          <h1 className="text-3xl font-black text-slate-950">Forgot password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your email and we will send secure reset instructions.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="soft-input w-full"
              disabled={loading}
            />
            {message && (
              <p className="rounded-[20px] bg-cyan-50 p-3 text-sm font-semibold text-teal-700">
                {message}
              </p>
            )}
            <button onClick={handleReset} className="teal-button w-full py-3" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <Link href="/auth/login" className="block text-center text-sm font-semibold text-slate-600 hover:text-teal-700">
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
