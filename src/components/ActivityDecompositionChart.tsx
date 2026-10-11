"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, UserPlus, RefreshCw } from "lucide-react";

interface DailyData {
  date: string;
  dau: number;
  new_users: number;
  returning_users: number;
  returning_pct: number;
}

export default function ActivityDecompositionChart({
  initialData,
}: {
  initialData: DailyData[];
}) {
  const [data, setData] = useState<DailyData[]>(initialData);
  const [showNew, setShowNew] = useState(true);
  const [showReturning, setShowReturning] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30);

  // Filter based on selected time range
  const filteredData = data.slice(-timeRange);

  const avgDau =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((acc, curr) => acc + curr.dau, 0) /
            filteredData.length
        )
      : 0;

  const avgReturningPct =
    filteredData.length > 0
      ? (
          filteredData.reduce((acc, curr) => acc + curr.returning_pct, 0) /
          filteredData.length
        ).toFixed(1)
      : "0";

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col transition-colors">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
              Daily Active Users Decomposition (New vs. Returning)
            </h3>
            <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {avgReturningPct}% Avg Returning
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Separates signups from recurring users to verify true organic retention.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Time range pills */}
          <div className="flex bg-slate-100 dark:bg-white/[0.04] p-1 rounded-lg border border-slate-200/60 dark:border-white/[0.06] text-xs font-medium">
            {[14, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === days
                    ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showReturning}
              onChange={(e) => setShowReturning(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Returning Active Users
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showNew}
              onChange={(e) => setShowNew(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              New Signups Today
            </span>
          </label>
        </div>

        <div className="font-mono text-slate-500 dark:text-slate-400">
          Period Avg DAU: <span className="font-bold text-slate-900 dark:text-white">{avgDau}</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-white/[0.06]"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={15}
              tickFormatter={(val) => val.slice(5, 10)}
            />
            <YAxis
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload as DailyData;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs text-white">
                    <p className="font-semibold text-slate-300 pb-1.5 border-b border-slate-800">
                      {item.date}
                    </p>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex justify-between items-center gap-6">
                        <span className="flex items-center gap-1.5 text-indigo-400">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Returning:
                        </span>
                        <span className="font-mono font-bold">{item.returning_users}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          New Signups:
                        </span>
                        <span className="font-mono font-bold">{item.new_users}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 pt-1.5 border-t border-slate-800">
                        <span className="text-slate-400 font-medium">Total DAU:</span>
                        <span className="font-mono font-bold text-white">{item.dau}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-slate-400 font-medium">Returning Share:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {item.returning_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            {showReturning && (
              <Area
                type="monotone"
                dataKey="returning_users"
                name="Returning Users"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReturning)"
                stackId="1"
              />
            )}
            {showNew && (
              <Area
                type="monotone"
                dataKey="new_users"
                name="New Users"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNew)"
                stackId="1"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
