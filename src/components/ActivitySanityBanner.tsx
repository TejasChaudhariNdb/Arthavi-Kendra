"use client";

import { CheckCircle2, AlertTriangle, ShieldCheck, Calendar, Database } from "lucide-react";

interface SanityData {
  tracking_starts: string | null;
  latest_activity: string | null;
  total_activity_rows: number;
  users_never_tracked: number;
  total_users: number;
  sync_rate_pct: number;
}

export default function ActivitySanityBanner({ sanity }: { sanity: SanityData | null }) {
  if (!sanity) return null;

  const isHealthy = sanity.sync_rate_pct >= 85;

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <span
          className={`p-2 rounded-lg ${
            isHealthy
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          {isHealthy ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Data Reliability & Activity Tracking Health
            </h4>
            <span
              className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                isHealthy
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
              }`}
            >
              {sanity.sync_rate_pct}% Sync Rate
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified across <span className="font-mono font-medium">{sanity.total_activity_rows.toLocaleString()}</span> user-day events in Supabase.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
          <Calendar size={13} className="text-indigo-500" />
          <span>Tracking starts: <span className="text-slate-900 dark:text-slate-200 font-semibold">{sanity.tracking_starts || "N/A"}</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
          <Database size={13} className="text-sky-500" />
          <span>Total users: <span className="text-slate-900 dark:text-slate-200 font-semibold">{sanity.total_users.toLocaleString()}</span></span>
        </div>
        {sanity.users_never_tracked > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
            <span>Untracked: <span className="font-bold">{sanity.users_never_tracked}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
