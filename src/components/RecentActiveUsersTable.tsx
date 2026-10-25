"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Calendar,
} from "lucide-react";
import { impersonateUser } from "@/lib/auth-client";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
  last_active_at: string | null;
  total_active_days?: number;
  portfolio_count: number;
  total_value: number;
}

type SortKey = "full_name" | "email" | "created_at" | "last_active_at" | "total_value";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown size={12} className="inline ml-1 text-slate-400 dark:text-slate-600" />;
  return sortDir === "asc"
    ? <ChevronUp size={12} className="inline ml-1 text-indigo-600 dark:text-indigo-400" />
    : <ChevronDown size={12} className="inline ml-1 text-indigo-600 dark:text-indigo-400" />;
}

export interface DayOption {
  offset: number;
  dateStr: string;
  label: string;
  shortLabel: string;
  weekday: string;
  formatted: string;
}

function toISTDateString(dateStr: string | null): string {
  if (!dateStr) return "";
  // If the backend already formatted it as "YYYY-MM-DD ...", extract the date part directly
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }
  const d = new Date(dateStr);
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export default function RecentActiveUsersTable({
  users,
  todayIST,
  selectedOffset = 0,
  onSelectOffset,
  daysList = [],
}: {
  users: User[];
  todayIST: string;
  selectedOffset?: number | null; // 0 for today, 1 for yesterday, 2 for 2d ago ... null for All 7 Days
  onSelectOffset?: (offset: number | null) => void;
  daysList?: DayOption[];
}) {
  const router = useRouter();
  const [internalOffset, setInternalOffset] = useState<number | null>(selectedOffset);
  const [sortKey, setSortKey] = useState<SortKey | null>("last_active_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const activeOffset = onSelectOffset ? selectedOffset : internalOffset;

  const handleSelectDay = (offset: number | null) => {
    if (onSelectOffset) {
      onSelectOffset(offset);
    } else {
      setInternalOffset(offset);
    }
  };

  // Find selected date
  const selectedDay = useMemo(() => {
    if (activeOffset === null) return null;
    return daysList.find((d) => d.offset === activeOffset) || null;
  }, [activeOffset, daysList]);

  // Filter users based on selected day
  const filteredUsers = useMemo(() => {
    if (activeOffset === null || !selectedDay) {
      return users;
    }
    return users.filter((u) => {
      const uDate = toISTDateString(u.last_active_at);
      return uDate === selectedDay.dateStr;
    });
  }, [users, activeOffset, selectedDay]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (!sortKey) return 0;
      let valA: string | number = a[sortKey] ?? "";
      let valB: string | number = b[sortKey] ?? "";

      if (sortKey === "total_value") {
        valA = Number(valA);
        valB = Number(valB);
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredUsers, sortKey, sortDir]);

  const handleImpersonate = async (userId: number) => {
    try {
      const data = await impersonateUser(userId);
      if (data.access_token) {
        const userAppUrl = process.env.NEXT_PUBLIC_USER_APP_URL || "http://localhost:3000";
        window.open(`${userAppUrl}/auth?impersonate_token=${data.access_token}`, "_blank");
      }
    } catch {
      alert("Failed to generate impersonation token.");
    }
  };

  const thClass =
    "px-6 py-3.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors";

  const targetDateStr = selectedDay ? selectedDay.dateStr : todayIST;
  const newOnTargetDate = filteredUsers.filter((u) => u.created_at?.startsWith(targetDateStr)).length;
  const returningOnTargetDate = filteredUsers.length - newOnTargetDate;

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-xs transition-colors flex flex-col">
      {/* Header and Day Filters */}
      <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
              <UserIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>
                Active {selectedDay ? selectedDay.label : "Across Last 7 Days"} (
                {filteredUsers.length} users)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {returningOnTargetDate}
              </span>{" "}
              returning &nbsp;·&nbsp;
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {newOnTargetDate}
              </span>{" "}
              new signups
              {selectedDay && (
                <span className="text-slate-400 font-mono ml-2">
                  ({selectedDay.formatted})
                </span>
              )}
            </p>
          </div>
          <Link
            href="/users?active_24=1"
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold transition-colors shrink-0"
          >
            View all in Directory →
          </Link>
        </div>

        {/* 7-Day Day Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Calendar size={13} />
            Day:
          </span>
          {daysList.map((day) => {
            const isSelected = activeOffset === day.offset;
            return (
              <button
                key={day.offset}
                onClick={() => handleSelectDay(day.offset)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>{day.label}</span>
                <span
                  className={`ml-1.5 text-[10px] font-mono ${
                    isSelected ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {day.weekday}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => handleSelectDay(null)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeOffset === null
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300"
            }`}
          >
            All 7 Days
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full min-w-[950px] text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08]">
            <tr>
              <th className={thClass} onClick={() => handleSort("full_name")}>
                Name <SortIcon col="full_name" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("email")}>
                Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("created_at")}>
                Joined <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thClass} onClick={() => handleSort("last_active_at")}>
                Last Active <SortIcon col="last_active_at" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wider">
                Total Active Days
              </th>
              <th className={`${thClass} text-right`} onClick={() => handleSort("total_value")}>
                Value (INR) <SortIcon col="total_value" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-right sticky right-0 bg-slate-50/95 dark:bg-[#0d121f]/95 backdrop-blur-xs z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.3)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                  No users recorded active for {selectedDay ? selectedDay.label : "the selected period"}.
                </td>
              </tr>
            ) : (
              sorted.map((user) => (
                <tr
                  key={user.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest("button") && !target.closest("a")) {
                      router.push(`/users/${user.id}`);
                    }
                  }}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 dark:text-slate-500 text-xs">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                    {user.last_active_at
                      ? new Date(user.last_active_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {user.total_active_days ?? 1}d
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {user.total_value > 0
                      ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right sticky right-0 bg-white/95 dark:bg-[#0d121f]/95 backdrop-blur-xs z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.3)]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImpersonate(user.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Login
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
        {sorted.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 py-6 text-sm">
            No users recorded active for {selectedDay ? selectedDay.label : "the selected period"}.
          </div>
        ) : (
          sorted.map((user) => (
            <div
              key={user.id}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest("button") && !target.closest("a")) {
                  router.push(`/users/${user.id}`);
                }
              }}
              className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] rounded-xl p-4 space-y-3.5 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {user.full_name || "N/A"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] px-2 py-0.5 rounded-md shrink-0">
                  #{user.id}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] p-2.5 rounded-lg text-center">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Active Days</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white font-mono mt-0.5">
                    {user.total_active_days ?? 1}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Portfolio Val</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {user.total_value > 0 ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Portfolios</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white font-mono mt-0.5">
                    {user.portfolio_count}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <div>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN") : "—"}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active:{" "}
                  {user.last_active_at
                    ? new Date(user.last_active_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.05]">
                <Link
                  href={`/users/${user.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200/70 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-800 dark:text-white transition-colors"
                >
                  Details
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImpersonate(user.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                >
                  <ExternalLink size={12} />
                  Login
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
