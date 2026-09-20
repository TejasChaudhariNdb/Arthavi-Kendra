"use client";

import { useState } from "react";
import { registerAdmin } from "@/lib/auth-client";
import { Mail, Lock, User, Plus, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

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
      setMsg("New admin account created successfully.");
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
    <Card>
      <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] px-5 py-4">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Create New Administrator
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Add team members with full access to the Arthavi Operations Kendra
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {status !== "idle" && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 border ${
                status === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
              }`}
            >
              {status === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="email"
                required
                className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="jane@arthavi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="password"
                required
                className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
