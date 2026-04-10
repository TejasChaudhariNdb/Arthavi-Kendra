import { Suspense } from "react";
import { fetchStats, fetchGrowthData, fetchChats, fetchBuyIdeas } from "@/lib/api";
import AnalyticsOverview from "@/components/AnalyticsOverview";
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
  Target,
  Layers,
} from "lucide-react";
import Link from "next/link";

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[120px] animate-pulse"></div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full h-[400px] animate-pulse"></div>
  );
}

function SnapshotSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-96 animate-pulse"></div>
  );
}

function ChatsSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md mt-8">
      <div className="h-6 w-48 bg-gray-800 rounded animate-pulse mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

function BuyIdeasSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-80 animate-pulse"></div>
  );
}

async function StatsSection() {
  let stats;
  try {
    stats = await fetchStats();
  } catch {
    return <div className="text-red-500">Failed to load stats.</div>;
  }
  return (
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
        trend={`${((stats.notificationsEnabled / stats.totalUsers) * 100).toFixed(0)}% of users opted in`}
        trendUp={stats.notificationsEnabled > 0}
      />
    </div>
  );
}

async function GrowthChartSection() {
  let growthData;
  try {
    growthData = await fetchGrowthData();
  } catch {
    return <div className="text-red-500">Failed to load chart data.</div>;
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
    return <div className="text-red-500">Failed to load snapshot.</div>;
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md min-h-96">
      <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">
        Operator Snapshot
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={18} />
            <span className="text-sm text-gray-300">Signups (30d)</span>
          </div>
          <span className="text-white font-mono font-bold">
            {weeklySignups}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
          <div className="flex items-center gap-3">
            <Users className="text-blue-400" size={18} />
            <span className="text-sm text-gray-300">Activation (Proxy)</span>
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
              {peakGrowthDay.displayDate || peakGrowthDay.currentDate}
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
  );
}

async function RecentChatsSection() {
  let recentChats = [];
  try {
    recentChats = await fetchChats(0, 6);
  } catch {
    return (
      <div className="text-red-500 mt-8">Failed to load recent chats.</div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md mt-8">
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
              href={`/users/${chat.user?.id ?? ""}?tab=chats&chatId=${chat.id}`}
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
  );
}

async function BuyIdeasSection() {
  let buyIdeas;
  try {
    buyIdeas = await fetchBuyIdeas();
  } catch {
    return (
      <div className="text-red-500">Failed to load today&apos;s buy signals.</div>
    );
  }

  const coverage = buyIdeas.coverage || {};
  const allocation = buyIdeas.allocation || {};
  const recommendations = buyIdeas.recommendations || [];
  const popularMutualFunds = buyIdeas.popular_mutual_funds || [];
  const popularStocks = buyIdeas.popular_stocks || [];

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
            <Target size={16} /> Today&apos;s Buy Signals
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Global admin view based on all user MF and stock holdings.
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Generated: {buyIdeas.generated_at || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            MF Users
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(coverage.mf_users || 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Stock Users
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(coverage.stock_users || 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            MF Share
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(allocation.mf_share_pct || 0).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Debt + Hybrid Share
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(allocation.debt_hybrid_share_pct || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map(
              (item: {
                title: string;
                name?: string | null;
                meta?: string | null;
                instrument_type: string;
                priority: string;
                reason: string;
              }) => (
                <div
                  key={`${item.title}-${item.name ?? item.meta ?? "idea"}`}
                  className="rounded-xl border border-gray-800 bg-gray-800/30 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                          {item.instrument_type.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-300 bg-gray-700/70 px-2 py-1 rounded">
                          {item.priority}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mt-3">
                        {item.title}
                      </h4>
                      {item.name && (
                        <p className="text-emerald-300 font-medium mt-1">
                          {item.name}
                        </p>
                      )}
                      {item.meta && (
                        <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">
                          {item.meta}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              ),
            )
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5 text-gray-500">
              No buy signals available yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
            <h4 className="text-sm font-medium uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <Layers size={15} /> Popular Mutual Funds
            </h4>
            <div className="space-y-3 mt-4">
              {popularMutualFunds.length > 0 ? (
                popularMutualFunds.map(
                  (item: {
                    name: string;
                    bucket: string;
                    holders: number;
                    total_value: number;
                  }) => (
                    <div
                      key={item.name}
                      className="border-b border-gray-800 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="text-sm font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.bucket} • {item.holders} users
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ₹{Number(item.total_value || 0).toLocaleString()}
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="text-sm text-gray-500">No MF data found.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
            <h4 className="text-sm font-medium uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <TrendingUp size={15} /> Popular Stocks
            </h4>
            <div className="space-y-3 mt-4">
              {popularStocks.length > 0 ? (
                popularStocks.map(
                  (item: {
                    symbol: string;
                    sector: string;
                    holders: number;
                    total_value: number;
                  }) => (
                    <div
                      key={item.symbol}
                      className="border-b border-gray-800 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="text-sm font-medium text-white">
                        {item.symbol}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.sector} • {item.holders} users
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ₹{Number(item.total_value || 0).toLocaleString()}
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="text-sm text-gray-500">No stock data found.</div>
              )}
            </div>
          </div>

          {allocation.top_sector_name && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs uppercase tracking-wide text-amber-300">
                Sector concentration
              </p>
              <p className="text-white font-semibold mt-2">
                {allocation.top_sector_name}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {Number(allocation.top_sector_share_pct || 0).toFixed(1)}% of total stock value.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const refreshedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
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

      <div className="space-y-8">
        <AnalyticsOverview />

        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<BuyIdeasSkeleton />}>
          <BuyIdeasSection />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
