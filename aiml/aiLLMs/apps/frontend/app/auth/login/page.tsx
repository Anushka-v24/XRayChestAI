"use client";
import supabase from "@/app/lib/supabaseClient";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
//stores user state
  async function syncUser(authUserId: string, userEmail: string, name: string, selectedRole: string) {
    const response = await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authUserId,
        email: userEmail,
        name,
        role: selectedRole,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      throw new Error(result?.error || "Failed to sync user profile");
    }
  }

  async function handleLogin() {
    setLoading(true);
    setMessage("");
    const selectedRole = role.trim().toUpperCase() || "USER";

    let data;
    let error;

    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      data = result.data;
      error = result.error;
    } catch (err) {
      console.error("Login request failed:", err);
      setMessage("Unable to reach Supabase Auth. Check your internet connection or Supabase project URL.");
      setLoading(false);
      return;
    }
// for login using supabase
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else if (data.user) {
      try {
        await syncUser(
          data.user.id,
          data.user.email || email.trim(),
          data.user.user_metadata?.name || "User",
          data.user.user_metadata?.role || selectedRole
        );
        window.location.href = selectedRole === "DOCTOR" ? "/doctor-dashboard" : "/patient-dashboard";
      } catch (err) {
        console.error("Failed to sync user:", err);
        setMessage(err instanceof Error ? err.message : "Failed to sync user profile");
        setLoading(false);
      }
    }
  }
// syncing the user from supabase to prisma
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
        selectedRole === "DOCTOR" ? "/doctor-dashboard" : "/patient-dashboard";
    } catch (err) {
      console.error("Signup request failed:", err);
      setMessage(err instanceof Error ? err.message : "Signup failed");
      setLoading(false);
    }
  }
// signup kr rha hai and then role metadata mei save, and sending verification email
  return (
    <div className="mx-auto max-w-6xl">
      <section className="medical-hero overflow-hidden rounded-lg border border-white/90 shadow-2xl shadow-cyan-900/10">
        <div className="grid min-h-[620px] grid-cols-1 items-end gap-6 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="pb-8 lg:pb-16">
            <p className="mb-4 inline-flex rounded-lg bg-white/80 px-3 py-2 text-xs font-bold uppercase text-teal-700 shadow-sm">
              AI Lung Assistant
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="mt-4 max-w-md text-lg font-medium leading-7 text-slate-700">
              Compassionate report review, patient context, and guided AI medical support.
            </p>
          </div>

          <div className="rounded-lg border border-white/90 bg-white/78 p-4 shadow-2xl shadow-cyan-900/15 backdrop-blur-xl sm:p-6">
            <h2 className="text-2xl font-black text-slate-950">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login"
                ? "Access your reports and care workspace."
                : "Create your profile with a real display name."}
            </p>

            <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-cyan-50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={loading}
            >
              <LogIn size={16} />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={loading}
            >
              <UserPlus size={16} />
              Signup
            </button>
          </div>

          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="soft-input w-full"
              disabled={loading}
            />
          )}

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
          </select>

          {message && (
            <p className="rounded-lg bg-red-50 p-2 text-center text-sm text-red-600">
              {message}
            </p>
          )}

          <button
            onClick={mode === "login" ? handleLogin : handleSignup}
            className="teal-button w-full py-3"
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
                ? "Login"
                : "Signup"}
          </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
// these are buttons
