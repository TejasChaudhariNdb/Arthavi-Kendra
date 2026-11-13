"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ThumbsDown, Wrench, Cpu } from "lucide-react";
import { CARD, Delta, fmtDateTime, fmtMs, fmtNum, fmtUsd, shortModel, timeAgo, userLabel } from "./aiShared";

export interface AIOverviewData {
  period: { days: number; from: string; to: string };
  logs_available: boolean;
  usage: {
    questions: number;
    answers: number;
    sessions: number;
    users: number;
    new_ai_users: number;
    questions_change_pct: number | null;
    sessions_change_pct: number | null;
    users_change_pct: number | null;
    avg_questions_per_session: number;
    avg_questions_per_user: number;
  };
  lifetime: { questions: number; sessions: number; users: number; adoption_pct: number };
  feedback: {
    thumbs_up: number;
    thumbs_down: number;
    recent_thumbs_down: { id: number; title: string; body: string; at: string; user_id: number; user: string | null }[];
  };
  daily: { date: string; questions: number; users: number; sessions: number; cost_usd: number | null; errors: number | null }[];
  hourly: { hour: number; questions: number }[];
  top_users: {
    user_id: number;
    name: string | null;
    email: string | null;
    questions: number;
    sessions: number;
    last_at: string | null;
    cost_usd: number | null;
  }[];
  health: null | {
    requests: number;
    answered: number;
    ok: number;
    fallback: number;
    errors: number;
    rate_limited: number;
    rate_limited_users: number;
    fallback_rate_pct: number;
    error_rate_pct: number;
    avg_latency_ms: number | null;
    p90_latency_ms: number | null;
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens: number;
    cost_usd: number | null;
    cost_per_answer_usd: number | null;
    models: { model: string; requests: number; cost_usd: number | null; avg_latency_ms: number | null }[];
    tools: { tool: string; requests: number }[];
    recent_errors: { at: string; user_id: number; user: string | null; session_id: number | null; model: string | null; error: string | null }[];
  };
}

const TOOL_LABELS: Record<string, string> = {
  get_portfolio_data: "Portfolio data",
  web_search: "Web search",
};

