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
  UserCheck,
  UserX,
  Bell,
  Sliders,
  AlertTriangle,
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
      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-emerald-500 font-bold" /> : <Copy size={11} />}
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
    portfolios = [],
    top_holdings = [],
    all_holdings = [],
    recent_transactions = [],
    chats = [],
    predictions = [],
    profiles = [],
    notification_preferences = {},
  } = data;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "chats">(
    initialTab,
  );
  const [selectedHoldingType, setSelectedHoldingType] = useState<
    "ALL" | "EQUITY" | "MUTUAL_FUND"
  >("ALL");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [prefs, setPrefs] = useState<any>(notification_preferences);
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState<string | null>(null);

  const handleUpdatePreference = async (patch: any) => {
    setIsUpdatingPrefs(true);
    setPrefsSuccess(null);
    try {
      const { updateUserNotificationPreferencesClient } = await import("@/lib/auth-client");
      const updated = await updateUserNotificationPreferencesClient(user.id, patch);
      setPrefs(updated);
      setPrefsSuccess("Saved successfully!");
      setTimeout(() => setPrefsSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to update notification preferences");
    } finally {
      setIsUpdatingPrefs(false);
    }
  };

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
    .reduce((acc: number, p: any) => acc + (p.current_value || 0), 0);
  const mfValue = portfolios
    .filter((p: any) => p.type === "MUTUAL_FUND")
    .reduce((acc: number, p: any) => acc + (p.current_value || 0), 0);

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
  let engagementBadgeClass = "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-white/[0.06]";
  if (activity?.total_active_days >= 12) {
    engagementLevel = "Power User";
    engagementBadgeClass = "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/15";
  } else if (activity?.total_active_days >= 3) {
    engagementLevel = "Casual User";
    engagementBadgeClass = "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/15";
  } else if (daysSinceActive >= 5 || activity?.total_active_days < 3) {
    engagementLevel = "Churn Risk";
    engagementBadgeClass = "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/15";
  }

  let investorClass = "No Investments";
  let investorBadgeClass = "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-white/[0.05]";
  if (user.total_value >= 1000000) {
    investorClass = "Whale (₹10L+)";
    investorBadgeClass = "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/15";
  } else if (user.total_value >= 100000) {
    investorClass = "Mid-Tier (₹1L-10L)";
    investorBadgeClass = "text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-500/15";
  } else if (user.total_value > 0) {
    investorClass = "Starter (<₹1L)";
    investorBadgeClass = "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/15";
  }

  const totalAssets = equityValue + mfValue;
  let allocationStyle = "Balanced";
  let allocationBadgeClass = "text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-500/15";
  if (totalAssets > 0) {
    const equityPct = (equityValue / totalAssets) * 100;
    const mfPct = (mfValue / totalAssets) * 100;
    if (equityPct >= 70) {
      allocationStyle = "Equity Heavy";
      allocationBadgeClass = "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/15";
    } else if (mfPct >= 70) {
      allocationStyle = "Mutual Fund Heavy";
      allocationBadgeClass = "text-pink-700 bg-pink-50 dark:text-pink-300 dark:bg-pink-500/15";
    }
  } else {
    allocationStyle = "Unallocated";
    allocationBadgeClass = "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-white/[0.05]";
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] p-5 rounded-2xl shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <Link
            href="/users"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] rounded-xl transition-colors text-slate-600 dark:text-slate-300">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user.full_name || "User Profile"}
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                ID #{user.id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-medium font-mono text-slate-700 dark:text-slate-300">{user.email}</span>
              <CopyButton textValue={user.email} />
              <a
                href={`mailto:${user.email}?subject=Arthavi%20Support%20-%20Portfolio%20Review&body=Hi%20${user.full_name || "User"},`}
                className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 rounded transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
                title="Send Support Email"
              >
                <Mail size={12} />
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                Joined{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] self-start md:self-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === "overview"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}>
            Overview
          </button>
          <button
            onClick={() => setActiveTab("holdings")}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === "holdings"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}>
            Holdings & Portfolios
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "chats"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}>
            <MessageSquare size={13} /> AI Chats ({chats.length})
          </button>
        </div>
      </header>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Total Value"
              value={`₹${(user.total_value || 0).toLocaleString("en-IN")}`}
              icon={Wallet}
            />
            <StatsCard
              label="Total Invested"
              value={`₹${totalInvested.toLocaleString("en-IN")}`}
              icon={Layers}
            />
            <StatsCard
              label="Total Return"
              value={`₹${Math.abs(totalProfit).toLocaleString("en-IN")}`}
              icon={TrendingUp}
              trend={isProfit ? "Profit" : "Loss"}
              trendUp={isProfit}
            />
            <StatsCard
              label="Portfolios Linked"
              value={user.portfolio_count}
              icon={PieChart}
            />
          </div>

          {/* CRM Profile Insights */}
          <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Users size={15} className="text-indigo-600 dark:text-indigo-400" />
                CRM Profile Insights
              </h3>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Segment Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Engagement</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white mt-1 block">Behavior Status</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${engagementBadgeClass}`}>
                  {engagementLevel}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Assets</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white mt-1 block">Investor Bracket</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${investorBadgeClass}`}>
                  {investorClass}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Portfolio Mix</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white mt-1 block">Allocation Strategy</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${allocationBadgeClass}`}>
                  {allocationStyle}
                </span>
              </div>
            </div>

            {(!user.notifications_enabled || portfolios.length === 0) && (
              <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex flex-col gap-2 text-xs text-amber-800 dark:text-amber-300">
                {!user.notifications_enabled && (
                  <div className="flex items-start gap-2 font-medium">
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Notifications Disabled:</strong> User is not receiving push notifications or price alerts.</span>
                  </div>
                )}
                {portfolios.length === 0 && (
                  <div className="flex items-start gap-2 font-medium">
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>No Portfolios Uploaded:</strong> This account has no linked investment holdings.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Section */}
          {activity && (
            <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs flex flex-col lg:flex-row gap-6 transition-colors">
              <div className="lg:w-1/4 flex flex-col justify-center space-y-4 pb-6 lg:pb-0 lg:pr-6 lg:border-r border-slate-200/80 dark:border-white/[0.08]">
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1">
                    <Activity size={14} className="text-indigo-600 dark:text-indigo-400" /> Total Active Days
                  </h3>
                  <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                    {activity.total_active_days ?? 0}
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1">
                    <CalendarDays size={14} className="text-emerald-600 dark:text-emerald-400" /> Last Seen
                  </h3>
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {activity.last_active_date || "Never / Unknown"}
                  </div>
                </div>
              </div>
              <div className="lg:w-3/4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                    Activity Timeline (Last 30 Days)
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Green = User Active on Day
                  </span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activityChartData}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip
                        cursor={{ fill: "currentColor", className: "text-slate-200/50 dark:text-white/[0.05]" }}
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          color: "#f8fafc",
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
                            fill={entry.active ? "#10b981" : "currentColor"}
                            className={entry.active ? "" : "text-slate-200 dark:text-white/[0.06]"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col (2 cols wide) */}
            <div className="lg:col-span-2 space-y-6">
              {user.total_value > 0 && (
                <AllocationChart data={allocationData} />
              )}

              {/* Portfolios Breakdown */}
              <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <Wallet size={15} className="text-indigo-600 dark:text-indigo-400" /> Portfolios Breakdown ({portfolios.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View All Holdings →
                  </button>
                </div>

                <div className="space-y-3">
                  {portfolios.length > 0 ? (
                    portfolios.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedHoldingType(p.type);
                          setActiveTab("holdings");
                        }}
                        className="group cursor-pointer p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={clsx(
                                "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                                p.type === "MUTUAL_FUND"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
                              )}>
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
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
                                title="Delete Portfolio"
                              >
                                {isDeleting === p.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            )}
                          </div>
                          <span
                            className={`text-xs font-semibold font-mono ${p.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {p.profit >= 0 ? "+" : ""}₹
                            {Math.abs(p.profit || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mt-3">
                          <div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                              Current Value
                            </div>
                            <div className="text-xl font-mono text-slate-900 dark:text-white font-bold">
                              ₹{(p.current_value || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                              Invested
                            </div>
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 font-medium">
                              ₹{(p.invested_value || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                        {p.type === "MUTUAL_FUND" && (
                          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2.5 border-t border-slate-200/60 dark:border-white/[0.05]">
                            <div>
                              <span className="font-semibold text-slate-600 dark:text-slate-300">Statement:</span>{" "}
                              {p.statement_from && p.statement_to ? `${p.statement_from} to ${p.statement_to}` : "N/A"}
                            </div>
                            <div className="flex justify-between flex-wrap gap-x-2">
                              <div>
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Type:</span> {p.cas_type || "N/A"} ({p.file_type || "N/A"})
                              </div>
                              <div>
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Uploaded:</span> {p.created_at || "N/A"}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-2.5 flex justify-end">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Drilldown <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-6 text-xs">
                      No portfolios linked to this account.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <History size={15} className="text-indigo-600 dark:text-indigo-400" /> Recent Transactions
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Latest Activity
                  </span>
                </div>

                <div className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                  {recent_transactions && recent_transactions.length > 0 ? (
                    recent_transactions.map((tx: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium text-xs">
                            {tx.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {tx.date} • <span className="font-semibold uppercase">{tx.type}</span> • {tx.asset_type}
                          </div>
                        </div>
                        <div
                          className={`font-mono text-xs font-semibold ${tx.type === "BUY" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {tx.type === "BUY" ? "-" : "+"}₹
                          {Number(tx.amount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-6 text-xs">
                      No recent transactions recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Market Predictions */}
              <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <Activity size={15} className="text-indigo-600 dark:text-indigo-400" /> Market Predictions
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Nifty Forecasts
                  </span>
                </div>

                <div className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                  {predictions && predictions.length > 0 ? (
                    predictions.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-medium text-xs">
                              Nifty 50
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${p.prediction === "BULL" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"}`}>
                              {p.prediction}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                            Target: {p.target_date}
                          </div>
                        </div>
                        <div
                          className={`text-xs font-bold uppercase ${p.result === "WON" ? "text-emerald-600 dark:text-emerald-400" : p.result === "LOST" ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`}>
                          {p.result}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-6 text-xs">
                      No market predictions recorded for this user.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col (1 col wide) */}
            <div className="space-y-6">
              {/* Family Profiles Card */}
              <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <Users size={15} className="text-indigo-600 dark:text-indigo-400" /> Family Profiles ({profiles.length})
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Linked</span>
                </div>

                <div className="space-y-3">
                  {profiles.length > 0 ? (
                    profiles.map((p: any) => {
                      const relationColors: Record<string, string> = {
                        SELF: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
                        SPOUSE: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
                        MOTHER: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
                        FATHER: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
                        CHILD: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                        OTHER: "bg-slate-100 text-slate-600 dark:bg-white/[0.05] dark:text-slate-300",
                      };
                      const relClass = relationColors[p.relation] || relationColors.OTHER;

                      return (
                        <div
                          key={p.id}
                          className="p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] rounded-xl shadow-xs space-y-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-900 dark:text-white font-semibold text-xs">{p.name}</span>
                              {p.is_default && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${relClass}`}>
                              {p.relation}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[9px] bg-slate-200/60 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase">
                              {p.profile_type}
                            </span>
                            {p.pan && (
                              <span className="text-[9px] bg-slate-200/60 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                PAN: {p.pan}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-center">
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-semibold">MFs</div>
                              <div className="text-xs font-bold font-mono text-slate-800 dark:text-white">{p.portfolio_count}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-semibold">Stocks</div>
                              <div className="text-xs font-bold font-mono text-slate-800 dark:text-white">{p.holding_count}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-semibold">Goals</div>
                              <div className="text-xs font-bold font-mono text-slate-800 dark:text-white">{p.goal_count}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-6 text-xs">No family profiles linked.</div>
                  )}
                </div>
              </div>

              {/* Mailing List & Notifications Settings Card */}
              <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <Bell size={15} className="text-indigo-600 dark:text-indigo-400" /> Notifications & Mailing
                  </h3>
                  {prefs?.unsubscribed_all_marketing ? (
                    <span className="text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <UserX size={10} /> Opted Out
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <UserCheck size={10} /> Active
                    </span>
                  )}
                </div>

                {prefsSuccess && (
                  <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
                    <span>{prefsSuccess}</span>
                  </div>
                )}

                {prefs?.is_bounced && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        ⚠️ SES Email Bounced
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Unblock ${user.email} and clear bounce flag? Only do this if the user confirmed their email is valid.`)) {
                            handleUpdatePreference({ is_bounced: false });
                          }
                        }}
                        disabled={isUpdatingPrefs}
                        className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold uppercase transition"
                      >
                        Reset Bounce
                      </button>
                    </div>
                    <p className="text-amber-700/80 dark:text-amber-300/80 text-[11px]">
                      {prefs.bounce_diagnostic || "Mailbox unavailable or invalid address"}
                    </p>
                  </div>
                )}

                {prefs?.unsubscribed_all_marketing && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <p className="font-semibold text-rose-700 dark:text-rose-400">Marketing Emails Suppressed</p>
                    {prefs.unsubscribed_at && (
                      <p className="text-rose-600/80 dark:text-rose-300/80 text-[11px]">Date: {prefs.unsubscribed_at}</p>
                    )}
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="space-y-3 mb-5">
                  {prefs?.unsubscribed_all_marketing ? (
                    <button
                      onClick={() =>
                        handleUpdatePreference({
                          unsubscribed_all_marketing: false,
                          email_daily_nudge: true,
                          email_weekly_summary: true,
                          email_product_updates: true,
                          email_marketing: true,
                        })
                      }
                      disabled={isUpdatingPrefs}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <UserCheck size={13} /> Re-Subscribe to Marketing
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm(`Suppress all marketing emails for ${user.email}? This will record user opt-out immediately.`)) {
                          handleUpdatePreference({
                            unsubscribed_all_marketing: true,
                            unsubscribe_reason: "Admin suppression via dashboard",
                          });
                        }
                      }}
                      disabled={isUpdatingPrefs}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      <UserX size={13} /> Unsubscribe User (Suppress)
                    </button>
                  )}

                  {prefs?.unsubscribe_token && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs">
                      <div className="truncate mr-2">
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">Unsubscribe Link</span>
                        <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px] truncate block">
                          /unsubscribe?token={prefs.unsubscribe_token.slice(0, 10)}...
                        </span>
                      </div>
                      <CopyButton textValue={`https://arthavi.com/unsubscribe?token=${prefs.unsubscribe_token}`} />
                    </div>
                  )}
                </div>

                {/* Granular Toggles */}
                <div className="space-y-2.5 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Preferences Channels</span>
                    <Sliders size={12} />
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer text-xs">
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">Daily Portfolio Nudge</div>
                      <div className="text-[10px] text-slate-400">Daily 7:30 PM portfolio digest</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!prefs?.email_daily_nudge}
                      onChange={(e) => handleUpdatePreference({ email_daily_nudge: e.target.checked })}
                      disabled={isUpdatingPrefs || prefs?.unsubscribed_all_marketing}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer text-xs">
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">Weekly Wealth Digest</div>
                      <div className="text-[10px] text-slate-400">Weekly Sunday morning performance</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!prefs?.email_weekly_summary}
                      onChange={(e) => handleUpdatePreference({ email_weekly_summary: e.target.checked })}
                      disabled={isUpdatingPrefs || prefs?.unsubscribed_all_marketing}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer text-xs">
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">Product Releases</div>
                      <div className="text-[10px] text-slate-400">Feature updates and improvements</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!prefs?.email_product_updates}
                      onChange={(e) => handleUpdatePreference({ email_product_updates: e.target.checked })}
                      disabled={isUpdatingPrefs || prefs?.unsubscribed_all_marketing}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer text-xs">
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">CAS Statement Reports</div>
                      <div className="text-[10px] text-slate-400">Monthly upload reminders</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!prefs?.email_cas_reports}
                      onChange={(e) => handleUpdatePreference({ email_cas_reports: e.target.checked })}
                      disabled={isUpdatingPrefs}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer text-xs">
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">Security Alerts</div>
                      <div className="text-[10px] text-slate-400">New login & security alerts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!prefs?.email_security_alerts}
                      onChange={(e) => handleUpdatePreference({ email_security_alerts: e.target.checked })}
                      disabled={isUpdatingPrefs}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                  </label>
                </div>
              </div>

              {/* Top Holdings Preview */}
              <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={15} className="text-indigo-600 dark:text-indigo-400" /> Top Holdings
                  </h3>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    View All ({top_holdings.length})
                  </button>
                </div>
                <div className="space-y-2">
                  {top_holdings.length > 0 ? (
                    top_holdings.map((h: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors rounded-lg">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div
                            className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold ${h.type === "EQUITY" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"}`}>
                            {h.type === "EQUITY" ? "EQ" : "MF"}
                          </div>
                          <span
                            className="text-slate-800 dark:text-slate-200 font-medium text-xs truncate max-w-[130px]"
                            title={h.name}>
                            {h.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-slate-900 dark:text-white font-mono text-xs font-semibold">
                            ₹{Number(h.value || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-4 text-xs">
                      No holdings data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOLDINGS TAB */}
      {activeTab === "holdings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-[#0d121f] p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Filter size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Asset Filter:</span>
            </div>
            <div className="flex gap-1.5">
              {(["ALL", "EQUITY", "MUTUAL_FUND"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedHoldingType(type)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
                    selectedHoldingType === type
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08]",
                  )}>
                  {type === "MUTUAL_FUND" ? "Mutual Funds" : type === "EQUITY" ? "Equities" : "All Assets"}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Data Grid */}
          <div className="hidden md:block bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-6 py-3.5">Instrument</th>
                    <th className="px-6 py-3.5">Asset Type</th>
                    <th className="px-6 py-3.5 text-right">Quantity</th>
                    <th className="px-6 py-3.5 text-right">Avg Buy Price</th>
                    <th className="px-6 py-3.5 text-right">Current LTP</th>
                    <th className="px-6 py-3.5 text-right">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                  {filteredHoldings.length > 0 ? (
                    filteredHoldings.map((h: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">
                          {h.name}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              h.type === "EQUITY"
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                            )}>
                            {h.type === "EQUITY" ? "Stock" : "Mutual Fund"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                          {h.quantity !== undefined && h.quantity !== null ? Number(h.quantity).toFixed(2) : "-"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                          {h.avg_price ? `₹${Number(h.avg_price).toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                          {h.ltp ? `₹${Number(h.ltp).toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{Number(h.value || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                        No holdings found for selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredHoldings.map((h: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">{h.name}</h4>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0",
                    h.type === "EQUITY"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                  )}>
                    {h.type === "EQUITY" ? "Stock" : "MF"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] border-t border-slate-200/60 dark:border-white/[0.05] pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qty:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{h.quantity ? Number(h.quantity).toFixed(2) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Price:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">₹{h.avg_price ? Number(h.avg_price).toLocaleString("en-IN") : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">LTP:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">₹{h.ltp ? Number(h.ltp).toLocaleString("en-IN") : "-"}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Current:</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">₹{Number(h.value || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredHoldings.length === 0 && (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs">
                No holdings found for selected filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHATS TAB */}
      {activeTab === "chats" && (
        <div>
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
