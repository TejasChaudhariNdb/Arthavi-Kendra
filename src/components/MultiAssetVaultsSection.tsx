"use client";

import React from "react";
import {
  Landmark,
  ShieldCheck,
  Coins,
  Home,
  CalendarClock,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

export interface VaultStatsData {
  fixedIncome?: {
    count: number;
    usersCount: number;
    totalAum: number;
    maturingSoon90d: number;
    breakdownByType?: Record<string, number>;
  };
  insurance?: {
    count: number;
    usersCount: number;
    totalLifeCover: number;
    totalHealthCover: number;
    totalAnnualPremium: number;
    renewalsDue60d: number;
  };
  realEstate?: {
    count: number;
    usersCount: number;
    totalValuation: number;
    rentedCount: number;
    monthlyRental: number;
  };
  gold?: {
    count: number;
    usersCount: number;
    totalGrams: number;
    totalInvested: number;
    totalAum: number;
  };
  sips?: {
    count: number;
    activeCount: number;
    usersCount: number;
    monthlyVolume: number;
  };
  tradebooks?: {
    stockTransactions: number;
    casImports: number;
    casSuccess: number;
  };
}

export interface AdminStatsResponse {
  totalUsers: number;
  dau: number;
  totalPortfolios: number;
  totalMfPortfolios: number;
  totalEquityPortfolios: number;
  totalAum: number;
  totalMultiAssetAum?: number;
  newUsersToday: number;
  notificationsEnabled: number;
  totalProfiles: number;
  aumBreakdown?: {
    mfAum: number;
    equityAum: number;
    fixedIncomeAum: number;
    goldAum: number;
    realEstateAum: number;
  };
  vaultStats?: VaultStatsData;
}

export function formatInr(amount: number | undefined | null): string {
  const val = Number(amount || 0);
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export default function MultiAssetVaultsSection({
  stats,
}: {
  stats: AdminStatsResponse;
}) {
  const vaults = stats.vaultStats || {};
  const breakdown = stats.aumBreakdown || {
    mfAum: 0,
    equityAum: 0,
    fixedIncomeAum: 0,
    goldAum: 0,
    realEstateAum: 0,
  };

  const totalAum =
    stats.totalMultiAssetAum ||
    stats.totalAum ||
    breakdown.mfAum +
      breakdown.equityAum +
      breakdown.fixedIncomeAum +
      breakdown.goldAum +
      breakdown.realEstateAum;

  const mfPct = totalAum > 0 ? (breakdown.mfAum / totalAum) * 100 : 0;
  const eqPct = totalAum > 0 ? (breakdown.equityAum / totalAum) * 100 : 0;
  const fiPct = totalAum > 0 ? (breakdown.fixedIncomeAum / totalAum) * 100 : 0;
  const rePct = totalAum > 0 ? (breakdown.realEstateAum / totalAum) * 100 : 0;
  const goldPct = totalAum > 0 ? (breakdown.goldAum / totalAum) * 100 : 0;

  const fi = vaults.fixedIncome || {
    count: 0,
    usersCount: 0,
    totalAum: breakdown.fixedIncomeAum,
    maturingSoon90d: 0,
  };
  const ins = vaults.insurance || {
    count: 0,
    usersCount: 0,
    totalLifeCover: 0,
    totalHealthCover: 0,
    totalAnnualPremium: 0,
    renewalsDue60d: 0,
  };
  const re = vaults.realEstate || {
    count: 0,
    usersCount: 0,
    totalValuation: breakdown.realEstateAum,
    rentedCount: 0,
    monthlyRental: 0,
  };
  const gold = vaults.gold || {
    count: 0,
    usersCount: 0,
    totalGrams: 0,
    totalInvested: 0,
    totalAum: breakdown.goldAum,
  };
  const sips = vaults.sips || {
    count: 0,
    activeCount: 0,
    usersCount: 0,
    monthlyVolume: 0,
  };
  const tradebooks = vaults.tradebooks || {
    stockTransactions: 0,
    casImports: 0,
    casSuccess: 0,
  };

  const casSuccessRate =
    tradebooks.casImports > 0
      ? Math.round((tradebooks.casSuccess / tradebooks.casImports) * 100)
      : 100;

  const occupancyRate =
    re.count > 0 ? Math.round((re.rentedCount / re.count) * 100) : 0;

  const goldUnrealizedGain = (gold.totalAum || 0) - (gold.totalInvested || 0);

  return (
    <section className="space-y-4">
      {/* Platform Multi-Asset AUM Distribution Banner */}
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <Layers size={16} />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Multi-Asset Platform AUM Ecosystem
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Consolidated real-time valuation across all platform vaults &amp; asset classes
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Multi-Asset AUM:</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {formatInr(totalAum)}
            </span>
          </div>
        </div>

        {/* Stacked Proportional Distribution Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.max(mfPct, mfPct > 0 ? 2 : 0)}%` }}
              className="bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
              title={`Mutual Funds: ${formatInr(breakdown.mfAum)} (${mfPct.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${Math.max(eqPct, eqPct > 0 ? 2 : 0)}%` }}
              className="bg-sky-500 transition-all duration-500"
              title={`Equities & Stocks: ${formatInr(breakdown.equityAum)} (${eqPct.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${Math.max(fiPct, fiPct > 0 ? 2 : 0)}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Fixed Income & Deposits: ${formatInr(breakdown.fixedIncomeAum)} (${fiPct.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${Math.max(goldPct, goldPct > 0 ? 2 : 0)}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`Gold & Bullion: ${formatInr(breakdown.goldAum)} (${goldPct.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${Math.max(rePct, rePct > 0 ? 2 : 0)}%` }}
              className="bg-purple-500 transition-all duration-500"
              title={`Real Estate: ${formatInr(breakdown.realEstateAum)} (${rePct.toFixed(1)}%)`}
            />
          </div>

          {/* Asset Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase truncate">
                  Mutual Funds
                </p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                  {formatInr(breakdown.mfAum)}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({mfPct.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase truncate">
                  Equities / Stocks
                </p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                  {formatInr(breakdown.equityAum)}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({eqPct.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase truncate">
                  Fixed Income / FD
                </p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                  {formatInr(breakdown.fixedIncomeAum)}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({fiPct.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase truncate">
                  Gold &amp; Bullion
                </p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                  {formatInr(breakdown.goldAum)}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({goldPct.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase truncate">
                  Real Estate
                </p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                  {formatInr(breakdown.realEstateAum)}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({rePct.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Grid Cards for Vaults & Ingestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* VAULT 1: Fixed Income & Deposits */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                  <Landmark size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Fixed Income &amp; Deposits
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">FD, RD, PPF &amp; Bonds</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold">
                {fi.count} deposits
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {formatInr(fi.totalAum)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracked across <span className="font-semibold text-slate-700 dark:text-slate-300">{fi.usersCount}</span> saver profiles
              </p>
            </div>

            {/* Operational Alert */}
            {fi.maturingSoon90d > 0 ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-medium">
                <Clock size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>{fi.maturingSoon90d}</strong> deposits maturing within 90 days
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 text-xs">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                <span>No urgent maturities in the next 90 days</span>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Auto-compounding &amp; alerts</span>
            <Link
              href="/users?has_portfolio=true"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
            >
              Inspect Users <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* VAULT 2: Family Insurance Vault */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Family Insurance Vault
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Term Life &amp; Health Protection</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold">
                {ins.count} policies
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Life Cover</p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {formatInr(ins.totalLifeCover)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Health Cover</p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {formatInr(ins.totalHealthCover)}
                </p>
              </div>
            </div>

            {/* Operational Alert */}
            {ins.renewalsDue60d > 0 ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-medium">
                <ShieldAlert size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  <strong>{ins.renewalsDue60d}</strong> renewals due in ≤60 days (Annual: {formatInr(ins.totalAnnualPremium)})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 text-xs">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                <span>All policy renewals up to date</span>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Premium: {formatInr(ins.totalAnnualPremium)}/yr</span>
            <Link
              href="/users"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1"
            >
              Protection View <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* VAULT 3: Live Gold & Bullion */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Live Gold &amp; Bullion
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Physical, Digital &amp; SGBs</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold">
                {gold.count} holdings
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {formatInr(gold.totalAum)}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Weight: <strong className="text-slate-700 dark:text-slate-200">{gold.totalGrams.toFixed(1)}g</strong></span>
                <span>•</span>
                <span className={goldUnrealizedGain >= 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
                  {goldUnrealizedGain >= 0 ? "+" : ""}{formatInr(goldUnrealizedGain)} P&amp;L
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Cost Invested:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{formatInr(gold.totalInvested)}</span>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Live 24K/22K API rate</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
              Active Sync <TrendingUp size={13} />
            </span>
          </div>
        </div>

        {/* VAULT 4: Real Estate & Properties */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50">
                  <Home size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Real Estate &amp; Properties
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Residential, Commercial &amp; Land</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold">
                {re.count} properties
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {formatInr(re.totalValuation)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracked across <span className="font-semibold text-slate-700 dark:text-slate-300">{re.usersCount}</span> investor profiles
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Occupancy</p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {re.rentedCount} rented ({occupancyRate}%)
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Rental Flow</p>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {formatInr(re.monthlyRental)}/mo
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">True property XIRR enabled</span>
            <Link
              href="/users"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold inline-flex items-center gap-1"
            >
              View Portfolios <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* VAULT 5: Systematic Investment Plans (SIPs) */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                  <CalendarClock size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Mutual Fund SIPs Engine
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated Monthly Investments</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/50">
                {sips.activeCount} active
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {formatInr(sips.monthlyVolume)}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / month</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly committed inflow from <span className="font-semibold text-slate-700 dark:text-slate-300">{sips.usersCount}</span> active investors
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Registered SIPs:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{sips.count}</span>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Auto-detected from statements</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1">
              Reminders Live <CheckCircle2 size={13} />
            </span>
          </div>
        </div>

        {/* VAULT 6: 1-Click Broker Tradebooks & CAS Ingestions */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/50">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Tradebooks &amp; CAS Pipeline
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Zerodha, Groww, AngelOne &amp; CAMS</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold">
                {casSuccessRate}% success
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Stock Trades</p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {tradebooks.stockTransactions.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">CAS Statements</p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {tradebooks.casImports.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a13] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Supported Formats:</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">CSV, XLSX &amp; PDF</span>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Smart duplicate detection</span>
            <Link
              href="/master-data"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
            >
              Master Stocks <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

