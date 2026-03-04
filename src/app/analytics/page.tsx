import { fetchAnalytics } from "@/lib/api";
import Link from "next/link";
import {
  BarChart3,
  Users,
  TrendingUp,
  MessageSquare,
  Activity,
  Calendar,
} from "lucide-react";

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
      <div className="text-white p-4">
        Error loading analytics. Ensure backend is running.
      </div>
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
    v > 0 ? "text-emerald-400" : v < 0 ? "text-rose-400" : "text-gray-400";
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
      ? (((funnel[0].value - funnel[1].value) / funnel[0].value) * 100).toFixed(
          1,
        )
      : "0.0";
  const dropoff23 =
    funnel[1].value > 0
      ? (((funnel[1].value - funnel[2].value) / funnel[1].value) * 100).toFixed(
          1,
        )
      : "0.0";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Deep insights into user behavior and platform metrics
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/users"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md block hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              Activation Rate
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {user_stats.activation_rate}%
          </p>
          <p className={`text-xs mt-1 ${deltaClass(kpi_deltas.activation_rate_pct)}`}>
            {deltaArrow(kpi_deltas.activation_rate_pct)}{" "}
            {Math.abs(kpi_deltas.activation_rate_pct)}% vs prior period
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {user_stats.users_with_portfolios} / {user_stats.total_users} users
            have portfolios
          </p>
        </Link>

        <Link
          href="/users"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md block hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-emerald-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              New Users (7d)
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {recent_activity.new_users_7d}
          </p>
          <p className={`text-xs mt-1 ${deltaClass(kpi_deltas.new_users_7d_pct)}`}>
            {deltaArrow(kpi_deltas.new_users_7d_pct)}{" "}
            {Math.abs(kpi_deltas.new_users_7d_pct)}% vs previous 7d (
            {previous_activity.new_users_7d})
          </p>
        </Link>

        <Link
          href="/users?portfolio=yes&page=1"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md block hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-purple-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              New Portfolios (7d)
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">{recent_activity.new_portfolios_7d}</p>
          <p
            className={`text-xs mt-1 ${deltaClass(kpi_deltas.new_portfolios_7d_pct)}`}>
            {deltaArrow(kpi_deltas.new_portfolios_7d_pct)}{" "}
            {Math.abs(kpi_deltas.new_portfolios_7d_pct)}% vs previous 7d (
            {previous_activity.new_portfolios_7d})
          </p>
        </Link>

        <Link
          href="/chats"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md block hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-yellow-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              New Chats (7d)
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">{recent_activity.new_chats_7d}</p>
          <p className={`text-xs mt-1 ${deltaClass(kpi_deltas.new_chats_7d_pct)}`}>
            {deltaArrow(kpi_deltas.new_chats_7d_pct)}{" "}
            {Math.abs(kpi_deltas.new_chats_7d_pct)}% vs previous 7d (
            {previous_activity.new_chats_7d})
          </p>
        </Link>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-semibold text-white mb-5">
          Conversion Funnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {funnel.map((step, idx) => (
            <Link
              key={step.label}
              href={step.href}
              className="p-4 rounded-lg border border-gray-800 bg-gray-800/40 hover:border-gray-700 transition-colors block">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Step {idx + 1}
              </p>
              <p className="text-sm text-gray-300 mt-1">{step.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{step.value}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-400 flex flex-wrap gap-6">
          <span>Drop-off: Users → Portfolio = {dropoff12}%</span>
          <span>Drop-off: Portfolio → AI = {dropoff23}%</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signups by Weekday */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar size={20} className="text-emerald-400" />
              Signups by Weekday
            </h3>
            <span className="text-xs text-gray-500">
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
                <div key={item.day} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 font-medium">
                      {item.day}
                    </span>
                    <span className="text-emerald-400 font-mono">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signups by Hour */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              Signups by Hour
            </h3>
            <span className="text-xs text-gray-500">
              Peak: {peakHour.hour} ({peakHour.count})
            </span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
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
                    <span className="text-gray-400 text-xs font-mono w-12">
                      {item.hour}
                    </span>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-blue-400 font-mono text-xs w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acquisition Source */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            Signup Source
          </h3>
          <div className="space-y-3">
            {signups_by_source.map((item: SignupSource) => (
              <div
                key={item.source}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-300 capitalize">
                  {item.source}
                </span>
                <span className="text-white font-mono font-bold">
                  {item.count} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            User Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Total Users</span>
              <span className="text-white font-mono font-bold">
                {user_stats.total_users}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">With Portfolios</span>
              <span className="text-emerald-400 font-mono font-bold">
                {user_stats.users_with_portfolios}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Using AI</span>
              <span className="text-blue-400 font-mono font-bold">
                {user_stats.users_with_ai_chats}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            Portfolio Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Total Portfolios</span>
              <span className="text-white font-mono font-bold">
                {portfolio_stats.total_portfolios}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">MF Schemes</span>
              <span className="text-purple-400 font-mono font-bold">
                {portfolio_stats.total_schemes}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Stock Holdings</span>
              <span className="text-orange-400 font-mono font-bold">
                {portfolio_stats.total_equity_holdings}
              </span>
            </div>
          </div>
        </div>

        {/* AI Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">AI Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Total Sessions</span>
              <span className="text-white font-mono font-bold">
                {ai_stats.total_sessions}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Total Messages</span>
              <span className="text-yellow-400 font-mono font-bold">
                {ai_stats.total_messages}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">New Chats (7d)</span>
              <span className="text-emerald-400 font-mono font-bold">
                {recent_activity.new_chats_7d}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Growth */}
      {growth_by_month && growth_by_month.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Monthly Growth (Last 6 Months)
          </h3>
          <div className="space-y-3">
            {growth_by_month.map((item: GrowthMonth) => {
              const maxCount = Math.max(
                ...growth_by_month.map((i: GrowthMonth) => i.count),
              );
              const percentage =
                maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 font-medium">
                      {item.month}
                    </span>
                    <span className="text-emerald-400 font-mono">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
