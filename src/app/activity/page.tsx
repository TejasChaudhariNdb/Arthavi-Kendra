import { Suspense } from "react";
import Link from "next/link";
import {
  fetchActivityOverview,
  fetchActivityBreakdown,
  fetchWeeklyDecomposition,
  fetchCohortMatrix,
  fetchDayNRetention,
  fetchSourceRetention,
  fetchEngagementFrequency,
  fetchEngagementScatter,
  fetchWinBackUsers,
  fetchSanityCheck,
  fetchUsersWithFilters,
  fetchUsersMeta,
} from "@/lib/api";
import ActivitySanityBanner from "@/components/ActivitySanityBanner";
import ActivityDecompositionChart from "@/components/ActivityDecompositionChart";
import WeeklyDecompositionChart from "@/components/WeeklyDecompositionChart";
import CohortRetentionMatrix from "@/components/CohortRetentionMatrix";
import EngagementScatterChart from "@/components/EngagementScatterChart";
import EngagementDepthAndSource from "@/components/EngagementDepthAndSource";
import WinBackUsersTable from "@/components/WinBackUsersTable";
import RecentActiveUsersTable from "@/components/RecentActiveUsersTable";
import {
  Activity,
  Users,
  UserPlus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
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
  const [
    overview,
    breakdown,
    weeklyDecomp,
    cohortMatrix,
    dayN,
    sourceRetention,
    freqBuckets,
    scatterUsers,
    winBackUsers,
    sanity,
    recentUsers,
    meta,
  ] = await Promise.all([
    fetchActivityOverview().catch(() => null),
    fetchActivityBreakdown(90).catch(() => []),
    fetchWeeklyDecomposition(12).catch(() => []),
    fetchCohortMatrix(8).catch(() => []),
    fetchDayNRetention(8).catch(() => []),
    fetchSourceRetention().catch(() => []),
    fetchEngagementFrequency().catch(() => []),
    fetchEngagementScatter().catch(() => []),
    fetchWinBackUsers(50).catch(() => []),
    fetchSanityCheck().catch(() => null),
    fetchUsersWithFilters({
      active_within_hours: hoursSinceMidnightIST(),
      limit: 100,
      sort_by: "last_active_at",
      sort_order: "desc",
    }).catch(() => []),
    fetchUsersMeta({ at_risk: true }).catch(() => null),
  ]);

  const todayIST = todayISTString();
  const dauVal = overview?.dau ?? recentUsers.length;
  const wauVal = overview?.wau ?? 0;
  const mauVal = overview?.mau ?? 0;
  const stickinessVal = overview?.dau_mau_stickiness_pct ?? 0;
  const returningShare = overview?.returning_share_pct ?? 0;

  const kpis = [
    {
      label: "DAU (Active Today)",
      value: dauVal,
      suffix: "users",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      pulse: true,
      subtext: `${overview?.new_users_today ?? 0} new • ${overview?.returning_users_today ?? 0} returning`,
    },
    {
      label: "WAU (Trailing 7D)",
      value: wauVal,
      suffix: "users",
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      subtext: `${overview?.existing_users_7d ?? 0} established users`,
    },
    {
      label: "MAU (Trailing 30D)",
      value: mauVal,
      suffix: "users",
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      subtext: `${overview?.existing_users_30d ?? 0} established users`,
    },
    {
      label: "DAU/MAU Stickiness",
      value: `${stickinessVal}%`,
      suffix: "ratio",
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      subtext: stickinessVal >= 20 ? "High habit formation" : "Infrequent check-ins",
    },
    {
      label: "Returning Share of DAU",
      value: `${returningShare}%`,
      suffix: "retention",
      icon: RefreshCw,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-500/10",
      subtext: `${100 - returningShare}% from today's signups`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
            <span className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Activity size={24} />
            </span>
            User Activity & Retention Intelligence
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
            Real-time cohort retention, habit stickiness, WAU decomposition, and slippage diagnostics.
          </p>
        </div>
      </header>

      {/* Sanity / Reliability Banner */}
      <ActivitySanityBanner sanity={sanity} />

      {/* Slippage CRM Alert */}
      {meta && meta.at_risk_count > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
          <div className="flex gap-3 items-start sm:items-center">
            <span className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle size={20} />
            </span>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">
                CRM Re-engagement Recommended
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                We detected{" "}
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  {meta.at_risk_count} at-risk users
                </span>{" "}
                inactive for 14+ days.
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

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(({ label, value, suffix, icon: Icon, color, bg, pulse, subtext }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {label}
              </span>
              <span className={`p-1.5 ${bg} ${color} rounded-lg`}>
                <Icon size={14} />
              </span>
            </div>
            <div className="flex items-baseline">
              {pulse && (
                <span className="relative flex h-2 w-2 mr-2 self-center animate-in zoom-in duration-300">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1.5 font-medium">
                {suffix}
              </span>
            </div>
            {subtext && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                {subtext}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Row 2: Daily Breakdown & Weekly Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityDecompositionChart initialData={breakdown} />
        <WeeklyDecompositionChart data={weeklyDecomp} />
      </div>

      {/* Row 3: Cohort Retention Analysis (Matrix Heatmap & Day-N Curves) */}
      <CohortRetentionMatrix cohorts={cohortMatrix} dayN={dayN} />

      {/* Row 4: Engagement Scatter Plot (Recency vs. 30D Active Frequency Quadrant) */}
      <EngagementScatterChart users={scatterUsers} />

      {/* Row 5: 30-Day Engagement Depth & Signup Source Retention */}
      <EngagementDepthAndSource frequency={freqBuckets} sources={sourceRetention} />

      {/* Row 6: Win-Back & Slippage CRM List */}
      <WinBackUsersTable users={winBackUsers} />

      {/* Row 7: Recent Active Users */}
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
