import { Suspense } from "react";
import { fetchMetricsDau, fetchMetricsWau, fetchMetricsMau } from "@/lib/api";
import ActivityCharts from "@/components/ActivityCharts";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const [dau, wau, mau] = await Promise.all([
    fetchMetricsDau(30),
    fetchMetricsWau(12),
    fetchMetricsMau(6),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Activity size={24} />
            </span>
            User Activity Metrics
          </h1>
          <p className="text-gray-400 mt-2">
            Track daily, weekly, and monthly active user trends.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center text-gray-500">
            Loading charts...
          </div>
        }>
        <ActivityCharts dau={dau} wau={wau} mau={mau} />
      </Suspense>
    </div>
  );
}
