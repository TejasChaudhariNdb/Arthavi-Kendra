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
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
          <Icon size={20} />
        </div>
      </div>
      <p className="text-sm text-gray-400">{hint}</p>
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
    <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-950 via-gray-950 to-gray-900 p-6 shadow-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Analytics Overview
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Live GA4 dashboard snapshot
          </h2>

        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw size={16} />
            Auto refresh: 60s
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-emerald-500/40 hover:text-white"
          >
            {isExpanded ? "Collapse" : "Expand"}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {!isExpanded ? (
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/70 px-5 py-4 text-sm text-gray-400">
          Expand kr purn dashboard bagala
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="min-h-[160px] animate-pulse rounded-2xl border border-gray-800 bg-gray-900"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
          <div>
            <AlertCircle className="mx-auto mb-3 text-rose-300" size={22} />
            <p className="text-base font-semibold text-white">Analytics unavailable</p>
            <p className="mt-2 text-sm text-gray-400">{error}</p>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
            <MetricCard
              title="Current / Today Users"
              value={state.todayTrend?.today_users ?? 0}
              hint="Users active at any point today, including new and returning users."
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
              hint="Same realtime active-users metric, shown separately for quick scanning."
              icon={TimerReset}
            />
            <MetricCard
              title="15 Day User Total"
              value={state.last15DaysTrend?.total_users_last_15_days ?? 0}
              hint="Daily total users summed across the last 15 days."
              icon={TrendingUp}
            />
          </div>

          <div className="xl:col-span-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sky-300">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Today Users Trend</h3>
                <p className="text-sm text-gray-400">
                  Hourly GA4 active users for today
                </p>
              </div>
            </div>

            <div className="-mx-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin] touch-pan-x">
              <div className="h-[320px] min-w-[720px] sm:min-w-0 sm:w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="hour"
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: string) => `${value}:00`}
                    />
                    <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#f9fafb",
                      }}
                      labelFormatter={(label) => `${label}:00`}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#34d399"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#34d399" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-white">Last 30 Min Breakdown</h3>
            <p className="mt-1 text-sm text-gray-400">
              Minute-wise activity from GA4 realtime data
            </p>
            <div className="mt-5 space-y-3">
              {(state.last30Min?.per_minute ?? []).slice(-10).reverse().map((item) => (
                <div
                  key={item.minutes_ago}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3"
                >
                  <span className="text-sm text-gray-400">
                    {item.minutes_ago === 0
                      ? "This minute"
                      : `${item.minutes_ago} min ago`}
                  </span>
                  <span className="font-semibold text-white">{item.users}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-12 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-300">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Last 15 Days Users</h3>
                <p className="text-sm text-gray-400">
                  Daily total users from GA4 for the last 15 days
                </p>
              </div>
            </div>

            <div className="-mx-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin] touch-pan-x">
              <div className="h-[320px] min-w-[720px] sm:min-w-0 sm:w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last15DaysData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#f9fafb",
                      }}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.full_date ?? ""
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#818cf8"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#818cf8" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
