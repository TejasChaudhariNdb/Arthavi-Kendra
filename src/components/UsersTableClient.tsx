"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  Bell,
  BellOff,
  Download,
  UserMinus,
  SlidersHorizontal,
  Eye,
  LogIn,
  Copy,
  Check,
} from "lucide-react";
import { exportUsersCsv, exportSlippingUsersCsv, impersonateUser } from "@/lib/auth-client";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
  last_active_at: string | null;
  portfolio_count: number;
  total_value: number;
  notifications_enabled: boolean;
}

interface UsersTableClientProps {
  initialUsers: User[];
  totalFiltered: number;
  atRiskCount: number;
  initialFilters: {
    q: string;
    notifications: string;
    portfolio: string;
    minValue: string;
    atRisk: boolean;
    active24: boolean;
    sortBy: string;
    sortOrder: string;
  };
}

type SortKey = keyof User;
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

function CopyButton({ textValue }: { textValue: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-gray-800/40 transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-emerald-400 font-bold" /> : <Copy size={11} />}
    </button>
  );
}

const SortIcon = ({
  sortConfig,
  columnKey,
}: {
  sortConfig: SortConfig | null;
  columnKey: SortKey;
}) => {
  if (sortConfig?.key !== columnKey)
    return <ChevronsUpDown size={14} className="text-gray-600" />;
  return sortConfig.direction === "asc" ? (
    <ChevronUp size={14} className="text-emerald-500" />
  ) : (
    <ChevronDown size={14} className="text-emerald-500" />
  );
};

