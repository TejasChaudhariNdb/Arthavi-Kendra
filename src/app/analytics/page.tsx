import { fetchAnalytics } from "@/lib/api";
import AnalyticsOverview from "@/components/AnalyticsOverview";
import Link from "next/link";
import {
  BarChart3,
  Users,
  TrendingUp,
  MessageSquare,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface CountByLabel {
  count: number;
}

interface SignupWeekday extends CountByLabel {
  day: string;
}

interface SignupHour extends CountByLabel {
  hour: string;
}

interface GrowthMonth extends CountByLabel {
  month: string;
}

interface SignupSource extends CountByLabel {
  source: string;
  pct: number;
}

interface AnalyticsResponse {
  signups_by_weekday: SignupWeekday[];
  signups_by_hour: SignupHour[];
  signups_by_source: SignupSource[];
  user_stats: {
    total_users: number;
    users_with_portfolios: number;
    users_with_ai_chats: number;
    activation_rate: number;
  };
  portfolio_stats: {
    total_portfolios: number;
    total_schemes: number;
    total_equity_holdings: number;
    avg_mf_value: number;
    avg_equity_value: number;
  };
  ai_stats: {
    total_sessions: number;
    total_messages: number;
    avg_messages_per_session: number;
  };
  recent_activity: {
    new_users_7d: number;
    new_portfolios_7d: number;
    new_chats_7d: number;
  };
  previous_activity: {
    new_users_7d: number;
    new_portfolios_7d: number;
    new_chats_7d: number;
  };
  kpi_deltas: {
    activation_rate_pct: number;
    new_users_7d_pct: number;
    new_portfolios_7d_pct: number;
    new_chats_7d_pct: number;
    ai_usage_pct: number;
  };
  growth_by_month: GrowthMonth[];
}

export default async function AnalyticsPage() {
  let data: AnalyticsResponse | null = null;
  try {
    data = (await fetchAnalytics()) as AnalyticsResponse;
  } catch (error) {
    console.error("Failed to load analytics", error);
    return (
      <Card className="p-8 text-center border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
        <div className="flex flex-col items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-semibold">Error loading platform analytics</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ensure the backend API service is running.</p>
        </div>
      </Card>
    );
  }

  const {
    signups_by_weekday,
    signups_by_hour,
    signups_by_source,
    user_stats,
    portfolio_stats,
    ai_stats,
    recent_activity,
    previous_activity,
    kpi_deltas,
    growth_by_month,
  } = data;

  // Find peak signup day and hour
  const peakDay = signups_by_weekday.reduce((max: SignupWeekday, item: SignupWeekday) =>
    item.count > max.count ? item : max,
  );
  const peakHour = signups_by_hour.reduce((max: SignupHour, item: SignupHour) =>
    item.count > max.count ? item : max,
  );

  const deltaClass = (v: number) =>
    v > 0 ? "text-emerald-600 dark:text-emerald-400" : v < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400";
  const deltaArrow = (v: number) => (v > 0 ? "▲" : v < 0 ? "▼" : "•");

  const funnel = [
    { label: "Total Users", value: user_stats.total_users, href: "/users" },
    {
      label: "With Portfolio",
      value: user_stats.users_with_portfolios,
      href: "/users?portfolio=yes&page=1",
    },
    { label: "Using AI", value: user_stats.users_with_ai_chats, href: "/chats" },
  ];

  const dropoff12 =
    funnel[0].value > 0
      ? (((funnel[0].value - funnel[1].value) / funnel[0].value) * 100).toFixed(1)
      : "0.0";
  const dropoff23 =
    funnel[1].value > 0
      ? (((funnel[1].value - funnel[2].value) / funnel[1].value) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      <AnalyticsOverview />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Platform Analytics &amp; Funnels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep insights into user conversion behavior, peak signup distribution &amp; cohort engagement
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/users" className="block group">
          <Card className="p-5 sm:p-6 hover:border-indigo-500/40 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                  Activation Rate
                </h3>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {user_stats.activation_rate}%
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.04]">
              <p className={`text-xs font-semibold ${deltaClass(kpi_deltas.activation_rate_pct)}`}>
                {deltaArrow(kpi_deltas.activation_rate_pct)}{" "}
                {Math.abs(kpi_deltas.activation_rate_pct)}% vs prior period
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {user_stats.users_with_portfolios} / {user_stats.total_users} users active
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/users" className="block group">
          <Card className="p-5 sm:p-6 hover:border-indigo-500/40 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                  New Users (7d)
                </h3>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {recent_activity.new_users_7d}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.04]">
              <p className={`text-xs font-semibold ${deltaClass(kpi_deltas.new_users_7d_pct)}`}>
                {deltaArrow(kpi_deltas.new_users_7d_pct)}{" "}
                {Math.abs(kpi_deltas.new_users_7d_pct)}% vs previous 7d
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Prior 7d: {previous_activity.new_users_7d} users
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/users?portfolio=yes&page=1" className="block group">
          <Card className="p-5 sm:p-6 hover:border-indigo-500/40 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                  New Portfolios (7d)
                </h3>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {recent_activity.new_portfolios_7d}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.04]">
              <p className={`text-xs font-semibold ${deltaClass(kpi_deltas.new_portfolios_7d_pct)}`}>
                {deltaArrow(kpi_deltas.new_portfolios_7d_pct)}{" "}
                {Math.abs(kpi_deltas.new_portfolios_7d_pct)}% vs previous 7d
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Prior 7d: {previous_activity.new_portfolios_7d} uploads
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/chats" className="block group">
          <Card className="p-5 sm:p-6 hover:border-indigo-500/40 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                  New Chats (7d)
                </h3>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {recent_activity.new_chats_7d}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.04]">
              <p className={`text-xs font-semibold ${deltaClass(kpi_deltas.new_chats_7d_pct)}`}>
                {deltaArrow(kpi_deltas.new_chats_7d_pct)}{" "}
                {Math.abs(kpi_deltas.new_chats_7d_pct)}% vs previous 7d
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Prior 7d: {previous_activity.new_chats_7d} sessions
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Onboarding &amp; Feature Adoption Funnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {funnel.map((step, idx) => (
            <Link
              key={step.label}
              href={step.href}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] hover:border-indigo-500/40 transition-colors block group"
            >
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Stage {idx + 1}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{step.label}</p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {step.value}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.04] text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-6 font-medium">
          <span>Drop-off (Users → Portfolios): <strong className="text-slate-700 dark:text-slate-300">{dropoff12}%</strong></span>
          <span>Drop-off (Portfolios → AI Chat): <strong className="text-slate-700 dark:text-slate-300">{dropoff23}%</strong></span>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups by Weekday */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
              Signups by Weekday
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
              Peak: {peakDay.day} ({peakDay.count})
            </span>
          </div>
          <div className="space-y-3">
            {signups_by_weekday.map((item: SignupWeekday) => {
              const maxCount = Math.max(
                ...signups_by_weekday.map((i: SignupWeekday) => i.count),
              );
              const percentage =
                maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.day} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.day}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Signups by Hour */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
              Signups by Hour
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
              Peak: {peakHour.hour} ({peakHour.count})
            </span>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2">
            {signups_by_hour
              .filter((item: SignupHour) => item.count > 0)
              .map((item: SignupHour) => {
                const maxCount = Math.max(
                  ...signups_by_hour.map((i: SignupHour) => i.count),
                );
                const percentage =
                  maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.hour} className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono w-14">
                      {item.hour}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs w-8 text-right font-bold">
                      {item.count}
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Acquisition Source */}
        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Signup Source Distribution
          </h3>
          <div className="space-y-2.5">
            {signups_by_source.map((item: SignupSource) => (
              <div
                key={item.source}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl"
              >
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 capitalize font-medium">
                  {item.source}
                </span>
                <span className="text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm">
                  {item.count} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* User Engagement */}
        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            User Engagement
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">Total Registered</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm">
                {user_stats.total_users}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">With Portfolios</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm">
                {user_stats.users_with_portfolios}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">Using AI Chat</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs sm:text-sm">
                {user_stats.users_with_ai_chats}
              </span>
            </div>
          </div>
        </Card>

        {/* Portfolio Stats */}
        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Portfolio &amp; Asset Stats
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">Total Portfolios</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm">
                {portfolio_stats.total_portfolios}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">MF Schemes</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm">
                {portfolio_stats.total_schemes}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">Stock Holdings</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs sm:text-sm">
                {portfolio_stats.total_equity_holdings}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
