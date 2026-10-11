"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WeeklyDecomp {
  week: string;
  wau: number;
  new_users: number;
  retained: number;
  resurrected: number;
  old_users_active: number;
  new_pct_of_wau: number;
  churned_from_last_week: number;
  wow_retention_pct: number;
}

export default function WeeklyDecompositionChart({
  data,
}: {
  data: WeeklyDecomp[];
}) {
  const latestWeek = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
              Weekly Active Users Decomposition (WAU)
            </h3>
            {latestWeek && (
              <span className="text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                {latestWeek.wow_retention_pct}% WoW Retention
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classifies WAU into New, Retained (active last week), and Resurrected (came back from dormancy).
          </p>
        </div>
      </div>

      {/* Legend Header */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-3 py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span> Retained (Last week active)
        </span>
        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> Resurrected (Came back)
        </span>
        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> New Users
        </span>
      </div>

      <div className="h-72 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-white/[0.06]"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
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
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as WeeklyDecomp;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs text-white">
                    <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
                      Week of {d.week}
                    </p>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex justify-between items-center gap-6 text-sky-400">
                        <span>Retained from Last Week:</span>
                        <span className="font-mono font-bold">{d.retained}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 text-purple-400">
                        <span>Resurrected (Dormant):</span>
                        <span className="font-mono font-bold">{d.resurrected}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 text-emerald-400">
                        <span>New Signups:</span>
                        <span className="font-mono font-bold">{d.new_users}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 pt-1.5 border-t border-slate-800 text-white font-medium">
                        <span>Total WAU:</span>
                        <span className="font-mono font-bold">{d.wau}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 text-indigo-400 font-medium">
                        <span>WoW Retention Rate:</span>
                        <span className="font-mono font-bold">{d.wow_retention_pct}%</span>
                      </div>
                      {d.churned_from_last_week > 0 && (
                        <div className="flex justify-between items-center gap-6 text-rose-400">
                          <span>Lost / Churned vs Prior Wk:</span>
                          <span className="font-mono font-bold">{d.churned_from_last_week}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="retained" name="Retained" stackId="wau" fill="#0284c7" radius={[0, 0, 0, 0]} />
            <Bar dataKey="resurrected" name="Resurrected" stackId="wau" fill="#a855f7" radius={[0, 0, 0, 0]} />
            <Bar dataKey="new_users" name="New Users" stackId="wau" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
