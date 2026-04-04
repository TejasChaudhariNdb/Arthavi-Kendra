import { fetchUsersMeta, fetchUsersWithFilters } from "@/lib/api";
import UsersTableClient from "@/components/UsersTableClient";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="text-white p-4">
        Error loading users. Ensure backend is running.
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Users</h1>
        <div className="text-gray-400">
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

      <div className="flex items-center justify-between pt-2">
        <Link
          href={buildUsersHref(Math.max(1, page - 1))}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            page <= 1
              ? "pointer-events-none border-gray-800 text-gray-600"
              : "border-gray-800 text-gray-300 hover:text-white hover:bg-gray-900"
          }`}>
          <ChevronLeft size={16} />
          Previous
        </Link>

        <span className="text-xs text-gray-500">
          Page {page} of {totalPages} • Rows {users.length}
        </span>

        <Link
          href={buildUsersHref(page + 1)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            page >= totalPages
              ? "pointer-events-none border-gray-800 text-gray-600"
              : "border-gray-800 text-gray-300 hover:text-white hover:bg-gray-900"
          }`}>
          Next
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
