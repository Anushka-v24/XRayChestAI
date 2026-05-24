"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [disease, setDisease] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/user/profile`);
        
        if (!res.ok) {
          setMessage("Failed to load profile");
          setLoading(false);
          return;
        }
        
        const user = await res.json();
        
        setName(user.name || "");
        setEmail(user.email || "");
        setDisease(user.disease || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, disease }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        const error = await res.json();
        setMessage(error.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900 dark:text-gray-100">
          Update Profile
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
          />

          <input
            type="text"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            value={disease}
            placeholder="Disease (optional)"
            onChange={(e) => setDisease(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <p className={`text-center mt-2 text-sm ${
              message.includes("success") 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}