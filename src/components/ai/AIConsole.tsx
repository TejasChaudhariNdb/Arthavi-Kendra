"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, RefreshCw } from "lucide-react";
import AIOverview, { AIOverviewData } from "./AIOverview";
import AIConversations, { ConvFilters } from "./AIConversations";
import { Skeleton, getJSON } from "./aiShared";

const PERIODS = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default function AIConsole() {
  const [tab, setTab] = useState<"overview" | "conversations">("overview");
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<AIOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConvFilters>({ q: "", userId: null, userLabel: null, day: null, sort: "recent" });
  const [openSessionId, setOpenSessionId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Ignore a response for a period the admin has already switched away from.
  const reqSeq = useRef(0);
  const loadOverview = useCallback(async (d: number) => {
    const seq = ++reqSeq.current;
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON<AIOverviewData>(`/admin/ai/overview?days=${d}`);
      if (seq === reqSeq.current) setOverview(data);
    } catch (e) {
      if (seq === reqSeq.current) setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (seq === reqSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview(days);
  }, [days, refreshKey, loadOverview]);

  const goConversations = useCallback((patch: Partial<ConvFilters>, sessionId: number | null = null) => {
    setFilters((f) => ({ ...f, q: "", day: null, userId: null, userLabel: null, ...patch }));
    setOpenSessionId(sessionId);
    setTab("conversations");
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Assistant</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              What people ask, how the AI answers, and what it costs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tab === "overview" && (
            <div className="flex rounded-lg border border-slate-200 dark:border-white/[0.08] overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setDays(p.days)}
                  className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    days === p.days
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            aria-label="Refresh"
            className="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="flex gap-1 border-b border-slate-200 dark:border-white/[0.08]">
        {(
          [
            ["overview", "Overview"],
            ["conversations", "Conversations"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 -mb-px text-sm font-semibold border-b-2 cursor-pointer ${
              tab === key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {label}
            {key === "conversations" && overview ? (
              <span className="ml-1.5 text-[11px] font-mono text-slate-400">{overview.lifetime.sessions}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : !overview ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-72" />
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <AIOverview
              data={overview}
              onPickUser={(id, label) => goConversations({ userId: id, userLabel: label })}
              onPickDay={(day) => goConversations({ day })}
              onOpenSession={(id) => goConversations({}, id)}
            />
          </div>
        )
      ) : (
        <AIConversations
          key={refreshKey}
          filters={filters}
          setFilters={setFilters}
          openSessionId={openSessionId}
          setOpenSessionId={setOpenSessionId}
        />
      )}
    </div>
  );
}
