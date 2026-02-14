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
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  let stats,
    growthData,
    recentChats = [];
  try {
    stats = await fetchStats();
    growthData = await fetchGrowthData();
    recentChats = await fetchChats(0, 6); // Fetch 6 for grid layout
  } catch (e) {
    return (
      <div className="text-red-500">
        Error loading dashboard:{" "}
        {e instanceof Error ? e.message : "Unknown error"}. Ensure backend is
        running.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back, Admin. Here's what's happening today.
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GrowthChart data={growthData} />
        </div>

        {/* Quick Insights */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md h-96">
          <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-400" size={18} />
                <span className="text-sm text-gray-300">
                  New Signups (Week)
                </span>
              </div>
              <span className="text-white font-mono font-bold">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" size={18} />
                <span className="text-sm text-gray-300">Active Portfolios</span>
              </div>
              <span className="text-white font-mono font-bold">
                {stats.totalPortfolios}
              </span>
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
          {recentChats.map((chat: any) => (
            <Link
              key={chat.id}
              href={`/users/${chat.user.id}`}
              className="block group">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-800 group-hover:border-emerald-500/30 group-hover:bg-gray-800 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-900/20 px-2 py-1 rounded">
                    {chat.user.name}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {chat.updated_at}
                  </span>
                </div>
                <h4 className="text-white font-medium text-sm mb-1 truncate group-hover:text-emerald-300 transition-colors">
                  {chat.title || "Conversation"}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2 mt-auto">
                  "{chat.preview}"
                </p>
              </div>
            </Link>
          ))}
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
