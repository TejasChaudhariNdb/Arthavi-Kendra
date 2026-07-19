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
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg shadow-black/15 stats-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
          {label}
        </h3>
        <div className="p-2 bg-gray-800 rounded-lg text-emerald-400">
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-white mb-2 flex items-center">
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
              ? "text-gray-400"
              : trendUp
                ? "text-emerald-500"
                : "text-rose-500"
          }`}>
          {trend}
          {trendUp === undefined ? "" : trendUp ? " ▲" : " ▼"}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
