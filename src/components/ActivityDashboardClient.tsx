"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Users,
  UserPlus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  Database,
  CheckCircle2,
} from "lucide-react";
import { fetchActivityDashboardBundleClient } from "@/lib/auth-client";
import ActivitySanityBanner from "@/components/ActivitySanityBanner";
import ActivityDecompositionChart from "@/components/ActivityDecompositionChart";
import WeeklyDecompositionChart from "@/components/WeeklyDecompositionChart";
import CohortRetentionMatrix from "@/components/CohortRetentionMatrix";
import EngagementScatterChart from "@/components/EngagementScatterChart";
import EngagementDepthAndSource from "@/components/EngagementDepthAndSource";
import WinBackUsersTable from "@/components/WinBackUsersTable";
import RecentActiveUsersTable from "@/components/RecentActiveUsersTable";

const CACHE_KEY = "arthavi_activity_dashboard_cache";
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes cache

interface DashboardBundle {
  overview: any;
  breakdown: any[];
  weekly_decomp: any[];
  cohort_matrix: any[];
  day_n: any[];
  source_retention: any[];
  freq_buckets: any[];
  scatter_users: any[];
  win_back_users: any[];
  sanity: any;
  generated_at?: string;
}

export default function ActivityDashboardClient({
  initialBundle,
  recentUsers,
  todayIST,
  meta,
}: {
  initialBundle: DashboardBundle | null;
  recentUsers: any[];
  todayIST: string;
  meta: any;
}) {
  const [bundle, setBundle] = useState<DashboardBundle | null>(initialBundle);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const [fromCache, setFromCache] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed.savedAt || 0);
        if (age < CACHE_TTL_MS && parsed.data) {
          setBundle(parsed.data);
          setLastRefreshedAt(parsed.savedAt);
          setFromCache(true);
          return;
        }
      }
    } catch {
      // ignore JSON parse errors
    }

    // If initialBundle was provided by SSR, cache it
    if (initialBundle) {
      const now = Date.now();
      setLastRefreshedAt(now);
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: initialBundle, savedAt: now })
        );
      } catch {
        // quota exceeded or private mode
      }
    }
  }, [initialBundle]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchActivityDashboardBundleClient();
      setBundle(fresh);
      const now = Date.now();
      setLastRefreshedAt(now);
      setFromCache(false);
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: fresh, savedAt: now })
        );
      } catch {
        // ignore
      }
    } catch (err) {
      console.error("Failed to refresh activity bundle:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const overview = bundle?.overview;
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

  const getTimeAgo = () => {
    if (!lastRefreshedAt) return "Just now";
    const minutes = Math.floor((Date.now() - lastRefreshedAt) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} mins ago`;
  };

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

        {/* Cache & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0d121f] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] shadow-2xs">
            <Clock size={13} className="text-indigo-500" />
            <span>Updated: <strong className="text-slate-800 dark:text-slate-200">{getTimeAgo()}</strong></span>
            {fromCache && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Cached (0 DB Calls)
              </span>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={`${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Fetching 1 Bundle..." : "Refresh Data"}</span>
          </button>
        </div>
      </header>

      {/* Sanity / Reliability Banner */}
      <ActivitySanityBanner sanity={bundle?.sanity ?? null} />

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
        <ActivityDecompositionChart initialData={bundle?.breakdown || []} />
        <WeeklyDecompositionChart data={bundle?.weekly_decomp || []} />
      </div>

      {/* Row 3: Cohort Retention Analysis (Matrix Heatmap & Day-N Curves) */}
      <CohortRetentionMatrix
        cohorts={bundle?.cohort_matrix || []}
        dayN={bundle?.day_n || []}
      />

      {/* Row 4: Engagement Scatter Plot (Recency vs. 30D Active Frequency Quadrant) */}
      <EngagementScatterChart users={bundle?.scatter_users || []} />

      {/* Row 5: 30-Day Engagement Depth & Signup Source Retention */}
      <EngagementDepthAndSource
        frequency={bundle?.freq_buckets || []}
        sources={bundle?.source_retention || []}
      />

      {/* Row 6: Win-Back & Slippage CRM List */}
      <WinBackUsersTable users={bundle?.win_back_users || []} />

      {/* Row 7: Recent Active Users */}
      <RecentActiveUsersTable users={recentUsers} todayIST={todayIST} />
    </div>
  );
}
