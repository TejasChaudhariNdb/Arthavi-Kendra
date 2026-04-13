"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  MoreVertical,
  Bell,
  BellOff,
  Download,
  UserMinus,
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

const ActionMenu = ({
  user,
  onImpersonate,
}: {
  user: User;
  onImpersonate: (id: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-1 w-48 bg-gray-950 border border-gray-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
            <Link
              href={`/users/${user.id}`}
              className="block px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 transition-colors">
              View Details
            </Link>
            <button
              onClick={() => {
                onImpersonate(user.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-purple-400 font-medium transition-colors flex items-center gap-2">
              <ExternalLink size={14} /> Login as User
            </button>
          </div>
        </>
      )}
    </div>
  );
};

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
        const url = `${userAppUrl}/login?impersonate_token=${data.access_token}`;
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="lg:col-span-2">
          <select
            value={notificationsFilter}
            onChange={(e) => setNotificationsFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors">
            <option value="">All Notifications</option>
            <option value="on">Notifications On</option>
            <option value="off">Notifications Off</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <select
            value={portfolioFilter}
            onChange={(e) => setPortfolioFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors">
            <option value="">All Portfolios</option>
            <option value="yes">Has Portfolio</option>
            <option value="no">No Portfolio</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <input
            type="number"
            min={0}
            value={minValueFilter}
            onChange={(e) => setMinValueFilter(e.target.value)}
            placeholder="Min value (INR)"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="lg:col-span-2 flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={atRiskOnly}
              onChange={(e) => setAtRiskOnly(e.target.checked)}
              className="rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
            />
            At-Risk Only
          </label>
        </div>
        <div className="lg:col-span-2 flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={active24Only}
              onChange={(e) => setActive24Only(e.target.checked)}
              className="rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
            />
            Active (24h)
          </label>
        </div>
        <div className="lg:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors">
            <option value="created_at">Sort: Joined</option>
            <option value="last_active_at">Sort: Last Active</option>
            <option value="portfolio_count">Sort: Portfolios</option>
            <option value="total_value">Sort: Total Value</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors">
            <option value="desc">Order: Desc</option>
            <option value="asc">Order: Asc</option>
          </select>
        </div>
        <div className="lg:col-span-2 flex gap-2">
          <button
            onClick={applyFilters}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors">
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
            Clear
          </button>
        </div>
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-900/30 border border-rose-800/50 text-rose-400 hover:text-rose-300 hover:bg-rose-900/50 transition-colors disabled:opacity-60 text-sm font-medium">
          <UserMinus size={16} />
          {exportingSlipping ? "Exporting..." : "Export Churn Risk (5+ Days)"}
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-60 text-sm font-medium">
          <Download size={16} />
          {exporting ? "Exporting..." : "Export All to CSV"}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
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
                <th className="px-6 py-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-800/50 transition-colors">
                  {/* ID */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                      #{user.id}
                    </span>
                  </td>
                  {/* Name */}
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {user.full_name || "N/A"}
                  </td>
                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-400 border border-emerald-800">
                        <Bell size={11} /> On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-500 border border-gray-700">
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
                    <ActionMenu user={user} onImpersonate={handleImpersonate} />
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
      <div className="text-gray-500 text-xs text-right mt-2">
        Showing {filteredUsers.length} users on this page
      </div>
    </div>
  );
}
