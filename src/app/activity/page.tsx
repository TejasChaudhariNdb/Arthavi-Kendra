import { Suspense } from "react";
import { fetchMetricsDau, fetchMetricsWau, fetchMetricsMau, fetchUsersWithFilters } from "@/lib/api";
import ActivityCharts from "@/components/ActivityCharts";
import RecentActiveUsersTable from "@/components/RecentActiveUsersTable";
import { Activity, Users, UserPlus, RefreshCw, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

/** Hours elapsed since midnight IST (UTC+5:30) — gives true "today" window */
function hoursSinceMidnightIST(): number {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const midnightIST = new Date(nowIST);
  midnightIST.setUTCHours(0, 0, 0, 0);
  const hours = (nowIST.getTime() - midnightIST.getTime()) / (1000 * 60 * 60);
  return Math.max(1, Math.ceil(hours));
}

/** Today's date string in IST (YYYY-MM-DD) for new-user detection */
function todayISTString(): string {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return nowIST.toISOString().slice(0, 10);
}

export default async function ActivityPage() {
  const [dau, wau, mau, recentUsers] = await Promise.all([
    fetchMetricsDau(30),
    fetchMetricsWau(12),
    fetchMetricsMau(6),
    fetchUsersWithFilters({ active_within_hours: hoursSinceMidnightIST(), limit: 100, sort_by: "last_active_at", sort_order: "desc" }),
  ]);

  const todayIST    = todayISTString();
  const activeToday = recentUsers.length;
  const newToday    = recentUsers.filter((u: { created_at?: string }) => u.created_at?.startsWith(todayIST)).length;
  const returning   = activeToday - newToday;
  const retentionPct = activeToday > 0 ? Math.round((returning / activeToday) * 100) : 0;

  const kpis = [
    {
      label: "Active Today",
      value: activeToday,
      suffix: "users",
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "New Today",
      value: newToday,
      suffix: "signups",
      icon: UserPlus,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      label: "Returning",
      value: returning,
      suffix: "users",
      icon: RefreshCw,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      label: "Retention Rate",
      value: retentionPct,
      suffix: "%",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, suffix, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`bg-gray-900 border ${border} rounded-xl p-5 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
              <span className={`p-2 ${bg} ${color} rounded-lg`}>
                <Icon size={16} />
              </span>
            </div>
            <div>
              <span className={`text-3xl font-bold ${color}`}>{value}</span>
              <span className="text-gray-500 text-sm ml-1.5">{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center text-gray-500">
            Loading charts...
          </div>
        }>
        <ActivityCharts dau={dau} wau={wau} mau={mau} />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-48 flex items-center justify-center text-gray-500">
            Loading recent users...
          </div>
        }>
        <RecentActiveUsersTable users={recentUsers} todayIST={todayIST} />
      </Suspense>
    </div>
  );
}
