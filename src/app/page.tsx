import { Suspense } from "react";
import { fetchStats, fetchGrowthData, fetchChats } from "@/lib/api";
import AnalyticsOverview from "@/components/AnalyticsOverview";
import StatsCard from "@/components/StatsCard";
import GrowthChart from "@/components/GrowthChart";
import { FamilyDynamicsSection } from "@/components/FamilyDynamicsSection";
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

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-slate-100 dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 h-[120px] animate-pulse"></div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-slate-100 dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full h-[380px] animate-pulse"></div>
  );
}

function SnapshotSkeleton() {
  return (
    <div className="bg-slate-100 dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 min-h-96 animate-pulse"></div>
  );
}

function ChatsSkeleton() {
  return (
    <div className="bg-slate-100 dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs mt-8">
      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

async function StatsSection() {
  let stats;
  try {
    stats = await fetchStats();
  } catch {
    return <div className="text-rose-500">Failed to load stats.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        pulse={true}
      />
      <StatsCard
        label="Total Portfolios"
        value={stats.totalPortfolios}
        icon={Briefcase}
        trend={`MF: ${stats.totalMfPortfolios || 0} | Stocks: ${stats.totalEquityPortfolios || 0}`}
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
        trend={`${((stats.notificationsEnabled / stats.totalUsers) * 100).toFixed(0)}% opted in`}
        trendUp={stats.notificationsEnabled > 0}
      />
    </div>
  );
}

async function FamilyDynamicsSummarySection() {
  let stats;
  try {
    stats = await fetchStats();
  } catch {
    return <div className="text-rose-500 mt-8">Failed to load family dynamics.</div>;
  }
  return <FamilyDynamicsSection stats={stats} />;
}

async function GrowthChartSection() {
  let growthData;
  try {
    growthData = await fetchGrowthData();
  } catch {
    return <div className="text-rose-500">Failed to load chart data.</div>;
  }
  return <GrowthChart data={growthData} />;
}

async function OperatorSnapshotSection() {
  let stats, growthData, recentChats;
  try {
    [stats, growthData, recentChats] = await Promise.all([
      fetchStats(),
      fetchGrowthData(),
      fetchChats(0, 6),
    ]);
  } catch {
    return <div className="text-rose-500">Failed to load snapshot.</div>;
  }

  const totalUsers = Number(stats.totalUsers || 0);
  const totalPortfolios = Number(stats.totalPortfolios || 0);
  const dau = Number(stats.dau || 0);
  const notificationsEnabled = Number(stats.notificationsEnabled || 0);
  const newUsersToday = Number(stats.newUsersToday || 0);

  const weeklySignups = (growthData?.growth15 || []).slice(-7).reduce(
    (sum: number, item: { users?: number }) => sum + Number(item.users || 0),
    0,
  );
  const peakGrowthDay = (growthData?.growth15 || []).reduce(
    (
      best: { displayDate: string; currentDate: string; users: number },
      item: { displayDate: string; currentDate: string; users: number },
    ) => ((item?.users || 0) > best.users ? item : best),
    { displayDate: "-", currentDate: "-", users: 0 },
  );

  const activationProxyPct =
    totalUsers > 0 ? (totalPortfolios / totalUsers) * 100 : 0;
  const dauPct = totalUsers > 0 ? (dau / totalUsers) * 100 : 0;
  const notificationOptInPct =
    totalUsers > 0 ? (notificationsEnabled / totalUsers) * 100 : 0;

  const attentionItems = [
    newUsersToday === 0
      ? "No new users today. Check acquisition channels."
      : "",
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
      ? [
          {
            label: "Open active users (24h)",
            href: "/users?active_24=1&sort_by=last_active_at&sort_order=desc",
          },
        ]
      : []),
    ...(recentChats.length > 0
      ? [{ label: "Scan latest AI chats for issues", href: "/chats" }]
      : []),
    { label: "Check unresolved feedback", href: "/feedback" },
  ].slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xs min-h-96 flex flex-col justify-between transition-colors">
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">
          Operator Snapshot
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={16} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Signups (30d)</span>
            </div>
            <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
              {weeklySignups}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-2.5">
              <Users className="text-blue-500" size={16} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Activation (Proxy)</span>
            </div>
            <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
              {activationProxyPct.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-2.5">
              <Activity className="text-amber-500" size={16} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">DAU / Users</span>
            </div>
            <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
              {dauPct.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-2.5">
              <Bell className="text-indigo-500" size={16} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notif Opt-In</span>
            </div>
            <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
              {notificationOptInPct.toFixed(0)}%
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Peak signup day:{" "}
              <span className="text-slate-700 dark:text-slate-200 font-semibold">
                {peakGrowthDay.displayDate || peakGrowthDay.currentDate}
              </span>{" "}
              ({peakGrowthDay.users})
            </p>
          </div>
          {attentionItems.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-1.5">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle size={13} /> Needs Attention
              </p>
              {attentionItems.slice(0, 2).map((item) => (
                <p key={item} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  • {item}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/users"
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-white transition-colors inline-flex items-center gap-1 font-medium shadow-2xs">
              Users <ExternalLink size={11} />
            </Link>
            <Link
              href="/chats"
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-white transition-colors inline-flex items-center gap-1 font-medium shadow-2xs">
              AI Chats <ExternalLink size={11} />
            </Link>
            <Link
              href="/feedback"
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-white transition-colors inline-flex items-center gap-1 font-medium shadow-2xs">
              Feedback <ExternalLink size={11} />
            </Link>
            <Link
              href="/notifications"
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-white transition-colors inline-flex items-center gap-1 font-medium shadow-2xs">
              Notifications <ExternalLink size={11} />
            </Link>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Today Focus
          </p>
          <div className="space-y-1">
            {todayFocus.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                • {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function RecentChatsSection() {
  let recentChats = [];
  try {
    recentChats = await fetchChats(0, 6);
  } catch {
    return (
      <div className="text-rose-500 mt-8">Failed to load recent chats.</div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs mt-8 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" /> Recent AI Conversations
        </h3>
        <Link
          href="/chats"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-bold">
          View All →
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
              href={`/users/${chat.user?.id ?? ""}?tab=chats&chatId=${chat.id}`}
              className="block group">
              <div className="p-4 bg-slate-50 dark:bg-[#070a13] border border-slate-200/80 dark:border-white/[0.06] rounded-xl group-hover:border-indigo-500/40 transition-all h-full flex flex-col shadow-2xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 px-2 py-0.5 rounded-md">
                    {chat.user?.name || "Unknown User"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {chat.updated_at}
                  </span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {chat.title || "Conversation"}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-auto leading-relaxed">
                  &quot;{chat.preview}&quot;
                </p>
              </div>
            </Link>
          ),
        )}
        {recentChats.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-6 text-xs">
            No recent conversations found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const refreshedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Realtime administration &amp; platform performance metrics
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
            Last refreshed: {refreshedAt} IST
          </p>
        </div>
        <Link
          href="/users"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 self-start sm:self-auto cursor-pointer">
          Manage Users <ArrowRight size={15} />
        </Link>
      </header>

      <div className="space-y-6">
        <AnalyticsOverview />

        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<div className="bg-slate-100 dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 h-48 animate-pulse"></div>}>
          <FamilyDynamicsSummarySection />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
              <GrowthChartSection />
            </Suspense>
          </div>

          <Suspense fallback={<SnapshotSkeleton />}>
            <OperatorSnapshotSection />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<ChatsSkeleton />}>
        <RecentChatsSection />
      </Suspense>
    </div>
  );
}
