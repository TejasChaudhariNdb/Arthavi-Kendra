"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Target,
  Layers,
  TrendingUp,
  Search,
  Database,
  ChevronRight,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
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
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 shadow-lg shadow-black/25 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" /> Platform Asset Allocation
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Double-sided balance showing the split of all tracked assets.
            </p>
          </div>

          <div className="bg-gray-950 p-5 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span className="text-emerald-400">Mutual Funds ({Number(allocation.mf_share_pct || 0).toFixed(1)}%)</span>
              <span className="text-indigo-400">Stocks ({Number(allocation.stock_share_pct || 0).toFixed(1)}%)</span>
            </div>
            
            <div className="h-4.5 w-full bg-gray-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${allocation.mf_share_pct || 0}%` }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full transition-all duration-700"
                title={`Mutual Funds: ${allocation.mf_share_pct}%`}
              />
              <div
                style={{ width: `${allocation.stock_share_pct || 0}%` }}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-700"
                title={`Stocks: ${allocation.stock_share_pct}%`}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 font-mono pt-1">
              <span>₹{Number(allocation.mf_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Total</span>
              <span>₹{Number(allocation.stock_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Total</span>
            </div>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-950/60 p-3 rounded-xl text-center shadow-inner">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">MF Users</span>
              <span className="block text-lg font-bold text-white font-mono mt-0.5">{coverage.mf_users || 0}</span>
            </div>
            <div className="bg-gray-950/60 p-3 rounded-xl text-center shadow-inner">
              <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider">Stock Users</span>
              <span className="block text-lg font-bold text-white font-mono mt-0.5">{coverage.stock_users || 0}</span>
            </div>
            <div className="bg-gray-950/60 p-3 rounded-xl text-center shadow-inner">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">MF Schemes</span>
              <span className="block text-lg font-bold text-white font-mono mt-0.5">{coverage.mf_scheme_count || 0}</span>
            </div>
            <div className="bg-gray-950/60 p-3 rounded-xl text-center shadow-inner">
              <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider">Active Stocks</span>
              <span className="block text-lg font-bold text-white font-mono mt-0.5">{coverage.stock_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sector Concentration Warning Meter */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg shadow-black/25 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-400" /> Sector Concentration
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Audits the weight of the platform&apos;s dominant stock sector.
            </p>
          </div>

          {allocation.top_sector_name ? (
            <div className="bg-gray-950 p-4.5 rounded-xl space-y-4 my-2 shadow-inner">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block">Dominant Sector</span>
                  <span className="text-sm font-bold text-white mt-0.5 block truncate" title={allocation.top_sector_name}>
                    {allocation.top_sector_name}
                  </span>
                </div>
                <span className={clsx(
                  "px-2.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0",
                  (allocation.top_sector_share_pct || 0) > 45
                    ? "bg-rose-950/40 text-rose-400"
                    : (allocation.top_sector_share_pct || 0) > 30
                      ? "bg-amber-955/40 text-amber-400"
                      : "bg-emerald-950/40 text-emerald-400"
                )}>
                  {(allocation.top_sector_share_pct || 0) > 45
                    ? "High Concentration"
                    : (allocation.top_sector_share_pct || 0) > 30
                      ? "Moderate"
                      : "Diversified"}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>Sector Weight</span>
                  <span>{Number(allocation.top_sector_share_pct || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
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

              <p className="text-[11px] text-gray-500 leading-relaxed">
                {(allocation.top_sector_share_pct || 0) > 45
                  ? "⚠️ Critical risk: Stock portfolios are heavily concentrated. Avoid recommending assets in this sector."
                  : "✓ Safe range: Sector weight is distributed. Diversification is healthy."}
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600 text-xs bg-gray-950 rounded-xl my-2 shadow-inner">
              No stock sectors tracked yet.
            </div>
          )}

          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <Info size={12} className="shrink-0" />
            <span>Generated: {initialData.generated_at || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: SIGNAL RECOMMENDATIONS & POPULAR LISTINGS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Recommended Signal Cards */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-2xl p-5 shadow-lg shadow-black/25">
            <h3 className="text-white font-bold text-base flex items-center gap-2 mb-4">
              <Target size={18} className="text-emerald-400" /> Active Recommendations
            </h3>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((item, idx) => (
                  <div
                    key={`${item.title}-${item.name ?? item.meta ?? idx}`}
                    className="group bg-gray-955 rounded-xl p-5 hover:bg-gray-950 transition-all flex flex-col justify-between shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            item.instrument_type === "STOCK"
                              ? "bg-indigo-950/40 text-indigo-400"
                              : item.instrument_type === "MUTUAL_FUND"
                                ? "bg-emerald-950/40 text-emerald-400"
                                : "bg-purple-950/40 text-purple-400"
                          )}>
                            {item.instrument_type.replace("_", " ")}
                          </span>
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            item.priority === "HIGH"
                              ? "bg-rose-955/30 text-rose-400"
                              : "bg-gray-800 text-gray-400"
                          )}>
                            {item.priority} Priority
                          </span>
                        </div>

                        <h4 className="text-base font-semibold text-white mt-2.5 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h4>
                        
                        {item.name && (
                          <p className="text-emerald-400 font-bold text-sm mt-1">
                            {item.name}
                          </p>
                        )}
                        {item.meta && (
                          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
                            {item.meta}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-3 leading-relaxed pt-3 border-t border-gray-850/40">
                      {item.reason}
                    </p>

                    <div className="flex justify-end mt-4">
                      <Link
                        href={item.instrument_type === "STOCK" ? "/users?portfolio=yes" : "/users"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-850 text-xs text-gray-300 font-semibold transition-colors cursor-pointer shadow-md">
                        Inspect Segment
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 bg-gray-955/40 rounded-xl shadow-inner">
                  No recommendations generated today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Popular Stocks & MFs Lookup lists */}
        <div className="space-y-6">
          {/* Popular Mutual Funds */}
          <div className="bg-gray-900 rounded-2xl p-5 shadow-lg shadow-black/25">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-850/80 pb-3">
              <Layers size={16} className="text-emerald-400" /> Popular Mutual Funds
            </h4>
            
            <div className="space-y-2.5 mt-3">
              {popularMutualFunds.length > 0 ? (
                popularMutualFunds.map((item) => (
                  <div
                    key={item.name}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-gray-950/40 px-3.5 rounded-xl transition-all shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap gap-x-2">
                        <span>{item.bucket}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{item.holders} holders</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ₹{Number(item.total_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/master-data?search=${encodeURIComponent(item.name)}`)}
                      className="p-2 bg-gray-950 hover:bg-emerald-950 hover:text-emerald-400 text-gray-550 rounded-lg shrink-0 transition-all cursor-pointer shadow"
                      title="Inspect Master Data Record"
                    >
                      <Database size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-655 text-xs py-6">
                  No mutual fund records.
                </div>
              )}
            </div>
          </div>

          {/* Popular Stocks */}
          <div className="bg-gray-900 rounded-2xl p-5 shadow-lg shadow-black/25">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-850/80 pb-3">
              <TrendingUp size={16} className="text-indigo-400" /> Popular Stocks
            </h4>
            
            <div className="space-y-2.5 mt-3">
              {popularStocks.length > 0 ? (
                popularStocks.map((item) => (
                  <div
                    key={item.symbol}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-gray-955/40 px-3.5 rounded-xl transition-all shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">{item.symbol}</span>
                        <span className="text-[9px] text-gray-500 truncate" title={item.name}>{item.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-550 mt-1 flex flex-wrap gap-x-2">
                        <span>{item.sector}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{item.holders} holders</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ₹{Number(item.total_value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/master-data?search=${encodeURIComponent(item.symbol)}`)}
                      className="p-2 bg-gray-955 hover:bg-indigo-950 hover:text-indigo-400 text-gray-550 rounded-lg shrink-0 transition-all cursor-pointer shadow"
                      title="Inspect Master Data Record"
                    >
                      <Database size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-655 text-xs py-6">
                  No stock holdings records.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
