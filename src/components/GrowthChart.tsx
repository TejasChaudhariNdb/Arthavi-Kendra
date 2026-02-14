"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthData {
  date: string;
  users: number;
}

const GrowthChart = ({ data }: { data: GrowthData[] }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md h-96">
      <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6">
        User Growth (30 Days)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderColor: "#374151",
              color: "#f3f4f6",
            }}
            itemStyle={{ color: "#10b981" }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
