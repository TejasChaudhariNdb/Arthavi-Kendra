"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  PieChart,
  Activity,
  History,
  Layers,
  MessageSquare,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/StatsCard";
import AllocationChart from "@/components/AllocationChart";
import { clsx } from "clsx";

export default function UserDetailClient({ data }: { data: any }) {
  const {
    user,
    portfolios,
    top_holdings,
    all_holdings,
    recent_transactions,
    chats = [],
  } = data;
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "chats">(
    "overview",
  );
  const [selectedHoldingType, setSelectedHoldingType] = useState<
    "ALL" | "EQUITY" | "MUTUAL_FUND"
  >("ALL");
  const [selectedChatId, setSelectedChatId] = useState<number | null>(
    chats?.length > 0 ? chats[0].id : null,
  );

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

  const filteredHoldings = all_holdings.filter((h: any) =>
    selectedHoldingType === "ALL" ? true : h.type === selectedHoldingType,
  );

  const activeChat = chats.find((c: any) => c.id === selectedChatId);

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
            <p className="text-gray-400">
              {user.email} • Joined{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col */}
            <div className="lg:col-span-2 space-y-8">
              {user.total_value > 0 && (
                <AllocationChart data={allocationData} />
              )}

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
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
                        className="group cursor-pointer p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider group-hover:bg-gray-600`}>
                            {p.type}
                          </span>
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
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                  <History size={16} /> Recent Transactions
                </h3>
                <div className="space-y-3">
                  {recent_transactions && recent_transactions.length > 0 ? (
                    recent_transactions.map((tx: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
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
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              {/* Top Holdings Preview */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
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
                        className="flex justify-between items-center p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors rounded-lg">
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
              <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6">
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
          <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
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

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md">
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
                <tbody className="divide-y divide-gray-800">
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
        </div>
      )}

      {/* CHATS TAB */}
      {activeTab === "chats" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Sidebar List */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 bg-gray-950">
              <h3 className="font-bold text-white">Sessions</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {chats.length > 0 ? (
                chats.map((chat: any) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      selectedChatId === chat.id
                        ? "bg-gray-800 border-gray-700 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-gray-800/50 text-gray-400",
                    )}>
                    <div className="font-medium text-sm text-gray-200 truncate">
                      {chat.title || "Untitled Session"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {chat.updated_at || "Unknown Date"}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No chat history found.
                </div>
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-400" />
                {activeChat?.title || "Chat Details"}
              </h3>
              <span className="text-xs text-gray-500">
                ID: {selectedChatId}
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              {activeChat ? (
                activeChat.messages.length > 0 ? (
                  activeChat.messages.map((msg: any, idx: number) => (
                    <div
                      key={idx}
                      className={clsx(
                        "flex flex-col gap-2 max-w-[85%]",
                        msg.role === "user"
                          ? "self-end items-end"
                          : "self-start items-start",
                      )}>
                      <div
                        className={clsx(
                          "p-4 rounded-2xl text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700",
                        )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-500 px-2">
                        {msg.created_at}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No messages in this session.
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a session to view messages.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
