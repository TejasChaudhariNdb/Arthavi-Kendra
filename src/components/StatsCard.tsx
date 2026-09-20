import { LucideIcon } from "lucide-react";
import React from "react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  pulse?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  pulse,
}) => {
  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
          {label}
        </h3>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1.5 flex items-center tracking-tight">
        {pulse && (
          <span className="relative flex h-2.5 w-2.5 mr-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
        {value}
      </div>
      {trend && (
        <div
          className={`text-xs font-semibold ${
            trendUp === undefined
              ? "text-slate-500 dark:text-slate-400"
              : trendUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
          }`}>
          {trend}
          {trendUp === undefined ? "" : trendUp ? " ▲" : " ▼"}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