function Kpi({ label, value, sub, warn }: { label: string; value: React.ReactNode; sub?: React.ReactNode; warn?: boolean }) {
  return (
    <div className={`${CARD} p-3.5 flex flex-col gap-1 min-w-0 ${warn ? "ring-1 ring-rose-300 dark:ring-rose-500/30" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide leading-tight text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{value}</span>
      {sub && <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{sub}</div>}
    </div>
  );
}

export default function AIOverview({
  data,
  onPickUser,
  onPickDay,
  onOpenSession,
}: {
  data: AIOverviewData;
  onPickUser: (id: number, label: string) => void;
  onPickDay: (date: string) => void;
  onOpenSession: (id: number) => void;
}) {
  const u = data.usage;
  const h = data.health;
  const fb = data.feedback;
  const rated = fb.thumbs_up + fb.thumbs_down;
  const satisfaction = rated ? Math.round((100 * fb.thumbs_up) / rated) : null;
  const daily = data.daily.map((d) => ({
    ...d,
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));
  const busiestHour = [...data.hourly].sort((a, b) => b.questions - a.questions)[0];
  const modelTotal = h?.models.reduce((s, m) => s + m.requests, 0) || 0;

  return (
    <div className="flex flex-col gap-5">
      {!data.logs_available && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          <strong>AI health tracking is off.</strong> Run <code className="font-mono text-xs">migration_ai_request_logs.sql</code> on
          the database to see cost, reply time, models, tools and errors for every answer. Usage below works without it.
        </div>
      )}

      {/* Usage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Questions asked" value={fmtNum(u.questions)} sub={<Delta pct={u.questions_change_pct} />} />
        <Kpi
          label="People using AI"
          value={u.users}
          sub={
            <>
              <Delta pct={u.users_change_pct} /> · {u.new_ai_users} first-time
            </>
          }
        />
        <Kpi label="Conversations" value={u.sessions} sub={`${u.avg_questions_per_session} questions each on avg`} />
        <Kpi
          label="👍 / 👎 ratings"
          value={
            <span>
              {fb.thumbs_up}
              <span className="text-slate-400"> / </span>
              <span className={fb.thumbs_down ? "text-rose-600 dark:text-rose-400" : ""}>{fb.thumbs_down}</span>
            </span>
          }
          sub={satisfaction !== null ? `${satisfaction}% positive` : "no ratings yet"}
        />
      </div>

      {/* AI health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi
          label="AI cost"
          value={h ? fmtUsd(h.cost_usd) : "—"}
          sub={h ? `${fmtUsd(h.cost_per_answer_usd)} per answer · ${fmtNum(h.prompt_tokens + h.completion_tokens)} tokens` : "needs tracking"}
        />
        <Kpi
          label="Reply time"
          value={h ? fmtMs(h.avg_latency_ms) : "—"}
          sub={h ? `average · 90% within ${fmtMs(h.p90_latency_ms)}` : "needs tracking"}
        />
        <Kpi
          label="Backup model used"
          value={h ? `${h.fallback_rate_pct}%` : "—"}
          sub={h ? `${h.fallback} of ${h.answered} answers went to the backup` : "needs tracking"}
          warn={!!h && h.fallback_rate_pct >= 10}
        />
        <Kpi
          label="Failed answers"
          value={h ? h.errors : "—"}
          sub={
            h
              ? `${h.error_rate_pct}% failed · ${h.rate_limited_users} ${h.rate_limited_users === 1 ? "user" : "users"} hit the limit`
              : "needs tracking"
          }
          warn={!!h && h.error_rate_pct >= 5}
        />
      </div>

      {/* Daily chart */}
      <div className={`${CARD} p-5`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Questions per day</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click a day to see its conversations.</p>
          </div>
          <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Questions</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-500" /> People</span>
          </div>
        </div>
        <div className="h-60 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" vertical={false} />
              <XAxis dataKey="label" stroke="currentColor" className="text-slate-400" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={12} />
              <YAxis stroke="currentColor" className="text-slate-400" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as (typeof daily)[number];
                  return (
                    <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl text-xs text-white space-y-0.5 shadow-2xl">
                      <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800">{d.label}</p>
                      <p>Questions: <b className="font-mono">{d.questions}</b></p>
                      <p>People: <b className="font-mono">{d.users}</b> · Conversations: <b className="font-mono">{d.sessions}</b></p>
                      {d.cost_usd !== null && <p>Cost: <b className="font-mono">{fmtUsd(d.cost_usd)}</b></p>}
                      {!!d.errors && <p className="text-rose-400">Failed: <b className="font-mono">{d.errors}</b></p>}
                      <p className="text-slate-400 pt-1">Click to open conversations</p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="questions"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                cursor="pointer"
                onClick={(_: unknown, index: number) => daily[index] && onPickDay(daily[index].date)}
              />
              <Line dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hour of day */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">When people ask (IST)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {busiestHour && busiestHour.questions > 0
              ? `Busiest hour: ${busiestHour.hour}:00–${busiestHour.hour + 1}:00`
              : "No questions in this period"}
          </p>
          <div className="h-40 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="currentColor" className="text-slate-400" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis stroke="currentColor" className="text-slate-400" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-slate-900/95 p-2 rounded-lg text-xs text-white">
                        {payload[0].payload.hour}:00 — <b>{payload[0].payload.questions}</b> questions
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="questions" fill="#818cf8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Models & tools */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Cpu size={14} className="text-indigo-500" /> Models &amp; tools
          </h3>
          {!h ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Needs AI health tracking (see above).</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Which model answered, and what the AI looked up.</p>
              <div className="space-y-2.5">
                {h.models.length === 0 && <p className="text-xs text-slate-500">No answers yet.</p>}
                {h.models.map((m) => {
                  const pct = modelTotal ? Math.round((100 * m.requests) / modelTotal) : 0;
                  return (
                    <div key={m.model}>
                      <div className="flex justify-between gap-2 text-xs mb-1">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{shortModel(m.model)}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          {m.requests} ({pct}%) · {fmtUsd(m.cost_usd)} · {fmtMs(m.avg_latency_ms)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Wrench size={12} /> Tools:
                </span>
                {h.tools.length === 0 && <span className="text-xs text-slate-400">none used</span>}
                {h.tools.map((t) => (
                  <span key={t.tool} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                    {TOOL_LABELS[t.tool] || t.tool}: <b className="font-mono">{t.requests}</b>
                    {h.answered ? ` (${Math.round((100 * t.requests) / h.answered)}%)` : ""}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top users */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Most active AI users</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click someone to read their conversations.</p>
        </div>
        {data.top_users.length === 0 ? (
          <p className="px-5 pb-5 text-xs text-slate-500">No conversations in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-white/[0.06]">
                  <th className="px-5 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold text-right">Questions</th>
                  <th className="px-3 py-2 font-semibold text-right">Chats</th>
                  {data.logs_available && <th className="px-3 py-2 font-semibold text-right">Cost</th>}
                  <th className="px-5 py-2 font-semibold text-right">Last asked</th>
                </tr>
              </thead>
              <tbody>
                {data.top_users.map((t) => (
                  <tr
                    key={t.user_id}
                    onClick={() => onPickUser(t.user_id, userLabel({ name: t.name, email: t.email, id: t.user_id }))}
                    className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer"
                  >
                    <td className="px-5 py-2.5 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate max-w-[220px]">{t.name || t.email}</div>
                      {t.name && <div className="text-xs text-slate-500 truncate max-w-[220px]">{t.email}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">{t.questions}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{t.sessions}</td>
                    {data.logs_available && <td className="px-3 py-2.5 text-right font-mono">{fmtUsd(t.cost_usd)}</td>}
                    <td className="px-5 py-2.5 text-right text-xs text-slate-500 whitespace-nowrap">{timeAgo(t.last_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Thumbs down */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ThumbsDown size={14} className="text-rose-500" /> Recent 👎 ratings
            </h3>
            <Link href="/feedback" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Feedback inbox →
            </Link>
          </div>
          {fb.recent_thumbs_down.length === 0 ? (
            <p className="text-xs text-slate-500">No 👎 ratings in this period.</p>
          ) : (
            <ul className="space-y-2.5">
              {fb.recent_thumbs_down.map((f) => (
                <li key={f.id} className="text-xs border-b border-slate-100 dark:border-white/[0.05] pb-2.5 last:border-0">
                  <div className="flex justify-between gap-2 text-slate-500 mb-0.5">
                    <button onClick={() => onPickUser(f.user_id, f.user || `User #${f.user_id}`)} className="font-semibold text-slate-800 dark:text-slate-200 hover:underline truncate">
                      {f.user || `User #${f.user_id}`}
                    </button>
                    <span className="shrink-0">{timeAgo(f.at)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words line-clamp-4">
                    {f.body.replace(/\*\*/g, "")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Errors */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
            <AlertTriangle size={14} className="text-amber-500" /> Recent failed answers
          </h3>
          {!h ? (
            <p className="text-xs text-slate-500">Needs AI health tracking (see above).</p>
          ) : h.recent_errors.length === 0 ? (
            <p className="text-xs text-slate-500">No failures in this period. 🎉</p>
          ) : (
            <ul className="space-y-2.5">
              {h.recent_errors.map((e, i) => (
                <li key={i} className="text-xs border-b border-slate-100 dark:border-white/[0.05] pb-2.5 last:border-0">
                  <div className="flex justify-between gap-2 text-slate-500 mb-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{e.user || `User #${e.user_id}`}</span>
                    <span className="shrink-0">{fmtDateTime(e.at)}</span>
                  </div>
                  <p className="text-rose-600 dark:text-rose-400 break-words">{e.error || "Unknown error"}</p>
                  {e.session_id && (
                    <button onClick={() => onOpenSession(e.session_id!)} className="mt-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                      Open conversation →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        All time: <b>{fmtNum(data.lifetime.questions)}</b> questions in <b>{data.lifetime.sessions}</b> conversations from{" "}
        <b>{data.lifetime.users}</b> people — {data.lifetime.adoption_pct}% of all users have tried the AI.
      </p>
    </div>
  );
}
