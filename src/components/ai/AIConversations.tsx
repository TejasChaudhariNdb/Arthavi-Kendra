"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Bot, ExternalLink, MessageSquare, RotateCcw, Search, User as UserIcon, Wrench, X } from "lucide-react";
import { CARD, Markdown, Skeleton, fmtDateTime, fmtMs, fmtNum, fmtTime, fmtUsd, getJSON, shortModel, timeAgo, userLabel } from "./aiShared";

export interface ConvFilters {
  q: string;
  userId: number | null;
  userLabel: string | null;
  day: string | null;
  sort: "recent" | "messages";
}

interface SessionItem {
  id: number;
  title: string;
  first_question: string;
  user: { id: number; name: string | null; email: string | null };
  questions: number;
  messages: number;
  started_at: string | null;
  last_at: string | null;
  cost_usd: number | null;
  errors: number;
  fallbacks: number;
}

interface Meta {
  status: string;
  model: string | null;
  models_used: string[];
  fallback: boolean;
  model_calls: number;
  tools: string[];
  prompt_tokens: number;
  completion_tokens: number;
  reasoning_tokens: number;
  cost_usd: number | null;
  latency_ms: number | null;
  error: string | null;
  at: string | null;
}

interface SessionDetail {
  session: { id: number; title: string; created_at: string | null };
  user: {
    id: number;
    name: string | null;
    email: string | null;
    joined_at: string | null;
    ai_questions: number;
    ai_sessions: number;
    first_ai_chat_at: string | null;
  };
  logs_available: boolean;
  totals: { cost_usd: number | null; prompt_tokens: number; completion_tokens: number; requests: number };
  messages: { id: number; role: string; content: string; at: string | null; meta: Meta | null }[];
  events: Meta[];
}

const PAGE = 30;
const TOOL_LABELS: Record<string, string> = { get_portfolio_data: "portfolio", web_search: "web search" };

function MetaLine({ meta }: { meta: Meta }) {
  const tools = [...new Set(meta.tools)].map((t) => TOOL_LABELS[t] || t);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
      <span className="text-slate-500 dark:text-slate-400">{shortModel(meta.model)}</span>
      {meta.fallback && (
        <span className="px-1.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-sans font-semibold">
          backup model
        </span>
      )}
      <span>· {fmtMs(meta.latency_ms)}</span>
      <span title={`${meta.prompt_tokens} in / ${meta.completion_tokens} out (${meta.reasoning_tokens} reasoning)`}>
        · {fmtNum(meta.prompt_tokens)} in / {fmtNum(meta.completion_tokens)} out
      </span>
      <span>· {fmtUsd(meta.cost_usd)}</span>
      {tools.length > 0 && (
        <span className="flex items-center gap-1">
          · <Wrench size={10} /> {tools.join(", ")}
        </span>
      )}
    </div>
  );
}

