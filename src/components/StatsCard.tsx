import { LucideIcon } from "lucide-react";
import React from "react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md stats-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide">
          {label}
        </h3>
        <div className="p-2 bg-gray-800 rounded-lg text-emerald-400">
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-white mb-2">
        {value}
      </div>
      {trend && (
        <div
          className={`text-xs font-semibold ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
          {trend} {trendUp ? "▲" : "▼"}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
