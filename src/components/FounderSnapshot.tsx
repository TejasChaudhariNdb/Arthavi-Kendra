"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus, Lightbulb } from "lucide-react";

export interface FounderMetrics {
  growth: {
    total_users: number;
    activated_users: number;
    activation_rate_pct: number;
    signups_7d: number;
    signups_prev_7d: number;
    signups_7d_change_pct: number | null;
    signups_30d: number;
    signups_prev_30d: number;
    signups_30d_change_pct: number | null;
    wau: number;
    wau_prev: number;
    wau_change_pct: number | null;
    mau: number;
    mau_prev: number;
    mau_change_pct: number | null;
    avg_dau_7d: number;
    avg_dau_prev_7d: number;
    avg_dau_change_pct: number | null;
  };
  funnel: {
    window_label: string;
    steps: { label: string; users: number; pct: number }[];
  };
  weekly_signups: {
    week_start: string;
    signups: number;
    activated: number;
    came_back: number;
    activation_pct: number;
  }[];
  adoption: {
    key: string;
    label: string;
    is_asset: boolean;
    users: number;
    pct_of_users: number;
    mau_users: number;
    pct_of_mau: number;
  }[];
}

const CARD =
  "bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-xs";

function Delta({ pct, prev }: { pct: number | null; prev: number }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        <Minus size={12} /> no prior data
      </span>
    );
  }
  const up = pct > 0;
  const flat = pct === 0;
  const cls = flat
    ? "text-slate-500 dark:text-slate-400"
    : up
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon size={13} />
      {up ? "+" : ""}
      {pct}% <span className="font-normal text-slate-400 dark:text-slate-500 ml-0.5">vs {prev}</span>
    </span>
  );
}

function buildInsights(m: FounderMetrics): string[] {
  const out: string[] = [];
  const steps = m.funnel.steps;
  if (steps.length > 1 && steps[0].users > 0) {
    let worst = { from: "", to: "", lost: -1 };
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1].users;
      if (!prev) continue;
      const lost = Math.round((100 * (prev - steps[i].users)) / prev);
      if (lost > worst.lost) worst = { from: steps[i - 1].label, to: steps[i].label, lost };
    }
    if (worst.lost > 0) {
      out.push(`Biggest funnel drop: "${worst.from}" → "${worst.to}" loses ${worst.lost}% of new users.`);
    }
  }
  const g = m.growth;
  if (g.signups_7d_change_pct !== null && Math.abs(g.signups_7d_change_pct) >= 20) {
    out.push(
      `Signups are ${g.signups_7d_change_pct > 0 ? "up" : "down"} ${Math.abs(g.signups_7d_change_pct)}% this week (${g.signups_7d} vs ${g.signups_prev_7d}).`
    );
  }
  const topMau = [...m.adoption].filter((a) => a.mau_users > 0).sort((a, b) => b.pct_of_mau - a.pct_of_mau)[0];
  if (topMau) {
    out.push(`${topMau.label} is the most-used feature among monthly actives (${topMau.pct_of_mau}% of MAU).`);
  }
  const unused = m.adoption.filter((a) => a.users === 0).map((a) => a.label);
  if (unused.length) out.push(`No users yet: ${unused.join(", ")}.`);
  return out;
}