export default function AIConversations({
  filters,
  setFilters,
  openSessionId,
  setOpenSessionId,
}: {
  filters: ConvFilters;
  setFilters: (f: ConvFilters) => void;
  openSessionId: number | null;
  setOpenSessionId: (id: number | null) => void;
}) {
  const [searchText, setSearchText] = useState(filters.q);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const seq = useRef(0);
  const sentinel = useRef<HTMLDivElement | null>(null);

  // Debounce typing into the search filter.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchText !== filters.q) setFilters({ ...filters, q: searchText });
    }, 350);
    return () => clearTimeout(t);
  }, [searchText, filters, setFilters]);

  const query = useCallback(
    (skip: number) => {
      const p = new URLSearchParams({ skip: String(skip), limit: String(PAGE), sort: filters.sort });
      if (filters.q.trim()) p.set("q", filters.q.trim());
      if (filters.userId) p.set("user_id", String(filters.userId));
      if (filters.day) p.set("day", filters.day);
      return getJSON<{ items: SessionItem[]; total: number; has_more: boolean }>(`/admin/ai/sessions?${p}`);
    },
    [filters]
  );

  useEffect(() => {
    const s = ++seq.current;
    setLoading(true);
    setError(null);
    query(0)
      .then((r) => {
        if (s !== seq.current) return;
        setItems(r.items);
        setTotal(r.total);
        setHasMore(r.has_more);
      })
      .catch((e) => s === seq.current && setError(e.message))
      .finally(() => s === seq.current && setLoading(false));
  }, [query]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const s = seq.current;
    setLoadingMore(true);
    try {
      const r = await query(items.length);
      if (s !== seq.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...r.items.filter((p) => !seen.has(p.id))];
      });
      setTotal(r.total);
      setHasMore(r.has_more);
    } finally {
      setLoadingMore(false);
    }
  }, [query, items.length, loading, loadingMore, hasMore]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && loadMore(), { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    if (!openSessionId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getJSON<SessionDetail>(`/admin/ai/sessions/${openSessionId}`)
      .then((d) => !cancelled && setDetail(d))
      .catch(() => !cancelled && setDetail(null))
      .finally(() => !cancelled && setDetailLoading(false));
    return () => {
      cancelled = true;
    };
  }, [openSessionId]);

  // Messages and failed requests, in time order.
  const timeline = useMemo(() => {
    if (!detail) return [];
    const rows: ({ kind: "msg"; m: SessionDetail["messages"][number] } | { kind: "event"; e: Meta })[] = [
      ...detail.messages.map((m) => ({ kind: "msg" as const, m })),
      ...detail.events.map((e) => ({ kind: "event" as const, e })),
    ];
    const at = (r: (typeof rows)[number]) => new Date((r.kind === "msg" ? r.m.at : r.e.at) || 0).getTime();
    return rows.sort((a, b) => at(a) - at(b));
  }, [detail]);

  const chips = [
    filters.userId && { key: "user", label: `User: ${filters.userLabel || filters.userId}`, clear: { userId: null, userLabel: null } },
    filters.day && {
      key: "day",
      label: `Day: ${new Date(`${filters.day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
      clear: { day: null },
    },
  ].filter(Boolean) as { key: string; label: string; clear: Partial<ConvFilters> }[];

  const list = (
    <div className={`${CARD} flex flex-col min-h-0 lg:h-[calc(100vh-220px)]`}>
      <div className="p-3 border-b border-slate-100 dark:border-white/[0.06] space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search questions, answers, users…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilters({ ...filters, ...c.clear })}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-medium"
            >
              {c.label} <X size={12} />
            </button>
          ))}
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value as ConvFilters["sort"] })}
            className="ml-auto text-xs bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="recent">Latest first</option>
            <option value="messages">Most questions</option>
          </select>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{loading ? "Loading…" : `${total} conversations`}</p>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && items.length === 0 ? (
          <div className="p-3 space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <p className="p-4 text-sm text-rose-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-center text-slate-500">No conversations match.</p>
        ) : (
          <ul>
            {items.map((s) => {
              const active = s.id === openSessionId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setOpenSessionId(s.id)}
                    className={`w-full text-left px-3.5 py-3 border-b border-slate-100 dark:border-white/[0.04] transition-colors ${
                      active ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userLabel(s.user)}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(s.last_at)}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2 break-words">
                      {s.first_question || s.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        {s.questions} {s.questions === 1 ? "question" : "questions"}
                      </span>
                      {s.cost_usd !== null && <span>· {fmtUsd(s.cost_usd)}</span>}
                      {s.errors > 0 && (
                        <span className="px-1.5 rounded bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold">
                          {s.errors} failed
                        </span>
                      )}
                      {s.fallbacks > 0 && (
                        <span className="px-1.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                          backup ×{s.fallbacks}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={sentinel} />
        {hasMore && (
          <div className="p-3 text-center">
            <button onClick={loadMore} disabled={loadingMore} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 disabled:opacity-60">
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const transcript = (
    <div className={`${CARD} flex flex-col min-h-[60vh] lg:h-[calc(100vh-220px)]`}>
      {!openSessionId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 dark:text-slate-400">
          <MessageSquare size={28} className="mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm">Pick a conversation to read it.</p>
        </div>
      ) : detailLoading && !detail ? (
        <div className="p-4 space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !detail ? (
        <p className="p-6 text-sm text-rose-600">Couldn&apos;t load this conversation.</p>
      ) : (
        <>
          <div className="p-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-start gap-2">
              <button
                onClick={() => setOpenSessionId(null)}
                className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500"
                aria-label="Back to list"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{userLabel(detail.user)}</h3>
                {detail.user.name && <p className="text-xs text-slate-500 truncate">{detail.user.email}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    setFilters({ ...filters, userId: detail.user.id, userLabel: userLabel(detail.user), day: null, q: "" })
                  }
                  className="hidden sm:inline-flex text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold"
                >
                  All their chats
                </button>
                <Link
                  href={`/users/${detail.user.id}`}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <ExternalLink size={12} /> User
                </Link>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Joined {fmtDateTime(detail.user.joined_at)} · {detail.user.ai_questions} AI{" "}
              {detail.user.ai_questions === 1 ? "question" : "questions"} in {detail.user.ai_sessions}{" "}
              {detail.user.ai_sessions === 1 ? "chat" : "chats"} overall
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>This chat: started {fmtDateTime(detail.messages[0]?.at || detail.session.created_at)}</span>
              <span>· {detail.messages.filter((m) => m.role === "user").length} questions</span>
              {detail.logs_available && (
                <>
                  <span>· cost {fmtUsd(detail.totals.cost_usd)}</span>
                  <span>
                    · {fmtNum(detail.totals.prompt_tokens)} in / {fmtNum(detail.totals.completion_tokens)} out tokens
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {timeline.map((row, i) => {
              if (row.kind === "event") {
                const e = row.e;
                return (
                  <div key={`e${i}`} className="flex items-start gap-2 text-xs rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-2.5 text-rose-700 dark:text-rose-300">
                    {e.status === "rate_limited" ? <RotateCcw size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <b>{e.status === "rate_limited" ? "Hit the 15-chat limit" : "Answer failed"}</b> · {fmtTime(e.at)}
                      {e.error && <p className="break-words mt-0.5">{e.error}</p>}
                      {e.model_calls > 0 && (
                        <p className="font-mono text-[10px] mt-0.5 opacity-80">
                          tried {e.models_used.map(shortModel).join(" → ")} · {fmtMs(e.latency_ms)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              const m = row.m;
              const mine = m.role === "user";
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${
                      mine ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {mine ? <UserIcon size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`min-w-0 max-w-[88%] md:max-w-[80%] ${mine ? "items-end" : ""} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 ${
                        mine
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 rounded-tl-sm"
                      }`}
                    >
                      {mine ? (
                        <p className="text-[13px] whitespace-pre-wrap break-words">{m.content}</p>
                      ) : (
                        <Markdown>{m.content}</Markdown>
                      )}
                    </div>
                    <span className={`text-[10px] text-slate-400 mt-1 ${mine ? "text-right" : ""}`}>{fmtTime(m.at)}</span>
                    {!mine && m.meta && <MetaLine meta={m.meta} />}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
      {/* On small screens show either the list or the open conversation. */}
      <div className={openSessionId ? "hidden lg:block" : ""}>{list}</div>
      <div className={openSessionId ? "" : "hidden lg:block"}>{transcript}</div>
    </div>
  );
}
