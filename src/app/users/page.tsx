import { fetchUsersMeta, fetchUsersWithFilters } from "@/lib/api";
import UsersTableClient from "@/components/UsersTableClient";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users as UsersIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    notifications?: string;
    portfolio?: string;
    min_value?: string;
    at_risk?: string;
    active_24?: string;
    sort_by?: string;
    sort_order?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || "1") || 1);
  const q = (sp.q || "").trim();
  const notifications =
    sp.notifications === "on"
      ? true
      : sp.notifications === "off"
        ? false
        : undefined;
  const hasPortfolio =
    sp.portfolio === "yes" ? true : sp.portfolio === "no" ? false : undefined;
  const minValue = Math.max(0, Number(sp.min_value || "0") || 0);
  const atRisk = sp.at_risk === "1";
  const active24 = sp.active_24 === "1";
  const sortBy =
    sp.sort_by === "last_active_at" ||
    sp.sort_by === "portfolio_count" ||
    sp.sort_by === "total_value"
      ? sp.sort_by
      : "created_at";
  const sortOrder = sp.sort_order === "asc" ? "asc" : "desc";
  const PAGE_SIZE = 25;
  const skip = (page - 1) * PAGE_SIZE;

  let users = [];
  let total = 0;
  let atRiskCount = 0;
  try {
    [users, { total, at_risk_count: atRiskCount }] = await Promise.all([
      fetchUsersWithFilters({
        skip,
        limit: PAGE_SIZE,
        search: q || undefined,
        notifications_enabled: notifications,
        has_portfolio: hasPortfolio,
        min_value: minValue > 0 ? minValue : undefined,
        at_risk: atRisk || undefined,
        active_within_hours: active24 ? 24 : undefined,
        sort_by: sortBy as
          | "created_at"
          | "last_active_at"
          | "portfolio_count"
          | "total_value",
        sort_order: sortOrder,
      }),
      fetchUsersMeta({
        search: q || undefined,
        notifications_enabled: notifications,
        has_portfolio: hasPortfolio,
        min_value: minValue > 0 ? minValue : undefined,
        at_risk: atRisk || undefined,
        active_within_hours: active24 ? 24 : undefined,
      }),
    ]);
  } catch (error) {
    console.error("Failed to load users page", error);
    return (
      <div className="p-8 text-center text-rose-500 bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl">
        Error loading users directory. Ensure backend is running.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : skip + 1;
  const end = skip + users.length;

  const buildUsersHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (q) params.set("q", q);
    if (sp.notifications === "on" || sp.notifications === "off") {
      params.set("notifications", sp.notifications);
    }
    if (sp.portfolio === "yes" || sp.portfolio === "no") {
      params.set("portfolio", sp.portfolio);
    }
    if (minValue > 0) params.set("min_value", String(minValue));
    if (atRisk) params.set("at_risk", "1");
    if (active24) params.set("active_24", "1");
    if (sortBy !== "created_at") params.set("sort_by", sortBy);
    if (sortOrder !== "desc") params.set("sort_order", sortOrder);
    return `/users?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400">
            <UsersIcon size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Users Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect user registrations, portfolio holdings, engagement, and CRM risk
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          Showing {start}-{end} of {total} • Page {page}/{totalPages}
        </div>
      </div>

      <UsersTableClient
        initialUsers={users}
        totalFiltered={total}
        atRiskCount={atRiskCount}
        initialFilters={{
          q,
          notifications:
            sp.notifications === "on" || sp.notifications === "off"
              ? sp.notifications
              : "",
          portfolio:
            sp.portfolio === "yes" || sp.portfolio === "no" ? sp.portfolio : "",
          minValue: minValue > 0 ? String(minValue) : "",
          atRisk,
          active24,
          sortBy,
          sortOrder,
        }}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href={buildUsersHref(Math.max(1, page - 1))}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
            page <= 1
              ? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
              : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          }`}>
          <ChevronLeft size={16} />
          Previous
        </Link>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
          Page {page} of {totalPages}
        </span>

        <Link
          href={buildUsersHref(page + 1)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
            page >= totalPages
              ? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
              : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          }`}>
          Next
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