export default function FounderSnapshot({ metrics }: { metrics: FounderMetrics | null | undefined }) {
  if (!metrics) {
    return (
      <div className={`${CARD} p-4 text-xs text-slate-500 dark:text-slate-400`}>
        Founder snapshot is unavailable (backend not updated yet or the query failed). Try Refresh Data.
      </div>
    );
  }

  const g = metrics.growth;
  const cards = [
    {
      label: "Total users",
      value: g.total_users.toLocaleString("en-IN"),
      sub: (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {g.activated_users.toLocaleString("en-IN")} added holdings
        </span>
      ),
    },
    {
      label: "Activation rate",
      value: `${g.activation_rate_pct}%`,
      sub: <span className="text-[11px] text-slate-500 dark:text-slate-400">users with any holding</span>,
    },
    { label: "Signups · 7d", value: g.signups_7d, sub: <Delta pct={g.signups_7d_change_pct} prev={g.signups_prev_7d} /> },
    { label: "Signups · 30d", value: g.signups_30d, sub: <Delta pct={g.signups_30d_change_pct} prev={g.signups_prev_30d} /> },
    { label: "Avg daily active · 7d", value: g.avg_dau_7d, sub: <Delta pct={g.avg_dau_change_pct} prev={g.avg_dau_prev_7d} /> },
    { label: "Weekly active", value: g.wau, sub: <Delta pct={g.wau_change_pct} prev={g.wau_prev} /> },
    { label: "Monthly active", value: g.mau, sub: <Delta pct={g.mau_change_pct} prev={g.mau_prev} /> },
  ];

  const insights = buildInsights(metrics);
  const steps = metrics.funnel.steps;
  const weekly = metrics.weekly_signups.map((w) => ({
    ...w,
    label: new Date(`${w.week_start}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Founder snapshot</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Growth, activation and what people actually use. Changes compare with the previous period of the same length.
          </p>
        </div>
      </div>

      {/* Growth cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-7 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`${CARD} p-3.5 flex flex-col gap-1 min-w-0`}>
            <span className="text-[11px] font-semibold uppercase tracking-wide leading-tight text-slate-500 dark:text-slate-400">
              {c.label}
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{c.value}</span>
            {c.sub}
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/[0.06] p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <Lightbulb size={14} /> What stands out
          </div>
          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
            {insights.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activation funnel */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activation funnel</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">{metrics.funnel.window_label}</p>
          {steps[0]?.users ? (
            <div className="flex flex-col gap-3">
              {steps.map((s, i) => {
                const prev = i > 0 ? steps[i - 1].users : null;
                const stepPct = prev ? Math.round((100 * s.users) / prev) : null;
                return (
                  <div key={s.label}>
                    <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        <strong>{s.users}</strong>{" "}
                        <span className="text-slate-400 dark:text-slate-500">({s.pct}%)</span>
                        {stepPct !== null && (
                          <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">{stepPct}% of prev</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.max(s.pct, s.users ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">No signups in this window yet.</p>
          )}
        </div>

        {/* Weekly signups & quality */}
        <div className={`${CARD} p-5 flex flex-col`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Weekly signups &amp; quality</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
            Signups per week, and how many of them added holdings or came back on a later day.
          </p>
          <div className="flex flex-wrap gap-4 text-xs mb-2 text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-400" /> Signups</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Added holdings</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Came back</span>
          </div>
          <div className="h-56 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" vertical={false} />
                <XAxis dataKey="label" stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as (typeof weekly)[number];
                    return (
                      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs text-white space-y-1">
                        <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800">Week of {d.label}</p>
                        <p>Signups: <strong className="font-mono">{d.signups}</strong></p>
                        <p className="text-emerald-400">Added holdings: <strong className="font-mono">{d.activated}</strong> ({d.activation_pct}%)</p>
                        <p className="text-sky-400">Came back: <strong className="font-mono">{d.came_back}</strong></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="signups" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="activated" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="came_back" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature adoption */}
      <div className={`${CARD} p-5`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Feature &amp; asset adoption</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Users who have added each asset or used each feature, out of all users and out of monthly actives.
            </p>
          </div>
          <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300 shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> % of all users</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> % of monthly actives</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {metrics.adoption.map((a) => (
            <div key={a.key} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {a.label}
                  {!a.is_asset && (
                    <span className="ml-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-normal">feature</span>
                  )}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                  <strong className="text-slate-900 dark:text-white">{a.users}</strong> users · {a.mau_users} active
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden" title={`${a.pct_of_users}% of all users`}>
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${a.pct_of_users}%` }} />
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden" title={`${a.pct_of_mau}% of monthly actives`}>
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${a.pct_of_mau}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                <span>{a.pct_of_users}% of users</span>
                <span>{a.pct_of_mau}% of MAU</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
