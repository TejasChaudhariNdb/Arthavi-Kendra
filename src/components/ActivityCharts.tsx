"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface DAUData {
  date: string;
  count: number;
}
interface WAUData {
  week: string;
  count: number;
}
interface MAUData {
  month: string;
  count: number;
}

interface ActivityChartsProps {
  dau: DAUData[];
  wau: WAUData[];
  mau: MAUData[];
}

export default function ActivityCharts({ dau, wau, mau }: ActivityChartsProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* DAU Chart */}
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 md:p-6 shadow-xs h-80 flex flex-col transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs md:text-sm uppercase tracking-wider">
            Daily Active Users (DAU - 30 Days)
          </h3>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
            Active Pulse
          </span>
        </div>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dau} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-500"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={10}
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
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "#f8fafc",
                  fontSize: 12,
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                }}
              />
              <Area
                name="DAU"
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorDau)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WAU Chart */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 md:p-6 shadow-xs h-80 flex flex-col transition-colors">
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs md:text-sm uppercase tracking-wider mb-4">
            Weekly Active Users (WAU - 12 Weeks)
          </h3>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wau} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" vertical={false} />
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
                  cursor={{ fill: "currentColor", className: "text-slate-200/50 dark:text-white/[0.05]" }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "#f8fafc",
                    fontSize: 12,
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar name="WAU" dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAU Chart */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 md:p-6 shadow-xs h-80 flex flex-col transition-colors">
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs md:text-sm uppercase tracking-wider mb-4">
            Monthly Active Users (MAU - 6 Months)
          </h3>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mau} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(0, 7)}
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
                  cursor={{ fill: "currentColor", className: "text-slate-200/50 dark:text-white/[0.05]" }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "#f8fafc",
                    fontSize: 12,
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar name="MAU" dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
