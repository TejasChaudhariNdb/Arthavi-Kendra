"use client";

import { useState } from "react";
import { registerAdmin } from "@/lib/auth-client";
import { Mail, Lock, User, Plus, ShieldCheck } from "lucide-react";

export default function CreateAdminForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      await registerAdmin({ email, password, full_name: fullName });
      setStatus("success");
      setMsg("New admin created successfully.");
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (e) {
      setStatus("error");
      setMsg("Failed to create admin. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
        <Plus className="text-emerald-500" size={20} /> Create New Admin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {status !== "idle" && (
          <div
            className={`p-3 rounded-lg text-sm border ${status === "success" ? "bg-emerald-900/10 border-emerald-900/50 text-emerald-400" : "bg-red-900/10 border-red-900/50 text-red-400"}`}>
            {msg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="email"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="jane@arthavi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="password"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
