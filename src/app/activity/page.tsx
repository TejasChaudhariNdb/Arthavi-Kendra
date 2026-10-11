import { Suspense } from "react";
import {
  fetchActivityDashboardBundle,
  fetchUsersWithFilters,
  fetchUsersMeta,
} from "@/lib/api";
import ActivityDashboardClient from "@/components/ActivityDashboardClient";

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
  const [initialBundle, recentUsers, meta] = await Promise.all([
    fetchActivityDashboardBundle().catch(() => null),
    fetchUsersWithFilters({
      active_within_hours: 24 * 7, // 7 days window for weekday filters
      limit: 250,
      sort_by: "last_active_at",
      sort_order: "desc",
    }).catch(() => []),
    fetchUsersMeta({ at_risk: true }).catch(() => null),
  ]);


  const todayIST = todayISTString();

  return (
    <Suspense
      fallback={
        <div className="h-96 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          Loading user retention intelligence...
        </div>
      }
    >
      <ActivityDashboardClient
        initialBundle={initialBundle}
        recentUsers={recentUsers}
        todayIST={todayIST}
        meta={meta}
      />
    </Suspense>
  );
}
