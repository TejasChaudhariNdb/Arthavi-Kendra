"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Layers, Calendar, BarChart2 } from "lucide-react";

interface CohortRow {
  cohort_week: string;
  cohort_size: number;
  w0: number | null;
  w1: number | null;
  w2: number | null;
  w3: number | null;
  w4: number | null;
  w5: number | null;
  w6: number | null;
  w7: number | null;
  w8: number | null;
}

interface DayNRow {
  signup_week: string;
  signups: number;
  d1_pct: number | null;
  d3_pct: number | null;
  d7_pct: number | null;
  d14_pct: number | null;
  d30_pct: number | null;
}

function getHeatmapBg(pct: number | null) {
  if (pct === null) return "text-slate-400 dark:text-slate-600 bg-transparent";
  if (pct >= 40) return "bg-emerald-600 text-white font-bold";
  if (pct >= 25) return "bg-emerald-500/80 text-white font-semibold";
  if (pct >= 15) return "bg-teal-500/60 text-slate-900 dark:text-white";
  if (pct >= 8)  return "bg-sky-500/25 text-slate-700 dark:text-slate-200";
  return "bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400";
}

export default function CohortRetentionMatrix({
  cohorts,
  dayN,
}: {
  cohorts: CohortRow[];
  dayN: DayNRow[];
}) {
  const [viewMode, setViewMode] = useState<"matrix" | "dayN">("matrix");
  const weeks = ["w0", "w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"] as const;

  // Prepare line chart data for Day-N retention
  const chartDayNData = dayN.slice(0, 5).reverse();

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2">
              <Layers size={16} className="text-indigo-500" />
              Cohort Retention Analysis (Longitudinal Retention)
            </h3>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
              {cohorts.length} Cohorts Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate whether users retain over successive weeks and find the inflection point of churn.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 dark:bg-white/[0.04] p-1 rounded-lg border border-slate-200/60 dark:border-white/[0.06] text-xs font-medium">
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "matrix"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Weekly Matrix (W0–W8)
          </button>
          <button
            onClick={() => setViewMode("dayN")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "dayN"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Classic Day-N (D1–D30)
          </button>
        </div>
      </div>

      {viewMode === "matrix" ? (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/[0.08] text-slate-400 dark:text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Cohort Signup Week</th>
                <th className="py-2.5 px-3 font-semibold text-center">Cohort Size</th>
                {weeks.map((w, idx) => (
                  <th
                    key={w}
                    className="py-2.5 px-2 font-semibold text-center uppercase tracking-wider"
                  >
                    W{idx}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
              {cohorts.map((row) => (
                <tr
                  key={row.cohort_week}
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {row.cohort_week}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {row.cohort_size}
                  </td>
                  {weeks.map((w) => {
                    const val = row[w];
                    return (
                      <td key={w} className="p-1 text-center font-mono">
                        <div
                          className={`py-1.5 px-1.5 rounded-md transition-colors text-[11px] ${getHeatmapBg(
                            val
                          )}`}
                        >
                          {val !== null ? `${val}%` : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] text-[11px] text-slate-400">
            <span>Color Scale:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600"></span> 40%+
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/80"></span> 25-39%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-500/60"></span> 15-24%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500/25"></span> 8-14%
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Day-N Trends Line Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDayNData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" />
                <XAxis
                  dataKey="signup_week"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.slice(5, 10)}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  tick={{ fontSize: 10 }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="d1_pct" name="D1 Retention %" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="d7_pct" name="D7 Retention %" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="d14_pct" name="D14 Retention %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="d30_pct" name="D30 Retention %" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Day-N Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/[0.08] text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Cohort Week</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Signups</th>
                  <th className="py-2.5 px-3 font-semibold text-center">D1 %</th>
                  <th className="py-2.5 px-3 font-semibold text-center">D3 %</th>
                  <th className="py-2.5 px-3 font-semibold text-center">D7 %</th>
                  <th className="py-2.5 px-3 font-semibold text-center">D14 %</th>
                  <th className="py-2.5 px-3 font-semibold text-center">D30 %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {dayN.map((r) => (
                  <tr key={r.signup_week} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {r.signup_week}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center font-bold text-indigo-500">
                      {r.signups}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      {r.d1_pct !== null ? `${r.d1_pct}%` : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-sky-500">
                      {r.d3_pct !== null ? `${r.d3_pct}%` : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      {r.d7_pct !== null ? `${r.d7_pct}%` : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-amber-500">
                      {r.d14_pct !== null ? `${r.d14_pct}%` : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center text-pink-500 font-semibold">
                      {r.d30_pct !== null ? `${r.d30_pct}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
