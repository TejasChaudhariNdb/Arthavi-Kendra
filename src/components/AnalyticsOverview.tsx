"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  TimerReset,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
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

interface OverviewState {
  activeNow: ActiveNowResponse | null;
  last30Min: Last30MinResponse | null;
  todayTrend: TodayTrendResponse | null;
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
  const [state, setState] = useState<OverviewState>({
    activeNow: null,
    last30Min: null,
    todayTrend: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const [activeNowRes, last30MinRes, todayTrendRes] = await Promise.all([
          fetch("/api/analytics/active-now", { cache: "no-store" }),
          fetch("/api/analytics/last-30-min", { cache: "no-store" }),
          fetch("/api/analytics/today-trend", { cache: "no-store" }),
        ]);

        if (!activeNowRes.ok || !last30MinRes.ok || !todayTrendRes.ok) {
          throw new Error("Unable to load analytics overview");
        }

        const [activeNow, last30Min, todayTrend] = await Promise.all([
          activeNowRes.json() as Promise<ActiveNowResponse>,
          last30MinRes.json() as Promise<Last30MinResponse>,
          todayTrendRes.json() as Promise<TodayTrendResponse>,
        ]);

        if (!cancelled) {
          setState({
            activeNow,
            last30Min,
            todayTrend,
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
  }, []);

  const trendData = state.todayTrend?.trend ?? [];

  return (
    <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-950 via-gray-950 to-gray-900 p-6 shadow-xl">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Analytics Overview
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Live GA4 dashboard snapshot
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Today users includes both new and returning users active today. Realtime
            cards are refreshed automatically every 60 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw size={16} />
          Auto refresh: 60s
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-3">
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

            <div className="h-[320px] w-full">
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
        </div>
      )}
    </section>
  );
}
