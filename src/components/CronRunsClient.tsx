"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CronRunRow } from "@/lib/api";

// Flag thresholds for the daily market data refresh.
const SLOW_MS = 5 * 60 * 1000;
const HIGH_RAM_MB = 450;
const PER_CODE_SHARE = 0.5;

const card =
  "bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xs transition-colors";

function fmtIST(iso: string | null, withDate = true): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    ...(withDate ? { day: "2-digit", month: "short" } : {}),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s - m * 60)}s`;
}

function fmtNum(n: number | null | undefined): string {
  return n == null ? "—" : n.toLocaleString("en-IN");
}

function fmtMb(n: number | null | undefined): string {
  return n == null ? "—" : `${Math.round(n)} MB`;
}

export function runFlags(r: CronRunRow): string[] {
  const flags: string[] = [];
  if (r.status === "failed") flags.push("Failed");
  else if (r.status !== "ok") flags.push("Partial");
  if (r.duration_ms != null && r.duration_ms > SLOW_MS) flags.push("Slow (> 5 min)");
  if (r.navs_failed) flags.push(`${r.navs_failed} NAV codes failed`);
  if (r.bulk_available === false) flags.push("Bulk NAV feed down");
  else if (
    r.navs_per_code != null &&
    r.unique_amfi_codes &&
    r.navs_per_code / r.unique_amfi_codes > PER_CODE_SHARE
  )
    flags.push("Mostly per-code NAVs");
  if (r.peak_rss_mb != null && r.peak_rss_mb > HIGH_RAM_MB) flags.push(`RAM > ${HIGH_RAM_MB} MB`);
  return flags;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: typeof CheckCircle2 }> = {
    ok: { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", Icon: CheckCircle2 },
    partial: { cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300", Icon: AlertTriangle },
    failed: { cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300", Icon: XCircle },
  };
  const { cls, Icon } = map[status] ?? map.partial;
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", cls)}>
      <Icon size={12} /> {status}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className={clsx(card, "p-4")}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

export default function CronRunsClient({
  runs,
  selected,
  page,
}: {
  runs: CronRunRow[];
  selected: CronRunRow | null;
  page: number;
}) {
  const router = useRouter();
  const latest = runs[0];
  const recent = runs.slice(0, 7).filter((r) => r.duration_ms != null);
  const avgMs = recent.length
    ? Math.round(recent.reduce((sum, r) => sum + (r.duration_ms ?? 0), 0) / recent.length)
    : null;
  const flagged = runs.filter((r) => runFlags(r).length > 0).length;

  const chartData = [...runs].reverse().map((r) => ({
    label: fmtIST(r.started_at),
    minutes: r.duration_ms != null ? +(r.duration_ms / 60000).toFixed(2) : null,
    peakMb: r.peak_rss_mb != null ? Math.round(r.peak_rss_mb) : null,
  }));

  const open = (id: number) => router.push(`/cron-runs?page=${page}&run=${id}`, { scroll: false });

  if (!runs.length) {
    return (
      <div className={clsx(card, "p-8 text-center text-sm text-slate-500 dark:text-slate-400")}>
        No runs recorded yet. The next market data refresh will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Last run"
          value={latest ? <StatusBadge status={latest.status} /> : "—"}
          sub={latest ? `${fmtIST(latest.started_at)} IST · ${latest.trigger ?? "?"}` : undefined}
        />
        <Stat label="Avg duration (last 7)" value={fmtDuration(avgMs)} sub={latest ? `last: ${fmtDuration(latest.duration_ms)}` : undefined} />
        <Stat
          label="Peak RAM (last run)"
          value={fmtMb(latest?.peak_rss_mb)}
          sub={latest?.peak_scope === "process" ? "whole process, not just this run" : latest?.peak_scope === "run" ? "this run" : undefined}
        />
        <Stat label="Flagged runs" value={`${flagged} / ${runs.length}`} sub="on this page" />
      </div>

      {chartData.length > 1 && (
        <div className={clsx(card, "p-5 h-72 flex flex-col")}>
          <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
            Duration and peak RAM per run
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={16} />
                <YAxis yAxisId="min" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} unit="m" />
                <YAxis yAxisId="mb" orientation="right" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} unit="MB" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="min" type="monotone" dataKey="minutes" name="Duration (min)" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                <Line yAxisId="mb" type="monotone" dataKey="peakMb" name="Peak RAM (MB)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selected && <RunDetail run={selected} closeHref={`/cron-runs?page=${page}`} />}

      <div className={clsx(card, "overflow-x-auto")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
              <th className="px-4 py-3">Started (IST)</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Duration</th>
              <th className="px-3 py-3 text-right">Stocks</th>
              <th className="px-3 py-3 text-right">NAV codes</th>
              <th className="px-3 py-3 text-right">Bulk / per-code</th>
              <th className="px-3 py-3 text-right">Schemes</th>
              <th className="px-3 py-3 text-right">Snapshots</th>
              <th className="px-3 py-3 text-right">Peak RAM</th>
              <th className="px-3 py-3 text-right">Errors</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const flags = runFlags(r);
              return (
                <tr
                  key={r.id}
                  onClick={() => open(r.id)}
                  className={clsx(
                    "border-b border-slate-100 dark:border-white/[0.04] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                    selected?.id === r.id && "bg-indigo-50/60 dark:bg-indigo-500/10",
                  )}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">{fmtIST(r.started_at)}</div>
                    <div className="text-[11px] text-slate-500">{r.trigger ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">{fmtDuration(r.duration_ms)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(r.stocks_updated)}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {fmtNum(r.navs_fetched)} / {fmtNum(r.unique_amfi_codes)}
                    {!!r.navs_failed && <div className="text-[11px] text-rose-600 dark:text-rose-400">{r.navs_failed} failed</div>}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {r.bulk_available === false ? (
                      <span className="text-rose-600 dark:text-rose-400">bulk down</span>
                    ) : r.navs_from_bulk != null ? (
                      `${fmtNum(r.navs_from_bulk)} / ${fmtNum(r.navs_per_code)}`
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(r.schemes_updated)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(r.snapshots_updated)}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">{fmtMb(r.peak_rss_mb)}</td>
                  <td className={clsx("px-3 py-2.5 text-right", r.error_count > 0 && "text-rose-600 dark:text-rose-400 font-semibold")}>
                    {r.error_count}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {flags.map((f) => (
                        <span key={f} className="px-1.5 py-0.5 rounded-md text-[11px] bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 whitespace-nowrap">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RunDetail({ run, closeHref }: { run: CronRunRow; closeHref: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const errors = run.details?.errors ?? [];
  const flags = runFlags(run);
  const steps: Array<[string, number | null]> = [
    ["Stock prices", run.stocks_ms],
    ["MF NAVs + snapshots", run.navs_ms],
    ["Predictions", run.predictions_ms],
  ];
  const total = run.duration_ms || 1;

  return (
    <div className={clsx(card, "p-5 space-y-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Run #{run.id}</h2>
            <StatusBadge status={run.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {fmtIST(run.started_at)} → {fmtIST(run.finished_at, false)} IST · {run.trigger ?? "?"} · {fmtDuration(run.duration_ms)}
          </p>
          {flags.length > 0 && <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{flags.join(" · ")}</p>}
        </div>
        <Link href={closeHref} scroll={false} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500" aria-label="Close">
          <X size={16} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Steps</h3>
          <div className="space-y-2">
            {steps.map(([name, ms]) => (
              <div key={name}>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{name}</span>
                  <span className="text-slate-500">{fmtDuration(ms)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 mt-1">
                  <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, ((ms ?? 0) / total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Counts and memory</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {[
              ["Stocks updated", fmtNum(run.stocks_updated)],
              ["AMFI codes", fmtNum(run.unique_amfi_codes)],
              ["NAVs fetched", fmtNum(run.navs_fetched)],
              ["NAV codes failed", fmtNum(run.navs_failed)],
              ["From bulk / per-code", run.navs_from_bulk != null ? `${fmtNum(run.navs_from_bulk)} / ${fmtNum(run.navs_per_code)}` : "—"],
              ["Schemes updated", fmtNum(run.schemes_updated)],
              ["Snapshots", fmtNum(run.snapshots_updated)],
              ["Portfolios refreshed", fmtNum(run.portfolios_refreshed)],
              ["Predictions evaluated", fmtNum(run.predictions_evaluated)],
              ["RAM start → end", `${fmtMb(run.rss_start_mb)} → ${fmtMb(run.rss_end_mb)}`],
              ["Peak RAM", `${fmtMb(run.peak_rss_mb)}${run.peak_scope === "process" ? " (process)" : ""}`],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right text-slate-900 dark:text-white font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Errors ({run.error_count}{run.details?.errors_truncated ? `, first ${errors.length} shown` : ""})
        </h3>
        {errors.length ? (
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="text-xs font-mono break-all rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200 px-2 py-1">
                {e}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">None</p>
        )}
      </div>

      <div>
        <button onClick={() => setShowRaw((v) => !v)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          {showRaw ? "Hide" : "Show"} raw result
        </button>
        {showRaw && (
          <pre className="mt-2 text-[11px] bg-slate-50 dark:bg-black/30 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(run.details ?? {}, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
