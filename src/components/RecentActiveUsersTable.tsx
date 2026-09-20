"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, User as UserIcon, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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

export default function RecentActiveUsersTable({
  users,
  todayIST,
}: {
  users: User[];
  todayIST: string;
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey | null>("last_active_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...users].sort((a, b) => {
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

  const thClass = "px-6 py-3.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors";

  const newToday = users.filter(u => u.created_at?.startsWith(todayIST)).length;
  const returning = users.length - newToday;

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-xs transition-colors">
      <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
            <UserIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
            Active Today ({users.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{returning}</span> returning &nbsp;·&nbsp;
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{newToday}</span> new today
          </p>
        </div>
        <Link
          href="/users?active_24=1"
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold transition-colors"
        >
          View all in Directory →
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
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
              <th className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                  No users active in the last 24 hours.
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
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 dark:text-slate-500 text-xs">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                    {user.last_active_at
                      ? new Date(user.last_active_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "Just now"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-white font-semibold">
                    {user.total_active_days ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-slate-900 dark:text-white">
                    {user.total_value > 0 ? `₹${user.total_value.toLocaleString("en-IN")}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-xs font-semibold"
                      >
                        Details
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImpersonate(user.id);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer text-xs font-semibold"
                      >
                        <ExternalLink size={12} /> Login
                      </button>
                    </div>
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
            No users active in the last 24 hours.
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
              className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] rounded-xl p-4 space-y-3.5 transition-all cursor-pointer shadow-xs">
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
                  <div className="text-xs font-bold text-slate-800 dark:text-white font-mono mt-0.5">{user.total_active_days ?? 0}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Portfolio Val</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {user.total_value > 0 ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Portfolios</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white font-mono mt-0.5">{user.portfolio_count}</div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <div>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN") : "—"}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active: {user.last_active_at ? new Date(user.last_active_at).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"}) : "Just now"}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.05]">
                <Link
                  href={`/users/${user.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200/70 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-800 dark:text-white transition-colors">
                  Details
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImpersonate(user.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer">
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
