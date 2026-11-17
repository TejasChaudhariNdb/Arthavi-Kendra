import Link from "next/link";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import CronRunsClient from "@/components/CronRunsClient";
import { fetchCronRun, fetchCronRuns, type CronRunList, type CronRunRow } from "@/lib/api";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function CronRunsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; run?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || "1") || 1);
  const runId = Number(sp.run || "") || null;

  let list: CronRunList | null = null;
  let selected: CronRunRow | null = null;
  let error: string | null = null;
  try {
    [list, selected] = await Promise.all([
      fetchCronRuns(PAGE_SIZE, (page - 1) * PAGE_SIZE),
      runId ? fetchCronRun(runId) : Promise.resolve(null),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load cron runs";
  }

  const totalPages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;
  const pageHref = (p: number) => `/cron-runs?page=${p}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Timer size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Cron Runs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
            Daily market data refresh: duration, items refreshed, RAM and errors per run
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {list && !list.available && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          The run log table does not exist yet. Run <code className="font-mono">migration_cron_runs.sql</code> on the
          database; runs are recorded from the next refresh on.
        </div>
      )}

      {list && list.available && (
        <>
          <CronRunsClient runs={list.items} selected={selected} page={page} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>
                Page {page} of {totalPages} · {list.total} runs
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                    <ChevronLeft size={14} /> Newer
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={pageHref(page + 1)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                    Older <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
