"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Growth15Data {
  displayDate: string;
  currentDate: string;
  users: number;
  compareDate: string;
  compareUsers: number;
}

interface Cumulative30Data {
  displayDate: string;
  date: string;
  total: number;
}

interface ChartData {
  growth15: Growth15Data[];
  cumulative30: Cumulative30Data[];
}

const GrowthChart = ({ data }: { data: ChartData }) => {
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 15 Day Growth Chart */}
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-80 md:h-96 flex flex-col transition-colors">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            Daily Signups (15 Days)
          </h3>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
            <input
              type="checkbox"
              className="accent-indigo-600 w-4 h-4 cursor-pointer rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              checked={showCompare}
              onChange={(e) => setShowCompare(e.target.checked)}
            />
            Compare to last month
          </label>
        </div>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.growth15 || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={10}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d121f",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#f8fafc",
                  fontSize: 12,
                  borderRadius: "0.75rem",
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {showCompare && (
                <Area
                  name="1 Month Ago"
                  type="monotone"
                  dataKey="compareUsers"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorCompare)"
                />
              )}
              <Area
                name="Current Period"
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30 Day Cumulative Growth Chart */}
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs h-80 md:h-96 flex flex-col transition-colors">
        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">
          Total Users (30 Days)
        </h3>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.cumulative30 || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d121f",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#f8fafc",
                  fontSize: 12,
                  borderRadius: "0.75rem",
                }}
                itemStyle={{ color: "#10b981" }}
              />
              <Area
                name="Total Users"
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;
