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

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

const AllocationChart = ({ data }: { data: AllocationData[] }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md h-96">
      <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide mb-6">
        Asset Allocation
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
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
              backgroundColor: "#1f2937",
              borderColor: "#374151",
              color: "#f3f4f6",
            }}
            formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
