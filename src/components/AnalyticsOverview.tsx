"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  TimerReset,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ActiveNowResponse {
  active_users: number;
}

interface Last30MinResponse {
  active_users: number;
  last_30_min_users: number;
  per_minute: Array<{
    minutes_ago: number;
    users: number;
  }>;
}

interface TodayTrendResponse {
  today_users: number;
  trend: Array<{
    hour: string;
    users: number;
  }>;
}

interface Last15DaysTrendResponse {
  total_users_last_15_days: number;
  trend: Array<{
    date: string;
    full_date: string;
    users: number;
  }>;
}

interface OverviewState {
  activeNow: ActiveNowResponse | null;
  last30Min: Last30MinResponse | null;
  todayTrend: TodayTrendResponse | null;
  last15DaysTrend: Last15DaysTrendResponse | null;
}

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] p-5 shadow-xs transition-colors">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{hint}</p>
    </div>
  );
}

export default function AnalyticsOverview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [state, setState] = useState<OverviewState>({
    activeNow: null,
    last30Min: null,
    todayTrend: null,
    last15DaysTrend: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const [activeNowRes, last30MinRes, todayTrendRes, last15DaysTrendRes] =
          await Promise.all([
          fetch("/api/analytics/active-now", { cache: "no-store" }),
          fetch("/api/analytics/last-30-min", { cache: "no-store" }),
          fetch("/api/analytics/today-trend", { cache: "no-store" }),
          fetch("/api/analytics/last-15-days-trend", { cache: "no-store" }),
        ]);

        if (
          !activeNowRes.ok ||
          !last30MinRes.ok ||
          !todayTrendRes.ok ||
          !last15DaysTrendRes.ok
        ) {
          throw new Error("Unable to load analytics overview");
        }

        const [activeNow, last30Min, todayTrend, last15DaysTrend] =
          await Promise.all([
          activeNowRes.json() as Promise<ActiveNowResponse>,
          last30MinRes.json() as Promise<Last30MinResponse>,
          todayTrendRes.json() as Promise<TodayTrendResponse>,
          last15DaysTrendRes.json() as Promise<Last15DaysTrendResponse>,
        ]);

        if (!cancelled) {
          setState({
            activeNow,
            last30Min,
            todayTrend,
            last15DaysTrend,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load analytics overview",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();
    const intervalId = window.setInterval(loadAnalytics, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isExpanded]);

  const trendData = state.todayTrend?.trend ?? [];
  const last15DaysData = state.last15DaysTrend?.trend ?? [];

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] p-6 shadow-xs transition-colors">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Realtime Analytics
          </p>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Live GA4 Dashboard Snapshot
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw size={14} />
            Auto refresh: 60s
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-white cursor-pointer"
          >
            {isExpanded ? "Collapse" : "Expand Live Charts"}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {!isExpanded ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Click &quot;Expand Live Charts&quot; to inspect GA4 real-time active users and hourly trends.</span>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer ml-2 shrink-0"
          >
            Expand →
          </button>
        </div>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="min-h-[140px] animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
          <div>
            <AlertCircle className="mx-auto mb-2 text-rose-500" size={20} />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Analytics unavailable</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{error}</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Today Users"
              value={state.todayTrend?.today_users ?? 0}
              hint="Users active at any point today (new and returning)."
              icon={Users}
            />
            <MetricCard
              title="Active Now"
              value={state.activeNow?.active_users ?? 0}
              hint="Realtime GA4 active users in the last 30 minutes."
              icon={Activity}
            />
            <MetricCard
              title="Last 30 Min Users"
              value={state.last30Min?.last_30_min_users ?? 0}
              hint="Realtime 30-minute user count for quick scanning."
              icon={TimerReset}
            />
            <MetricCard
              title="15 Day Total"
              value={state.last15DaysTrend?.total_users_last_15_days ?? 0}
              hint="Summed total active users over the last 15 days."
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070a13] p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-xl bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today Hourly Trend</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hourly active users for today
                  </p>
                </div>
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis
                      dataKey="hour"
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value: string) => `${value}:00`}
                    />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d121f",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) => `${label}:00`}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: "#10b981" }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070a13] p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Last 30 Min Activity</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Minute-by-minute activity breakdown
                </p>
                <div className="mt-3.5 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(state.last30Min?.per_minute ?? []).slice(-8).reverse().map((item) => (
                    <div
                      key={item.minutes_ago}
                      className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0d121f] px-3 py-2 text-xs"
                    >
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.minutes_ago === 0
                          ? "This minute"
                          : `${item.minutes_ago}m ago`}
                      </span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{item.users}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
