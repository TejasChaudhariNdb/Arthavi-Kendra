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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 shadow-md h-80 md:h-96 flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h3 className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-wide">
            Daily Signups (15 Days)
          </h3>
          <label className="flex items-center gap-2 text-xs md:text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            <input
              type="checkbox"
              className="accent-emerald-500 w-4 h-4 cursor-pointer rounded border-gray-700 bg-gray-800 focus:ring-emerald-500 focus:ring-offset-gray-900"
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
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={10}
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
                labelStyle={{ color: "#9ca3af", marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {showCompare && (
                <Area
                  name="1 Month Ago"
                  type="monotone"
                  dataKey="compareUsers"
                  stroke="#9ca3af"
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
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30 Day Cumulative Growth Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 shadow-md h-80 md:h-96 flex flex-col">
        <h3 className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-wide mb-4">
          Total Users (30 Days)
        </h3>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.cumulative30 || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin', 'dataMax']}
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
                itemStyle={{ color: "#3b82f6" }}
              />
              <Area
                name="Total Users"
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
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
