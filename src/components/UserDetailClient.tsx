"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  PieChart,
  History,
  Layers,
  MessageSquare,
  ChevronRight,
  Filter,
  Activity,
  CalendarDays,
  Users,
  Trash2,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Link from "next/link";
import ChatInbox from "@/components/ChatInbox";
import StatsCard from "@/components/StatsCard";
import AllocationChart from "@/components/AllocationChart";
import { clsx } from "clsx";

function CopyButton({ textValue }: { textValue: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-gray-800/40 transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-emerald-400 font-bold" /> : <Copy size={11} />}
    </button>
  );
}

const TIMELINE_DAYS = 30;

function formatUtcDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseActivityDate(value: string) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatUtcDate(parsed);
}

export default function UserDetailClient({
  data,
  activity,
  initialTab = "overview",
  initialChatId = null,
}: {
  data: any;
  activity?: any;
  initialTab?: "overview" | "holdings" | "chats";
  initialChatId?: number | null;
}) {
  const {
    user,
    portfolios,
    top_holdings,
    all_holdings,
    recent_transactions,
    chats = [],
    predictions = [],
    profiles = [],
  } = data;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "chats">(
    initialTab,
  );
  const [selectedHoldingType, setSelectedHoldingType] = useState<
    "ALL" | "EQUITY" | "MUTUAL_FUND"
  >("ALL");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDeletePortfolio = async (portfolioId: number) => {
    setIsDeleting(portfolioId);
    try {
      const { deletePortfolio } = await import("@/lib/auth-client");
      await deletePortfolio(portfolioId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete portfolio");
    } finally {
      setIsDeleting(null);
    }
  };

  const selectedChatId =
    initialChatId && chats.some((chat: any) => chat.id === initialChatId)
      ? initialChatId
      : chats?.length > 0
        ? chats[0].id
        : null;

  // Derived Data
  const totalInvested = portfolios.reduce(
    (acc: number, p: any) => acc + (p.invested_value || 0),
    0,
  );
  const totalProfit = (user.total_value || 0) - totalInvested;
  const isProfit = totalProfit >= 0;

  const equityValue = portfolios
    .filter((p: any) => p.type === "EQUITY")
    .reduce((acc: number, p: any) => acc + p.current_value, 0);
  const mfValue = portfolios
    .filter((p: any) => p.type === "MUTUAL_FUND")
    .reduce((acc: number, p: any) => acc + p.current_value, 0);

  const allocationData = [
    { name: "Equity", value: equityValue },
    { name: "Mutual Funds", value: mfValue },
  ];

  // Activity Processing
  const processActivityData = () => {
    if (!activity || !activity.recent_activity_dates) return [];

    const dates = new Set(
      activity.recent_activity_dates
        .map((value: string) => parseActivityDate(value))
        .filter(Boolean),
    );
    const chartData = [];
    const today = new Date();
    const utcToday = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
      ),
    );

    for (let i = TIMELINE_DAYS - 1; i >= 0; i--) {
      const day = new Date(utcToday);
      day.setUTCDate(utcToday.getUTCDate() - i);
      const fullDate = formatUtcDate(day);

      chartData.push({
        date: fullDate.slice(5, 10),
        fullDate,
        active: dates.has(fullDate) ? 1 : 0,
      });
    }

    return chartData;
  };
  const activityChartData = processActivityData();

  const filteredHoldings = all_holdings.filter((h: any) =>
    selectedHoldingType === "ALL" ? true : h.type === selectedHoldingType,
  );

  // CRM Profile Insights calculations
  const lastActiveDate = activity?.last_active_date ? new Date(activity.last_active_date) : null;
  const daysSinceActive = lastActiveDate ? Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  let engagementLevel = "Inactive";
  let engagementColor = "text-gray-400 bg-gray-850";
  if (activity?.total_active_days >= 12) {
    engagementLevel = "Power User";
    engagementColor = "text-emerald-400 bg-emerald-950/40";
  } else if (activity?.total_active_days >= 3) {
    engagementLevel = "Casual User";
    engagementColor = "text-blue-400 bg-blue-950/40";
  } else if (daysSinceActive >= 5 || activity?.total_active_days < 3) {
    engagementLevel = "Churn Risk";
    engagementColor = "text-rose-400 bg-rose-950/40";
  }

  let investorClass = "No Investments";
  let investorColor = "text-gray-500 bg-gray-950";
  if (user.total_value >= 1000000) {
    investorClass = "Whale (₹10L+)";
    investorColor = "text-amber-400 bg-amber-950/40";
  } else if (user.total_value >= 100000) {
    investorClass = "Mid-Tier (₹1L-10L)";
    investorColor = "text-sky-400 bg-sky-950/40";
  } else if (user.total_value > 0) {
    investorClass = "Starter (<₹1L)";
    investorColor = "text-indigo-400 bg-indigo-950/40";
  }

  const totalAssets = equityValue + mfValue;
  let allocationStyle = "Balanced";
  let allocationColor = "text-teal-400 bg-teal-950/40";
  if (totalAssets > 0) {
    const equityPct = (equityValue / totalAssets) * 100;
    const mfPct = (mfValue / totalAssets) * 100;
    if (equityPct >= 70) {
      allocationStyle = "Equity Heavy";
      allocationColor = "text-purple-400 bg-purple-950/40";
    } else if (mfPct >= 70) {
      allocationStyle = "Mutual Fund Heavy";
      allocationColor = "text-pink-400 bg-pink-950/40";
    }
  } else {
    allocationStyle = "Unallocated";
    allocationColor = "text-gray-550 bg-gray-950";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/users"
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-gray-300">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {user.full_name || "User Profile"}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mt-1">
              <span className="font-medium text-gray-300">{user.email}</span>
              <CopyButton textValue={user.email} />
              <a
                href={`mailto:${user.email}?subject=Arthavi%20Support%20-%20Portfolio%20Review&body=Hi%20${user.full_name || "User"},`}
                className="p-1 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer shadow"
                title="Send Support Email"
              >
                <Mail size={11} />
              </a>
              <span className="text-gray-600 px-1">•</span>
              <span>
                Joined{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900 p-1 rounded-lg shadow-inner">
          <button
            onClick={() => setActiveTab("overview")}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "overview"
                ? "bg-gray-800 text-white shadow"
                : "text-gray-400 hover:text-gray-200",
            )}>
            Overview
          </button>
          <button
            onClick={() => setActiveTab("holdings")}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "holdings"
                ? "bg-gray-800 text-white shadow"
                : "text-gray-400 hover:text-gray-200",
            )}>
            Holdings
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              activeTab === "chats"
                ? "bg-gray-800 text-white shadow"
                : "text-gray-400 hover:text-gray-200",
            )}>
            <MessageSquare size={14} /> AI Chats
          </button>
        </div>
      </header>

      {/* Content Area */}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              label="Total Value"
              value={`₹${user.total_value.toLocaleString()}`}
              icon={Wallet}
            />
            <StatsCard
              label="Total Invested"
              value={`₹${totalInvested.toLocaleString()}`}
              icon={Layers}
            />
            <StatsCard
              label="Total Profit"
              value={`₹${Math.abs(totalProfit).toLocaleString()}`}
              icon={TrendingUp}
              trend={isProfit ? "Profit" : "Loss"}
              trendUp={isProfit}
            />
            <StatsCard
              label="Portfolios"
              value={user.portfolio_count}
              icon={PieChart}
            />
          </div>

          {/* CRM Profile Insights */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={14} className="text-emerald-500" /> CRM Profile Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl shadow-inner">
                <div>
                  <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block">Engagement</span>
                  <span className="text-sm font-semibold text-white mt-1 block">Behavior Status</span>
                </div>
                <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase ${engagementColor}`}>
                  {engagementLevel}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl shadow-inner">
                <div>
                  <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block">Net Assets</span>
                  <span className="text-sm font-semibold text-white mt-1 block">Investor Bracket</span>
                </div>
                <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase ${investorColor}`}>
                  {investorClass}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl shadow-inner">
                <div>
                  <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block">Portfolio Mix</span>
                  <span className="text-sm font-semibold text-white mt-1 block">Allocation Strategy</span>
                </div>
                <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase ${allocationColor}`}>
                  {allocationStyle}
                </span>
              </div>
            </div>

            {(!user.notifications_enabled || portfolios.length === 0) && (
              <div className="mt-4 p-3.5 bg-amber-950/25 rounded-lg flex flex-col gap-1.5 text-xs text-amber-300">
                {!user.notifications_enabled && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>⚠️</span>
                    <span><strong>Notifications Disabled:</strong> This user will miss critical SMS/Push alerts & price refresh updates.</span>
                  </div>
                )}
                {portfolios.length === 0 && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>⚠️</span>
                    <span><strong>No Portfolios Uploaded:</strong> This is a cold/empty account. Needs CAS import guidance.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Section */}
          {activity && (
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20 flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/4 flex flex-col justify-center space-y-4 pb-6 lg:pb-0 lg:pr-6 lg:mr-6">
                <div>
                  <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2 mb-1">
                    <Activity size={16} /> Total Active Days
                  </h3>
                  <div className="text-3xl font-bold text-white">
                    {activity.total_active_days}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-400 font-medium text-sm flex items-center gap-2 mb-1">
                    <CalendarDays size={16} /> Last Seen
                  </h3>
                  <div className="text-lg font-medium text-emerald-400">
                    {activity.last_active_date || "N/A"}
                  </div>
                </div>
              </div>
              <div className="lg:w-3/4">
                <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-4">
                  Activity Timeline (Last 30 Days)
                </h3>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activityChartData}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip
                        cursor={{ fill: "#374151" }}
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#374151",
                          color: "#f3f4f6",
                          fontSize: 12,
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value) => [
                          value === 1 ? "Active" : "Inactive",
                          "Status",
                        ]}
                        labelFormatter={(_, payload) => {
                          const fullDate = payload?.[0]?.payload?.fullDate;
                          return `Date: ${fullDate || "N/A"}`;
                        }}
                      />
                      <Bar dataKey="active" radius={[2, 2, 0, 0]}>
                        {activityChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.active ? "#10b981" : "#1f2937"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col */}
            <div className="lg:col-span-2 space-y-8">
              {user.total_value > 0 && (
                <AllocationChart data={allocationData} />
              )}

              <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20">
                <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                  <Wallet size={16} /> Portfolios Breakdown
                </h3>
                <div className="space-y-4">
                  {portfolios.length > 0 ? (
                    portfolios.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedHoldingType(p.type);
                          setActiveTab("holdings");
                        }}
                        className="group cursor-pointer p-4 bg-gray-850/50 rounded-xl hover:bg-gray-805 transition-all shadow-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider group-hover:bg-gray-600`}>
                              {p.type === "MUTUAL_FUND" ? "Mutual Fund" : p.type}
                            </span>
                            {p.type === "MUTUAL_FUND" && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Are you sure you want to delete this portfolio and all its schemes/transactions? This action cannot be undone.")) {
                                    await handleDeletePortfolio(p.id);
                                  }
                                }}
                                disabled={isDeleting !== null}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded transition-colors"
                                title="Delete Portfolio"
                              >
                                {isDeleting === p.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
                          </div>
                          <span
                            className={`text-sm font-semibold ${p.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {p.profit >= 0 ? "+" : ""}₹
                            {Math.abs(p.profit).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <div className="text-xs text-gray-400 mb-1 group-hover:text-gray-300">
                              Current Value
                            </div>
                            <div className="text-2xl font-mono text-white font-bold">
                              ₹{p.current_value.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 mb-1">
                              Invested
                            </div>
                            <div className="text-sm font-mono text-gray-300">
                              ₹{p.invested_value.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {p.type === "MUTUAL_FUND" && (
                          <div className="mt-3 text-xs text-gray-400 space-y-1 pt-3">
                            <div>
                              <span className="font-semibold text-gray-500">Statement:</span>{" "}
                              {p.statement_from && p.statement_to ? `${p.statement_from} to ${p.statement_to}` : "N/A"}
                            </div>
                            <div className="flex justify-between flex-wrap gap-x-2">
                              <div>
                                <span className="font-semibold text-gray-500">Type:</span> {p.cas_type || "N/A"} ({p.file_type || "N/A"})
                              </div>
                              <div>
                                <span className="font-semibold text-gray-500">Uploaded:</span> {p.created_at || "N/A"}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-3 flex justify-end">
                          <span className="text-xs text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            View Holdings <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No portfolios found.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20">
                <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                  <History size={16} /> Recent Transactions
                </h3>
                <div className="space-y-3">
                  {recent_transactions && recent_transactions.length > 0 ? (
                    recent_transactions.map((tx: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 hover:bg-gray-800/30 transition-colors">
                        <div>
                          <div className="text-gray-200 font-medium">
                            {tx.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tx.date} • {tx.type} • {tx.asset_type}
                          </div>
                        </div>
                        <div
                          className={`font-mono font-medium ${tx.type === "BUY" ? "text-rose-400" : "text-emerald-400"}`}>
                          {tx.type === "BUY" ? "-" : "+"}₹
                          {tx.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No recent transactions found.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Predictions */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20">
                <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                  <Activity size={16} /> Market Predictions
                </h3>
                <div className="space-y-3">
                  {predictions && predictions.length > 0 ? (
                    predictions.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 hover:bg-gray-800/30 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 font-medium tracking-wide">
                              Nifty 50
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${p.prediction === "BULL" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                              {p.prediction}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Target: {p.target_date}
                          </div>
                        </div>
                        <div
                          className={`text-sm font-bold uppercase ${p.result === "WON" ? "text-emerald-400" : p.result === "LOST" ? "text-rose-400" : "text-gray-500"}`}>
                          {p.result}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No market predictions found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              {/* Family Profiles Card */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20">
                <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                  <Users size={16} className="text-emerald-400" /> Family Profiles
                </h3>
                <div className="space-y-4">
                  {profiles.length > 0 ? (
                    profiles.map((p: any) => {
                      const relationColors: Record<string, { bg: string }> = {
                        SELF: { bg: "bg-blue-900/30 text-blue-400" },
                        SPOUSE: { bg: "bg-pink-900/30 text-pink-400" },
                        MOTHER: { bg: "bg-purple-900/30 text-purple-400" },
                        FATHER: { bg: "bg-indigo-900/30 text-indigo-400" },
                        CHILD: { bg: "bg-emerald-900/30 text-emerald-400" },
                        OTHER: { bg: "bg-gray-850 text-gray-400" },
                      };
                      const typeColors: Record<string, { bg: string }> = {
                        INDIVIDUAL: { bg: "bg-amber-900/20 text-amber-400" },
                        JOINT: { bg: "bg-teal-900/20 text-teal-400" },
                        CUSTOM: { bg: "bg-violet-900/20 text-violet-400" },
                      };
                      const rel = relationColors[p.relation] || relationColors.OTHER;
                      const typ = typeColors[p.profile_type] || { bg: "bg-gray-850 text-gray-400" };

                      return (
                        <div
                          key={p.id}
                          className="p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">{p.name}</span>
                              {p.is_default && (
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${rel.bg}`}>
                              {p.relation}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${typ.bg}`}>
                              {p.profile_type}
                            </span>
                            {p.pan && (
                              <span className="text-[10px] bg-gray-800/60 text-gray-300 px-2 py-0.5 rounded font-mono">
                                PAN: {p.pan}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-850/20 text-center">
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">MFs</div>
                              <div className="text-sm font-bold font-mono text-white">{p.portfolio_count}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">Stocks</div>
                              <div className="text-sm font-bold font-mono text-white">{p.holding_count}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">Goals</div>
                              <div className="text-sm font-bold font-mono text-white">{p.goal_count}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center py-4 text-xs">No family profiles linked.</div>
                  )}
                </div>
              </div>

              {/* Top Holdings Preview */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp size={16} /> Top Holdings
                  </h3>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {top_holdings.length > 0 ? (
                    top_holdings.map((h: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 hover:bg-gray-800/30 transition-colors rounded-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold ${h.type === "EQUITY" ? "bg-indigo-900/50 text-indigo-300" : "bg-emerald-900/50 text-emerald-300"}`}>
                            {h.type === "EQUITY" ? "EQ" : "MF"}
                          </div>
                          <span
                            className="text-gray-200 font-medium truncate max-w-[120px]"
                            title={h.name}>
                            {h.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-white font-mono text-sm font-semibold">
                            ₹{h.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No holdings data.
                    </div>
                  )}
                </div>
              </div>

              {/* Chat CTA */}
              <div className="bg-indigo-950/30 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-indigo-200 font-bold">AI Chat History</h3>
                </div>
                <p className="text-sm text-indigo-300/70 mb-4">
                  View {chats.length} conversation sessions with the AI advisor.
                </p>
                <button
                  onClick={() => setActiveTab("chats")}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                  View Conversations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOLDINGS TAB */}
      {activeTab === "holdings" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter size={18} />
              <span className="text-sm font-medium">Filter Type:</span>
            </div>
            <div className="flex gap-2">
              {["ALL", "EQUITY", "MUTUAL_FUND"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedHoldingType(type as any)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors",
                    selectedHoldingType === type
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700",
                  )}>
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block bg-gray-900 rounded-xl overflow-hidden shadow-lg shadow-black/25">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Instrument</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Quantity</th>
                    <th className="px-6 py-4 text-right">Avg Price</th>
                    <th className="px-6 py-4 text-right">LTP</th>
                    <th className="px-6 py-4 text-right">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850/20">
                  {filteredHoldings.length > 0 ? (
                    filteredHoldings.map((h: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          {h.name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={clsx(
                              "px-2 py-1 rounded text-[10px] font-bold uppercase",
                              h.type === "EQUITY"
                                ? "bg-indigo-900/50 text-indigo-300"
                                : "bg-emerald-900/50 text-emerald-300",
                            )}>
                            {h.type === "EQUITY" ? "Stock" : "Mutual Fund"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {h.quantity?.toFixed(2) || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          ₹{h.avg_price?.toLocaleString() || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-gray-300">
                          ₹{h.ltp?.toLocaleString() || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white">
                          ₹{h.value.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500">
                        No holdings found for selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List for Holdings */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredHoldings.map((h: any, idx: number) => (
              <div key={idx} className="bg-gray-900 rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm leading-snug max-w-[70%]">{h.name}</h4>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                    h.type === "EQUITY"
                      ? "bg-indigo-900/50 text-indigo-300"
                      : "bg-emerald-900/50 text-emerald-300",
                  )}>
                    {h.type === "EQUITY" ? "Stock" : "Mutual Fund"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs border-t border-gray-850/20 pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Qty:</span>
                    <span className="font-mono text-gray-300">{h.quantity?.toFixed(2) || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Price:</span>
                    <span className="font-mono text-gray-300">₹{h.avg_price?.toLocaleString() || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">LTP:</span>
                    <span className="font-mono text-gray-300">₹{h.ltp?.toLocaleString() || "-"}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Value:</span>
                    <span className="font-mono text-white">₹{h.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredHoldings.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-xl shadow-inner">
                No holdings found for selected filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHATS TAB */}
      {activeTab === "chats" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ChatInbox
            initialSessions={chats.map((chat: any) => ({
              id: chat.id,
              title: chat.title || "Untitled Session",
              updated_at: chat.updated_at || "",
              preview:
                chat.messages?.[chat.messages.length - 1]?.content ||
                "No messages",
              user: {
                id: user.id,
                name: user.full_name || "Unknown User",
                email: user.email,
              },
            }))}
            initialSelectedSessionId={selectedChatId}
          />
        </div>
      )}
    </div>
  );
}
