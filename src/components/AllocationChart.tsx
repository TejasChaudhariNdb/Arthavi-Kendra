"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface AllocationData {
  name: string;
  value: number;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const AllocationChart = ({ data }: { data: AllocationData[] }) => {
  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-6 shadow-xs h-96 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-xs md:text-sm uppercase tracking-wider">
          Asset Allocation
        </h3>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-md">
          Breakdown
        </span>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={5}
            dataKey="value">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(0,0,0,0)"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
              fontSize: 12,
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
            }}
            formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;

