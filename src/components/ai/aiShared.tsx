"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Browser calls go through the same-origin proxy, which adds the admin token.
export const API = "/api/proxy";

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const CARD =
  "bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-xs";

export function fmtUsd(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  if (v === 0) return "$0";
  if (v < 0.01) return `$${v.toFixed(4)}`;
  if (v < 1) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(2)}`;
}

export function fmtMs(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return v < 1000 ? `${v}ms` : `${(v / 1000).toFixed(1)}s`;
}

export function fmtNum(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${(v / 1000).toFixed(0)}K`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

export function shortModel(m: string | null | undefined): string {
  if (!m) return "unknown";
  return m.replace(/^anthropic\//, "").replace(/^openai\//, "");
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return fmtDateTime(iso);
}

export function userLabel(u: { name?: string | null; email?: string | null; id?: number | null }): string {
  return u.name || u.email || (u.id ? `User #${u.id}` : "Unknown user");
}

/** Markdown as the user saw it (tables included). No typography plugin, so style inline. */
export function Markdown({ children, invert = false }: { children: string; invert?: boolean }) {
  return (
    <div
      className={`text-[13px] leading-relaxed break-words
        [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
        [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5
        [&_strong]:font-semibold [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h1]:mt-2 [&_h2]:mt-2 [&_h3]:mt-2
        [&_a]:underline [&_code]:font-mono [&_code]:text-[12px]
        [&_table]:my-2 [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse
        [&_th]:text-left [&_th]:font-semibold [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1
        ${invert
          ? "[&_th]:border-b [&_th]:border-white/30 [&_td]:border-b [&_td]:border-white/20"
          : "[&_th]:border-b [&_th]:border-slate-300 dark:[&_th]:border-white/20 [&_td]:border-b [&_td]:border-slate-200 dark:[&_td]:border-white/10"}`}
    >
      <div className="overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
      </div>
    </div>
  );
}

export function Delta({ pct }: { pct: number | null | undefined }) {
  if (pct === null || pct === undefined) {
    return <span className="text-[11px] text-slate-400 dark:text-slate-500">no prior data</span>;
  }
  const cls =
    pct > 0 ? "text-emerald-600 dark:text-emerald-400" : pct < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500";
  return (
    <span className={`text-[11px] font-semibold ${cls}`}>
      {pct > 0 ? "▲" : pct < 0 ? "▼" : "•"} {Math.abs(pct)}% <span className="font-normal text-slate-400">vs prev</span>
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-slate-100 dark:bg-white/[0.04] animate-pulse ${className}`} />;
}
