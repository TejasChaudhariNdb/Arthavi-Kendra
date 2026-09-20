"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Target,
  Layers,
  TrendingUp,
  Database,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

interface BuyIdeasPanelClientProps {
  initialData: {
    generated_at?: string;
    coverage?: {
      mf_users?: number;
      stock_users?: number;
      mf_scheme_count?: number;
      stock_count?: number;
    };
    allocation?: {
      mf_value?: number;
      stock_value?: number;
      mf_share_pct?: number;
      stock_share_pct?: number;
      debt_hybrid_share_pct?: number;
      top_sector_name?: string | null;
      top_sector_share_pct?: number;
    };
    recommendations?: Array<{
      title: string;
      instrument_type: string;
      action: string;
      name?: string | null;
      meta?: string | null;
      reason: string;
      priority: string;
    }>;
    popular_mutual_funds?: Array<{
      name: string;
      scheme_type: string;
      bucket: string;
      holders: number;
      total_value: number;
    }>;
    popular_stocks?: Array<{
      symbol: string;
      name: string;
      sector: string;
      holders: number;
      total_value: number;
    }>;
  };
}

export default function BuyIdeasPanelClient({ initialData }: BuyIdeasPanelClientProps) {
  const router = useRouter();
  const coverage = initialData.coverage || {};
  const allocation = initialData.allocation || {};
  const recommendations = initialData.recommendations || [];
  const popularMutualFunds = initialData.popular_mutual_funds || [];
  const popularStocks = initialData.popular_stocks || [];

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: ALLOCATION & VISUAL AUDITING DASHBOARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Class Allocation Progress Bar */}
        <Card className="lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Platform Asset Allocation
              </h3>
              <Badge variant="indigo" size="sm">
                Live Overview
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Double-sided balance showing the distribution between mutual funds and direct equities across all portfolios.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] p-4 sm:p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Mutual Funds ({Number(allocation.mf_share_pct || 0).toFixed(1)}%)
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                Stocks ({Number(allocation.stock_share_pct || 0).toFixed(1)}%)
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              </span>
            </div>

            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${allocation.mf_share_pct || 0}%` }}
                className="bg-emerald-500 h-full transition-all duration-700"
                title={`Mutual Funds: ${allocation.mf_share_pct}%`}
              />
              <div
                style={{ width: `${allocation.stock_share_pct || 0}%` }}
                className="bg-indigo-600 h-full transition-all duration-700"
                title={`Stocks: ${allocation.stock_share_pct}%`}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-mono pt-1">
              <span>₹{Number(allocation.mf_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Total</span>
              <span>₹{Number(allocation.stock_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Total</span>
            </div>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">MF Users</span>
              <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">{coverage.mf_users || 0}</span>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Stock Users</span>
              <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">{coverage.stock_users || 0}</span>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">MF Schemes</span>
              <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">{coverage.mf_scheme_count || 0}</span>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Active Stocks</span>
              <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">{coverage.stock_count || 0}</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Sector Concentration Warning Meter */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Sector Concentration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audits the weight of the platform&apos;s dominant stock sector against recommended limits.
            </p>
          </div>

          {allocation.top_sector_name ? (
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] p-4.5 rounded-2xl space-y-4 my-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                    Dominant Sector
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate" title={allocation.top_sector_name}>
                    {allocation.top_sector_name}
                  </span>
                </div>
                <Badge
                  variant={
                    (allocation.top_sector_share_pct || 0) > 45
                      ? "rose"
                      : (allocation.top_sector_share_pct || 0) > 30
                      ? "amber"
                      : "emerald"
                  }
                  size="sm"
                >
                  {(allocation.top_sector_share_pct || 0) > 45
                    ? "High Concentration"
                    : (allocation.top_sector_share_pct || 0) > 30
                    ? "Moderate"
                    : "Diversified"}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Sector Weight</span>
                  <span className="font-bold text-slate-900 dark:text-white">{Number(allocation.top_sector_share_pct || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${allocation.top_sector_share_pct || 0}%` }}
                    className={clsx(
                      "h-full rounded-full transition-all duration-700",
                      (allocation.top_sector_share_pct || 0) > 45
                        ? "bg-rose-500"
                        : (allocation.top_sector_share_pct || 0) > 30
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {(allocation.top_sector_share_pct || 0) > 45
                  ? "⚠️ Critical risk: Stock portfolios are heavily concentrated in this sector."
                  : "✓ Safe range: Sector weight is distributed nicely across portfolios."}
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-white/[0.02] rounded-2xl my-3 border border-slate-200/60 dark:border-white/[0.04]">
              No stock sectors tracked yet.
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Generated: {initialData.generated_at || "Realtime"}</span>
          </div>
        </Card>
      </div>

      {/* ── SECTION 2: SIGNAL RECOMMENDATIONS & POPULAR LISTINGS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Recommended Signal Cards */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Active Recommendations
              </h3>
              <Badge variant="indigo" size="sm">
                {recommendations.length} Active
              </Badge>
            </div>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((item, idx) => (
                  <div
                    key={`${item.title}-${item.name ?? item.meta ?? idx}`}
                    className="group bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            item.instrument_type === "STOCK"
                              ? "indigo"
                              : item.instrument_type === "MUTUAL_FUND"
                              ? "emerald"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {item.instrument_type.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant={item.priority === "HIGH" ? "rose" : "neutral"}
                          size="sm"
                        >
                          {item.priority} Priority
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>

                      {item.name && (
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-1">
                          {item.name}
                        </p>
                      )}
                      {item.meta && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">
                          {item.meta}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed pt-3 border-t border-slate-200/60 dark:border-white/[0.04]">
                      {item.reason}
                    </p>

                    <div className="flex justify-end mt-4">
                      <Link
                        href={item.instrument_type === "STOCK" ? "/users?portfolio=yes" : "/users"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 text-xs text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer shadow-sm hover:text-indigo-600 dark:hover:text-white"
                      >
                        Inspect Segment
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-10 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.06]">
                  No recommendations generated today.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Popular Stocks & MFs Lookup lists */}
        <div className="space-y-6">
          {/* Popular Mutual Funds */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Popular Mutual Funds
            </h4>

            <div className="space-y-2 mt-3">
              {popularMutualFunds.length > 0 ? (
                popularMutualFunds.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 flex items-center justify-between gap-3 group hover:bg-slate-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.06] rounded-xl transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-2">
                        <span>{item.bucket}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.holders} holders</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium mt-0.5">
                        ₹{Number(item.total_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/master-data?search=${encodeURIComponent(item.name)}`)}
                      className="p-2 bg-slate-100 dark:bg-white/[0.04] hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-white text-slate-500 dark:text-slate-400 rounded-lg shrink-0 transition-colors cursor-pointer"
                      title="Inspect Master Data Record"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 text-xs py-6">
                  No mutual fund records.
                </div>
              )}
            </div>
          </Card>

          {/* Popular Stocks */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Popular Stocks
            </h4>

            <div className="space-y-2 mt-3">
              {popularStocks.length > 0 ? (
                popularStocks.map((item) => (
                  <div
                    key={item.symbol}
                    className="p-3 flex items-center justify-between gap-3 group hover:bg-slate-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.06] rounded-xl transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide font-mono">{item.symbol}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={item.name}>{item.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-2">
                        <span>{item.sector}</span>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.holders} holders</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium mt-0.5">
                        ₹{Number(item.total_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/master-data?search=${encodeURIComponent(item.symbol)}`)}
                      className="p-2 bg-slate-100 dark:bg-white/[0.04] hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-white text-slate-500 dark:text-slate-400 rounded-lg shrink-0 transition-colors cursor-pointer"
                      title="Inspect Master Data Record"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 text-xs py-6">
                  No stock holdings records.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
