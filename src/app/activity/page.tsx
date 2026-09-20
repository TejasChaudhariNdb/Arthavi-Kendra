import { Suspense } from "react";
import Link from "next/link";
import {
  fetchMetricsDau,
  fetchMetricsWau,
  fetchMetricsMau,
  fetchUsersWithFilters,
  fetchUsersMeta,
} from "@/lib/api";
import ActivityCharts from "@/components/ActivityCharts";
import RecentActiveUsersTable from "@/components/RecentActiveUsersTable";
import {
  Activity,
  Users,
  UserPlus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

/** Hours elapsed since midnight IST (UTC+5:30) — gives true "today" window */
function hoursSinceMidnightIST(): number {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const midnightIST = new Date(nowIST);
  midnightIST.setUTCHours(0, 0, 0, 0);
  const hours = (nowIST.getTime() - midnightIST.getTime()) / (1000 * 60 * 60);
  return Math.max(1, Math.ceil(hours));
}

/** Today's date string in IST (YYYY-MM-DD) for new-user detection */
function todayISTString(): string {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return nowIST.toISOString().slice(0, 10);
}

export default async function ActivityPage() {
  const [dau, wau, mau, recentUsers, meta] = await Promise.all([
    fetchMetricsDau(30),
    fetchMetricsWau(12),
    fetchMetricsMau(6),
    fetchUsersWithFilters({
      active_within_hours: hoursSinceMidnightIST(),
      limit: 100,
      sort_by: "last_active_at",
      sort_order: "desc",
    }),
    fetchUsersMeta({ at_risk: true }),
  ]);

  const todayIST = todayISTString();
  const activeToday = recentUsers.length;
  const newToday = recentUsers.filter(
    (u: { created_at?: string }) => u.created_at?.startsWith(todayIST),
  ).length;
  const returning = activeToday - newToday;
  const retentionPct =
    activeToday > 0 ? Math.round((returning / activeToday) * 100) : 0;

  const kpis = [
    {
      label: "Active Today",
      value: activeToday,
      suffix: "users",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      pulse: true,
    },
    {
      label: "New Today",
      value: newToday,
      suffix: "signups",
      icon: UserPlus,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      label: "Returning",
      value: returning,
      suffix: "users",
      icon: RefreshCw,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-500/10",
    },
    {
      label: "Retention Rate",
      value: retentionPct,
      suffix: "%",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
            <span className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Activity size={24} />
            </span>
            User Activity Metrics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
            Track daily, weekly, and monthly active user trends across the platform.
          </p>
        </div>
      </header>

      {/* Slippage CRM Alert */}
      {meta?.at_risk_count > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
          <div className="flex gap-3 items-start sm:items-center">
            <span className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle size={20} />
            </span>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">CRM Re-engagement Recommended</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                We detected <span className="text-amber-700 dark:text-amber-400 font-bold">{meta.at_risk_count} at-risk users</span> who have been inactive for 14+ days.
              </p>
            </div>
          </div>
          <Link
            href="/users?at_risk=1"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            Review At-Risk Users →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, suffix, icon: Icon, color, bg, pulse }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 flex flex-col gap-3 shadow-xs transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {label}
              </span>
              <span className={`p-2 ${bg} ${color} rounded-lg`}>
                <Icon size={16} />
              </span>
            </div>
            <div className="flex items-baseline">
              {pulse && (
                <span className="relative flex h-2 w-2 mr-2 self-center animate-in zoom-in duration-300">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <span className={`text-3xl font-bold font-mono ${color}`}>{value}</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs ml-1.5 font-medium">{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            Loading charts...
          </div>
        }
      >
        <ActivityCharts dau={dau} wau={wau} mau={mau} />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            Loading recent users...
          </div>
        }
      >
        <RecentActiveUsersTable users={recentUsers} todayIST={todayIST} />
      </Suspense>
    </div>
  );
}