export default function UsersTableClient({
  initialUsers,
  totalFiltered,
  atRiskCount,
  initialFilters,
}: UsersTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialFilters.q || "");
  const [notificationsFilter, setNotificationsFilter] = useState(
    initialFilters.notifications || "",
  );
  const [portfolioFilter, setPortfolioFilter] = useState(
    initialFilters.portfolio || "",
  );
  const [minValueFilter, setMinValueFilter] = useState(
    initialFilters.minValue || "",
  );
  const [atRiskOnly, setAtRiskOnly] = useState(initialFilters.atRisk || false);
  const [active24Only, setActive24Only] = useState(initialFilters.active24 || false);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "created_at");
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder || "desc");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingSlipping, setExportingSlipping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
        e.preventDefault();
        const searchInput = document.getElementById("directory-search-bar");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (notificationsFilter) count++;
    if (portfolioFilter) count++;
    if (minValueFilter) count++;
    if (atRiskOnly) count++;
    if (active24Only) count++;
    if (sortBy !== "created_at") count++;
    if (sortOrder !== "desc") count++;
    return count;
  }, [notificationsFilter, portfolioFilter, minValueFilter, atRiskOnly, active24Only, sortBy, sortOrder]);

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleImpersonate = async (userId: number) => {
    try {
      const data = await impersonateUser(userId);
      if (data.access_token) {
        const userAppUrl =
          process.env.NEXT_PUBLIC_USER_APP_URL || "http://localhost:3000";
        const url = `${userAppUrl}/auth?impersonate_token=${data.access_token}`;
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Impersonation failed", error);
      alert("Failed to generate impersonation token.");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportUsersCsv();
    } catch (error) {
      console.error("Users CSV export failed", error);
      alert("Failed to export users CSV.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSlipping = async () => {
    setExportingSlipping(true);
    try {
      await exportSlippingUsersCsv(5);
    } catch (error) {
      console.error("Slipping Users CSV export failed", error);
      alert("Failed to export slipping users.");
    } finally {
      setExportingSlipping(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (search.trim()) params.set("q", search.trim());
    if (notificationsFilter) params.set("notifications", notificationsFilter);
    if (portfolioFilter) params.set("portfolio", portfolioFilter);
    if (minValueFilter.trim()) params.set("min_value", minValueFilter.trim());
    if (atRiskOnly) params.set("at_risk", "1");
    if (active24Only) params.set("active_24", "1");
    if (sortBy && sortBy !== "created_at") params.set("sort_by", sortBy);
    if (sortOrder && sortOrder !== "desc") params.set("sort_order", sortOrder);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setNotificationsFilter("");
    setPortfolioFilter("");
    setMinValueFilter("");
    setAtRiskOnly(false);
    setActive24Only(false);
    setSortBy("created_at");
    setSortOrder("desc");
    router.push(`${pathname}?page=1`);
  };

  const filteredUsers = useMemo(() => {
    const result = [...initialUsers];

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (aVal < bVal!) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal!) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [initialUsers, sortConfig]);

  return (
    <div className="space-y-4">
      {/* Search + Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              id="directory-search-bar"
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-gray-900 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-base md:text-lg transition-all shadow-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                showFilters || activeFiltersCount > 0
                  ? "bg-indigo-950/60 text-indigo-400 shadow-inner"
                : "bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 shadow-sm"
              }`}>
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center bg-emerald-500 text-gray-950 font-bold text-xs rounded-full h-5 w-5 animate-in zoom-in-50 duration-200">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-950/25 cursor-pointer">
              Search
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-900/60 rounded-xl p-5 mt-1 animate-in slide-in-from-top-3 duration-200 shadow-lg shadow-black/25">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Notifications */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notifications</label>
                <select
                  value={notificationsFilter}
                  onChange={(e) => setNotificationsFilter(e.target.value)}
                  className="w-full bg-gray-955 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-colors">
                  <option value="">All Notifications</option>
                  <option value="on">Notifications On</option>
                  <option value="off">Notifications Off</option>
                </select>
              </div>

              {/* Portfolios */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Portfolios</label>
                <select
                  value={portfolioFilter}
                  onChange={(e) => setPortfolioFilter(e.target.value)}
                  className="w-full bg-gray-955 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-colors">
                  <option value="">All Portfolios</option>
                  <option value="yes">Has Portfolio</option>
                  <option value="no">No Portfolio</option>
                </select>
              </div>

              {/* Min Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Min Value (INR)</label>
                <input
                  type="number"
                  min={0}
                  value={minValueFilter}
                  onChange={(e) => setMinValueFilter(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-gray-955 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-colors"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-955 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-colors">
                  <option value="created_at">Joined Date</option>
                  <option value="last_active_at">Last Active</option>
                  <option value="portfolio_count">Portfolios Count</option>
                  <option value="total_value">Total Value</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-gray-955 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-colors">
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              {/* Status Flags */}
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1 flex flex-row sm:items-end gap-6 pt-3 sm:pt-0 pb-1">
                <label className="inline-flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={atRiskOnly}
                    onChange={(e) => setAtRiskOnly(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-950 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 transition-colors"
                  />
                  At-Risk Only
                </label>

                <label className="inline-flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active24Only}
                    onChange={(e) => setActive24Only(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-950 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 transition-colors"
                  />
                  Active (24h)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-gray-850/20">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-gray-955 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer shadow-sm">
                Reset Filters
              </button>
              <button
                onClick={() => {
                  applyFilters();
                  setShowFilters(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow cursor-pointer">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-xs text-gray-400">
          Filtered users: {totalFiltered}
        </div>
        <div className="text-xs text-amber-300">
          At-risk users in result: {atRiskCount}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1" />
        <button
          onClick={handleExportSlipping}
          disabled={exportingSlipping}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 text-rose-400 hover:text-rose-300 hover:bg-rose-900/50 transition-colors disabled:opacity-60 text-sm font-semibold shadow">
          <UserMinus size={16} />
          {exportingSlipping ? "Exporting..." : "Export Churn Risk (5+ Days)"}
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-60 text-sm font-semibold shadow">
          <Download size={16} />
          {exporting ? "Exporting..." : "Export All to CSV"}
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-gray-900 rounded-xl overflow-hidden shadow-lg shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap text-gray-500 text-xs">
                  #ID
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("full_name")}>
                  <div className="flex items-center gap-2">
                    Name{" "}
                    <SortIcon sortConfig={sortConfig} columnKey="full_name" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-2">
                    Email <SortIcon sortConfig={sortConfig} columnKey="email" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-2">
                    Joined{" "}
                    <SortIcon sortConfig={sortConfig} columnKey="created_at" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("last_active_at")}>
                  <div className="flex items-center gap-2">
                    Last Active{" "}
                    <SortIcon sortConfig={sortConfig} columnKey="last_active_at" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  Notifications
                </th>
                <th
                  className="px-6 py-4 text-center whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("portfolio_count")}>
                  <div className="flex items-center justify-center gap-2">
                    Portfolios{" "}
                    <SortIcon
                      sortConfig={sortConfig}
                      columnKey="portfolio_count"
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("total_value")}>
                  <div className="flex items-center justify-end gap-2">
                    Total Value{" "}
                    <SortIcon sortConfig={sortConfig} columnKey="total_value" />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850/20">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest("button") && !target.closest("a")) {
                      router.push(`/users/${user.id}`);
                    }
                  }}
                  className="hover:bg-gray-850 transition-colors cursor-pointer">
                  {/* ID */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                        #{user.id}
                      </span>
                      <CopyButton textValue={String(user.id)} />
                    </div>
                  </td>
                  {/* Name */}
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {user.full_name || "N/A"}
                  </td>
                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{user.email}</span>
                      <CopyButton textValue={user.email} />
                    </div>
                  </td>
                  {/* Joined */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.created_at}
                  </td>
                  {/* Last Active */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.last_active_at || "-"}
                  </td>
                  {/* Notifications */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {user.notifications_enabled ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400">
                        <Bell size={11} /> On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-500">
                        <BellOff size={11} /> Off
                      </span>
                    )}
                  </td>
                  {/* Portfolios */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        user.portfolio_count > 0
                          ? "bg-blue-900 text-blue-300"
                          : "bg-gray-800 text-gray-500"
                      }`}>
                      {user.portfolio_count}
                    </span>
                  </td>
                  {/* Total Value */}
                  <td className="px-6 py-4 text-right font-mono text-emerald-400 whitespace-nowrap">
                    {user.total_value > 0
                      ? `₹${user.total_value.toLocaleString()}`
                      : "-"}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/users/${user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-750 text-xs text-gray-200 font-semibold transition-colors cursor-pointer shadow-sm">
                        <Eye size={12} />
                        View
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImpersonate(user.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-xs text-purple-300 font-semibold transition-colors cursor-pointer shadow-sm">
                        <LogIn size={12} />
                        Login
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found matching your search.
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest("button") && !target.closest("a")) {
                router.push(`/users/${user.id}`);
              }
            }}
            className="bg-gray-900 rounded-xl p-5 space-y-4 hover:bg-gray-850 transition-all cursor-pointer shadow-md shadow-black/15">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white text-base truncate">
                  {user.full_name || "N/A"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                  <CopyButton textValue={user.email} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="font-mono text-[10px] text-gray-400 bg-gray-955 px-2 py-0.5 rounded">
                  #{user.id}
                </span>
                <CopyButton textValue={String(user.id)} />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-gray-955/60 p-3 rounded-lg text-center shadow-inner">
              <div>
                <div className="text-[10px] text-gray-550 font-semibold uppercase tracking-wider">Portfolios</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{user.portfolio_count}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-550 font-semibold uppercase tracking-wider">Value</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {user.total_value > 0 ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-550 font-semibold uppercase tracking-wider">Notifs</div>
                <div className="mt-0.5">
                  {user.notifications_enabled ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400">
                      <Bell size={9} /> On
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-500">
                      <BellOff size={9} /> Off
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-gray-500">
              <div>Joined: {user.created_at}</div>
              <div>Active: {user.last_active_at || "—"}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-850/20">
              <Link
                href={`/users/${user.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-750 text-sm font-semibold text-white transition-colors cursor-pointer shadow-md">
                <Eye size={14} />
                View Profile
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImpersonate(user.id);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-sm font-semibold text-purple-300 transition-colors cursor-pointer shadow-md">
                <LogIn size={14} />
                Login as User
              </button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-xl shadow-inner">
            No users found matching your search.
          </div>
        )}
      </div>
      <div className="text-gray-500 text-xs text-right mt-2">
        Showing {filteredUsers.length} users on this page
      </div>
    </div>
  );
}
