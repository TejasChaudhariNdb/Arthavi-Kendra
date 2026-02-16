import { fetchAnalytics } from "@/lib/api";
import {
  BarChart3,
  Users,
  TrendingUp,
  MessageSquare,
  Activity,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  let data = null;
  try {
    data = await fetchAnalytics();
  } catch (e) {
    return (
      <div className="text-white p-4">
        Error loading analytics. Ensure backend is running.
      </div>
    );
  }

  const {
    signups_by_weekday,
    signups_by_hour,
    user_stats,
    portfolio_stats,
    ai_stats,
    recent_activity,
    growth_by_month,
  } = data;

  // Find peak signup day and hour
  const peakDay = signups_by_weekday.reduce((max: any, item: any) =>
    item.count > max.count ? item : max,
  );
  const peakHour = signups_by_hour.reduce((max: any, item: any) =>
    item.count > max.count ? item : max,
  );

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
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              Activation Rate
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {user_stats.activation_rate}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {user_stats.users_with_portfolios} / {user_stats.total_users} users
            have portfolios
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-emerald-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              New Users (7d)
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {recent_activity.new_users_7d}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-purple-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              Avg MF Value
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{(portfolio_stats.avg_mf_value / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">Per portfolio</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-yellow-400" size={20} />
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
              AI Usage
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {ai_stats.avg_messages_per_session}
          </p>
          <p className="text-xs text-gray-500 mt-1">Avg messages per session</p>
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
            {signups_by_weekday.map((item: any) => {
              const maxCount = Math.max(
                ...signups_by_weekday.map((i: any) => i.count),
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
              .filter((item: any) => item.count > 0)
              .map((item: any) => {
                const maxCount = Math.max(
                  ...signups_by_hour.map((i: any) => i.count),
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
            {growth_by_month.map((item: any) => {
              const maxCount = Math.max(
                ...growth_by_month.map((i: any) => i.count),
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
