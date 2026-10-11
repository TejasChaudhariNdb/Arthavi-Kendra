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
import { Compass, Activity, Target } from "lucide-react";

interface FrequencyBucket {
  bucket: string;
  users: number;
  pct_of_users: number;
}

interface SourceRetention {
  source: string;
  signups: number;
  d1_pct: number;
  d7_pct: number;
  d30_pct: number;
}

export default function EngagementDepthAndSource({
  frequency,
  sources,
}: {
  frequency: FrequencyBucket[];
  sources: SourceRetention[];
}) {
  const getBucketColor = (bucket: string) => {
    if (bucket.includes("Power")) return "bg-emerald-500 text-white";
    if (bucket.includes("Regular")) return "bg-indigo-500 text-white";
    if (bucket.includes("Casual")) return "bg-sky-500 text-white";
    if (bucket.includes("One-off")) return "bg-amber-500 text-white";
    return "bg-slate-400 text-white";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 30-Day Engagement Depth */}
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-1.5">
              <Activity size={16} className="text-sky-500" />
              Engagement Depth (Active Days in Last 30d)
            </h3>
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md">
              User Distribution
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Shows how deeply users form habits vs. one-time visitors.
          </p>

          <div className="flex flex-col gap-3">
            {frequency.map((item) => (
              <div key={item.bucket} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.bucket}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {item.users.toLocaleString()} users
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.pct_of_users}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/[0.05] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBucketColor(
                      item.bucket
                    )}`}
                    style={{ width: `${Math.min(100, Math.max(2, item.pct_of_users))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] text-[11px] text-slate-500 flex items-center justify-between">
          <span>Healthy target: 40%+ Regulars & Power Users</span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {frequency
              .filter((f) => f.bucket.includes("Regular") || f.bucket.includes("Power"))
              .reduce((acc, f) => acc + f.pct_of_users, 0)
              .toFixed(1)}
            % Core Habits
          </span>
        </div>
      </div>

      {/* Retention by Acquisition Channel */}
      <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col transition-colors">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-1.5">
            <Compass size={16} className="text-indigo-500" />
            Retention by Signup Source (Channel Quality)
          </h3>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
            D1 / D7 / D30
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Compares which acquisition channel brings users who retain over 30 days.
        </p>

        <div className="h-64 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sources}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-white/[0.06]"
                horizontal={false}
              />
              <XAxis
                type="number"
                unit="%"
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-500"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="source"
                stroke="currentColor"
                className="text-slate-600 dark:text-slate-400 font-medium"
                tick={{ fontSize: 11 }}
                width={70}
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="d1_pct" name="D1 %" fill="#6366f1" radius={[0, 3, 3, 0]} />
              <Bar dataKey="d7_pct" name="D7 %" fill="#10b981" radius={[0, 3, 3, 0]} />
              <Bar dataKey="d30_pct" name="D30 %" fill="#f59e0b" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
