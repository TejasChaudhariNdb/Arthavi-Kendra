"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Bell, Sparkles, UserCheck, Flame } from "lucide-react";

interface ScatterUser {
  id: number;
  email: string;
  name: string;
  days_inactive: number;
  active_last_30d: number;
  lifetime_days: number;
  has_push: boolean;
}

export default function EngagementScatterChart({
  users,
}: {
  users: ScatterUser[];
}) {
  const [pushOnly, setPushOnly] = useState(false);

  const filteredUsers = pushOnly ? users.filter((u) => u.has_push) : users;

  const champions = users.filter((u) => u.days_inactive <= 3 && u.active_last_30d >= 8).length;
  const slipping = users.filter((u) => u.days_inactive >= 14 && u.lifetime_days >= 5).length;

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" />
              Engagement Scatter: Recency vs. Active Frequency (30D)
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {champions} Champions • {slipping} Slipping
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bubble size indicates lifetime active days. Top-left are daily power users; bottom-right are dormant accounts.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none bg-slate-50 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/[0.05]">
            <input
              type="checkbox"
              checked={pushOnly}
              onChange={(e) => setPushOnly(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <Bell size={13} className="text-indigo-500" />
            <span>FCM Push Ready Only</span>
          </label>
        </div>
      </div>

      {/* Quadrants Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
        <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
          <Flame size={13} className="text-emerald-600 shrink-0" />
          <span><strong>Champions</strong>: High frequency, &lt;3d inactive</span>
        </div>
        <div className="p-2 rounded-lg bg-sky-50/60 dark:bg-sky-500/10 border border-sky-200/50 dark:border-sky-500/20 text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
          <UserCheck size={13} className="text-sky-600 shrink-0" />
          <span><strong>Casual Active</strong>: 1-7 days in 30d</span>
        </div>
        <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <span>⚠️ <strong>Slipping</strong>: 14+ days quiet, high history</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <span>💤 <strong>Dormant</strong>: 30+ days inactive</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: -10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-white/[0.06]"
            />
            <XAxis
              type="number"
              dataKey="days_inactive"
              name="Days Inactive"
              unit="d"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 10 }}
              label={{
                value: "Days Inactive → (Recency)",
                position: "insideBottom",
                offset: -10,
                fontSize: 10,
                fill: "#94a3b8",
              }}
            />
            <YAxis
              type="number"
              dataKey="active_last_30d"
              name="Active Days (Last 30d)"
              unit="d"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 10 }}
              label={{
                value: "↑ Active Days (Last 30d)",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
                fill: "#94a3b8",
              }}
            />
            <ZAxis
              type="number"
              dataKey="lifetime_days"
              range={[35, 260]}
              name="Lifetime Active Days"
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine
              x={14}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: "14d Churn Boundary",
                fill: "#f59e0b",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <ReferenceLine
              y={8}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{
                value: "Habit Regulars (8+d)",
                fill: "#10b981",
                fontSize: 10,
                position: "insideBottomLeft",
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as ScatterUser;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs text-white max-w-xs">
                    <p className="font-semibold text-indigo-300 truncate">{d.email}</p>
                    <p className="text-slate-400 text-[11px]">{d.name}</p>
                    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Days Inactive:</span>
                        <span className={`font-mono font-bold ${d.days_inactive >= 14 ? "text-amber-400" : "text-emerald-400"}`}>
                          {d.days_inactive} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active (Last 30d):</span>
                        <span className="font-mono font-bold text-sky-400">
                          {d.active_last_30d} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lifetime Active:</span>
                        <span className="font-mono font-bold text-white">
                          {d.lifetime_days} days
                        </span>
                      </div>
                      <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Notification:</span>
                        <span className={`text-[11px] font-semibold ${d.has_push ? "text-emerald-400" : "text-slate-500"}`}>
                          {d.has_push ? "✅ FCM Push Ready" : "⚪ No Token"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Scatter
              name="Active Users"
              data={filteredUsers}
              fill="#6366f1"
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
