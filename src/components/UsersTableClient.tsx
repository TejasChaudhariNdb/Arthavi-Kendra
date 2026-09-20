"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Bell,
  BellOff,
  Download,
  UserMinus,
  SlidersHorizontal,
  Eye,
  LogIn,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { exportUsersCsv, exportSlippingUsersCsv, impersonateUser } from "@/lib/auth-client";
import { SearchInput } from "./ui/SearchInput";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "./ui/DataTable";

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
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-emerald-500 font-bold" /> : <Copy size={11} />}
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
    return <ChevronsUpDown size={13} className="text-slate-400 dark:text-slate-600 opacity-60" />;
  return sortConfig.direction === "asc" ? (
    <ChevronUp size={13} className="text-indigo-600 dark:text-indigo-400 font-bold" />
  ) : (
    <ChevronDown size={13} className="text-indigo-600 dark:text-indigo-400 font-bold" />
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
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
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

  const applyFilters = (customOverrides?: Partial<{
    q: string;
    notifications: string;
    portfolio: string;
    minValue: string;
    atRisk: boolean;
    active24: boolean;
  }>) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const qVal = customOverrides?.q !== undefined ? customOverrides.q : search;
    const notifVal = customOverrides?.notifications !== undefined ? customOverrides.notifications : notificationsFilter;
    const portVal = customOverrides?.portfolio !== undefined ? customOverrides.portfolio : portfolioFilter;
    const minVal = customOverrides?.minValue !== undefined ? customOverrides.minValue : minValueFilter;
    const riskVal = customOverrides?.atRisk !== undefined ? customOverrides.atRisk : atRiskOnly;
    const actVal = customOverrides?.active24 !== undefined ? customOverrides.active24 : active24Only;

    if (qVal.trim()) params.set("q", qVal.trim());
    if (notifVal) params.set("notifications", notifVal);
    if (portVal) params.set("portfolio", portVal);
    if (minVal.trim()) params.set("min_value", minVal.trim());
    if (riskVal) params.set("at_risk", "1");
    if (actVal) params.set("active_24", "1");
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
      {/* Search Omnibar & Quick Filters */}
      <Card className="p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <SearchInput
              value={search}
              onChange={setSearch}
              onClear={() => applyFilters({ q: "" })}
              placeholder="Search by name, email, or user ID... (Press / to focus)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant={showFilters || activeFiltersCount > 0 ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal size={15} />}
              className="flex-1 sm:flex-none"
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center bg-indigo-600 text-white font-bold text-[10px] rounded-full h-4.5 w-4.5 ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button
              variant="primary"
              onClick={() => applyFilters()}
              className="flex-1 sm:flex-none"
            >
              Search
            </Button>
          </div>
        </div>

        {/* 1-Tap Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
            Quick Filters:
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !atRiskOnly;
              setAtRiskOnly(next);
              applyFilters({ atRisk: next });
            }}
            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
              atRiskOnly
                ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ⚠️ At-Risk ({atRiskCount})
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !active24Only;
              setActive24Only(next);
              applyFilters({ active24: next });
            }}
            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
              active24Only
                ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ⚡ Active (24h)
          </button>
          <button
            type="button"
            onClick={() => {
              const next = portfolioFilter === "yes" ? "" : "yes";
              setPortfolioFilter(next);
              applyFilters({ portfolio: next });
            }}
            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
              portfolioFilter === "yes"
                ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            💼 Has Portfolios
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs px-2 py-1 text-slate-400 hover:text-rose-500 transition-colors ml-auto inline-flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Detailed Filter Drawer/Tray */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Notification Status
                </label>
                <select
                  value={notificationsFilter}
                  onChange={(e) => setNotificationsFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">All Notifications</option>
                  <option value="on">Notifications Enabled</option>
                  <option value="off">Notifications Disabled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Portfolio Presence
                </label>
                <select
                  value={portfolioFilter}
                  onChange={(e) => setPortfolioFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">All Portfolios</option>
                  <option value="yes">Has Active Portfolio</option>
                  <option value="no">No Portfolios Yet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Min Total Value (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minValueFilter}
                  onChange={(e) => setMinValueFilter(e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sort By Column
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="created_at">Joined Date</option>
                  <option value="last_active_at">Last Active</option>
                  <option value="portfolio_count">Portfolios Count</option>
                  <option value="total_value">Total Value (AUM)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={() => { applyFilters(); setShowFilters(false); }}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Action Strip: Result counters + CSV Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Found {totalFiltered} users</span>
          {atRiskCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
              {atRiskCount} at-risk users
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleExportSlipping}
            loading={exportingSlipping}
            icon={<UserMinus size={13} className="text-rose-500" />}
          >
            Export Churn Risk (5d+)
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={handleExport}
            loading={exporting}
            icon={<Download size={13} />}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Desktop Table Grid */}
      <div className="hidden md:block bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xs overflow-hidden transition-colors">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell className="w-16">#ID</TableHeaderCell>
              <TableHeaderCell sortable direction={sortConfig?.key === "full_name" ? sortConfig.direction : null} onSort={() => handleSort("full_name")}>
                Name
              </TableHeaderCell>
              <TableHeaderCell sortable direction={sortConfig?.key === "email" ? sortConfig.direction : null} onSort={() => handleSort("email")}>
                Email
              </TableHeaderCell>
              <TableHeaderCell sortable direction={sortConfig?.key === "created_at" ? sortConfig.direction : null} onSort={() => handleSort("created_at")}>
                Joined
              </TableHeaderCell>
              <TableHeaderCell sortable direction={sortConfig?.key === "last_active_at" ? sortConfig.direction : null} onSort={() => handleSort("last_active_at")}>
                Last Active
              </TableHeaderCell>
              <TableHeaderCell className="text-center">Notifs</TableHeaderCell>
              <TableHeaderCell sortable direction={sortConfig?.key === "portfolio_count" ? sortConfig.direction : null} onSort={() => handleSort("portfolio_count")} className="text-center">
                Portfolios
              </TableHeaderCell>
              <TableHeaderCell sortable direction={sortConfig?.key === "total_value" ? sortConfig.direction : null} onSort={() => handleSort("total_value")} className="text-right">
                Total Value
              </TableHeaderCell>
              <TableHeaderCell className="text-right pr-5">Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest("button") && !target.closest("a")) {
                    router.push(`/users/${user.id}`);
                  }
                }}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      #{user.id}
                    </span>
                    <CopyButton textValue={String(user.id)} />
                  </div>
                </TableCell>

                <TableCell className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  {user.full_name || "Anonymous"}
                </TableCell>

                <TableCell className="whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <span>{user.email}</span>
                    <CopyButton textValue={user.email} />
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {user.created_at}
                </TableCell>

                <TableCell className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {user.last_active_at || "—"}
                </TableCell>

                <TableCell className="text-center">
                  {user.notifications_enabled ? (
                    <Badge variant="success" size="sm" dot>
                      On
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Off
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
                      user.portfolio_count > 0
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {user.portfolio_count}
                  </span>
                </TableCell>

                <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-emerald-400 whitespace-nowrap">
                  {user.total_value > 0
                    ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}`
                    : "—"}
                </TableCell>

                <TableCell className="text-right whitespace-nowrap pr-5">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Link
                      href={`/users/${user.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye size={12} /> View
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImpersonate(user.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
                      title="Impersonate user session"
                    >
                      <LogIn size={12} /> Login
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            No users found matching your search.
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest("button") && !target.closest("a")) {
                router.push(`/users/${user.id}`);
              }
            }}
            className="p-4 space-y-3 cursor-pointer hover:border-indigo-500/30"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {user.full_name || "Anonymous User"}
                </h3>
                <div className="flex items-center gap-1 mt-0.5 min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</span>
                  <CopyButton textValue={user.email} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">
                  #{user.id}
                </span>
                <CopyButton textValue={String(user.id)} />
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#070a13] border border-slate-100 dark:border-white/[0.04] p-2.5 rounded-xl text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Portfolios</div>
                <div className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">{user.portfolio_count}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AUM Value</div>
                <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {user.total_value > 0 ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notifs</div>
                <div className="mt-0.5">
                  {user.notifications_enabled ? (
                    <Badge variant="success" size="sm">On</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Off</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Joined: {user.created_at}</span>
              <span>Active: {user.last_active_at || "—"}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
              <Link
                href={`/users/${user.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
              >
                <Eye size={13} /> View Profile
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImpersonate(user.id);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
              >
                <LogIn size={13} /> Impersonate
              </button>
            </div>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white dark:bg-[#0d121f] rounded-2xl border border-slate-200 dark:border-white/[0.08] text-xs">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
