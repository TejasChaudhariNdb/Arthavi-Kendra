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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 shadow-md h-80 flex flex-col">
        <h3 className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-wide mb-4">
          Daily Active Users (DAU - 30 Days)
        </h3>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dau} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={10}
                tickFormatter={(val) => val.slice(5, 10)}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  color: "#f3f4f6",
                  fontSize: 12,
                  borderRadius: "0.5rem",
                }}
              />
              <Area
                name="DAU"
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorDau)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WAU Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 shadow-md h-80 flex flex-col">
          <h3 className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-wide mb-4">
            Weekly Active Users (WAU - 12 Weeks)
          </h3>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wau} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(5, 10)}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f3f4f6",
                    fontSize: 12,
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar name="WAU" dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAU Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 shadow-md h-80 flex flex-col">
          <h3 className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-wide mb-4">
            Monthly Active Users (MAU - 6 Months)
          </h3>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mau} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(0, 7)}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f3f4f6",
                    fontSize: 12,
                    borderRadius: "0.5rem",
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
