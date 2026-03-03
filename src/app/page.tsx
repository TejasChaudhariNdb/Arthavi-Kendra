import { fetchStats, fetchGrowthData, fetchChats } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import GrowthChart from "@/components/GrowthChart";
import {
  Users,
  Briefcase,
  DollarSign,
  Activity,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Bell,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  let stats,
    growthData,
    recentChats = [];
  try {
    [stats, growthData, recentChats] = await Promise.all([
      fetchStats(),
      fetchGrowthData(),
      fetchChats(0, 6),
    ]);
  } catch (e) {
    return (
      <div className="text-red-500">
        Error loading dashboard:{" "}
        {e instanceof Error ? e.message : "Unknown error"}. Ensure backend is
        running.
      </div>
    );
  }

  const totalUsers = Number(stats.totalUsers || 0);
  const totalPortfolios = Number(stats.totalPortfolios || 0);
  const dau = Number(stats.dau || 0);
  const notificationsEnabled = Number(stats.notificationsEnabled || 0);
  const newUsersToday = Number(stats.newUsersToday || 0);

  const weeklySignups = (growthData || []).reduce(
    (sum: number, item: { users?: number }) => sum + Number(item.users || 0),
    0,
  );
  const peakGrowthDay = (growthData || []).reduce(
    (best: { date: string; users: number }, item: { date: string; users: number }) =>
      (item?.users || 0) > best.users ? item : best,
    { date: "-", users: 0 },
  );

  const activationProxyPct =
    totalUsers > 0 ? (totalPortfolios / totalUsers) * 100 : 0;
  const dauPct = totalUsers > 0 ? (dau / totalUsers) * 100 : 0;
  const notificationOptInPct =
    totalUsers > 0 ? (notificationsEnabled / totalUsers) * 100 : 0;

  const attentionItems = [
    newUsersToday === 0 ? "No new users today. Check acquisition channels." : "",
    dauPct < 10
      ? "DAU is low vs total users. Push re-engagement to inactive users."
      : "",
    notificationOptInPct < 25
      ? "Notification opt-in is low. Prompt users to enable alerts."
      : "",
  ].filter(Boolean);
  const todayFocus: Array<{ label: string; href: string }> = [
    ...(newUsersToday === 0
      ? [{ label: "Review new signup channels", href: "/analytics" }]
      : []),
    ...(dauPct < 10
      ? [{ label: "Re-engage inactive users", href: "/notifications" }]
      : []),
    ...(recentChats.length > 0
      ? [{ label: "Scan latest AI chats for issues", href: "/chats" }]
      : []),
    { label: "Check unresolved feedback", href: "/feedback" },
  ].slice(0, 3);
  const refreshedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {refreshedAt}
          </p>
        </div>
        <Link
          href="/users"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          Manage Users <ArrowRight size={16} />
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={`+${stats.newUsersToday} today`}
          trendUp={stats.newUsersToday > 0}
        />
        <StatsCard
          label="Daily Active Users"
          value={stats.dau}
          icon={Activity}
          trend="Active in last 24h"
          trendUp={true}
        />
        <StatsCard
          label="Total Portfolios"
          value={stats.totalPortfolios}
          icon={Briefcase}
        />
        <StatsCard
          label="Total AUM"
          value={`₹${(stats.totalAum / 10000000).toFixed(2)} Cr`}
          icon={DollarSign}
        />
        <StatsCard
          label="Notifications Enabled"
          value={stats.notificationsEnabled}
          icon={Bell}
          trend={`${((stats.notificationsEnabled / stats.totalUsers) * 100).toFixed(0)}% of users opted in`}
          trendUp={stats.notificationsEnabled > 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GrowthChart data={growthData} />
        </div>

        {/* Quick Insights */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md min-h-96">
          <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">
            Operator Snapshot
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-400" size={18} />
                <span className="text-sm text-gray-300">
                  Signups (30d)
                </span>
              </div>
              <span className="text-white font-mono font-bold">
                {weeklySignups}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" size={18} />
                <span className="text-sm text-gray-300">
                  Activation (Proxy)
                </span>
              </div>
              <span className="text-white font-mono font-bold">
                {activationProxyPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <Activity className="text-yellow-400" size={18} />
                <span className="text-sm text-gray-300">DAU / Users</span>
              </div>
              <span className="text-white font-mono font-bold">
                {dauPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <Bell className="text-indigo-400" size={18} />
                <span className="text-sm text-gray-300">Notif Opt-In</span>
              </div>
              <span className="text-white font-mono font-bold">
                {notificationOptInPct.toFixed(0)}%
              </span>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Peak signup day:{" "}
                <span className="text-gray-300 font-medium">
                  {peakGrowthDay.date}
                </span>{" "}
                ({peakGrowthDay.users})
              </p>
            </div>
            {attentionItems.length > 0 && (
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <p className="text-xs text-amber-300 flex items-center gap-1">
                  <AlertTriangle size={14} /> Needs Attention
                </p>
                {attentionItems.slice(0, 2).map((item) => (
                  <p key={item} className="text-xs text-gray-400 leading-relaxed">
                    • {item}
                  </p>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/users"
                  className="text-xs px-2.5 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors inline-flex items-center gap-1">
                  Users <ExternalLink size={12} />
                </Link>
                <Link
                  href="/chats"
                  className="text-xs px-2.5 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors inline-flex items-center gap-1">
                  AI Chats <ExternalLink size={12} />
                </Link>
                <Link
                  href="/feedback"
                  className="text-xs px-2.5 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors inline-flex items-center gap-1">
                  Feedback <ExternalLink size={12} />
                </Link>
                <Link
                  href="/notifications"
                  className="text-xs px-2.5 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors inline-flex items-center gap-1">
                  Notifications <ExternalLink size={12} />
                </Link>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Today Focus
              </p>
              <div className="space-y-1.5">
                {todayFocus.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-xs text-gray-300 hover:text-emerald-300 transition-colors">
                    • {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Chats */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
            <MessageSquare size={16} /> Recent AI Conversations
          </h3>
          <Link
            href="/chats"
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentChats.map(
            (chat: {
              id: number;
              title?: string;
              updated_at?: string;
              preview?: string;
              user?: { id?: number; name?: string };
            }) => (
            <Link
              key={chat.id}
              href={`/users/${chat.user?.id ?? ""}`}
              className="block group">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-800 group-hover:border-emerald-500/30 group-hover:bg-gray-800 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-900/20 px-2 py-1 rounded">
                    {chat.user?.name || "Unknown User"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {chat.updated_at}
                  </span>
                </div>
                <h4 className="text-white font-medium text-sm mb-1 truncate group-hover:text-emerald-300 transition-colors">
                  {chat.title || "Conversation"}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2 mt-auto">
                  &quot;{chat.preview}&quot;
                </p>
              </div>
            </Link>
            ),
          )}
          {recentChats.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-4">
              No recent chats.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
