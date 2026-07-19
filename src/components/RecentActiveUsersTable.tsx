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
  if (sortKey !== col) return <ChevronsUpDown size={12} className="inline ml-1 text-gray-600" />;
  return sortDir === "asc"
    ? <ChevronUp size={12} className="inline ml-1 text-emerald-400" />
    : <ChevronDown size={12} className="inline ml-1 text-emerald-400" />;
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
    // date & string comparison
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

  const thClass = "px-6 py-4 whitespace-nowrap text-xs cursor-pointer select-none hover:text-white transition-colors";

  // Count new users who joined today (IST)
  const newToday     = users.filter(u => u.created_at?.startsWith(todayIST)).length;
  const returning    = users.length - newToday;

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg shadow-black/25">
      <div className="p-5 border-b border-gray-850/30 flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium flex items-center gap-2">
            <UserIcon size={18} className="text-emerald-500" />
            Active Today ({users.length})
          </h3>
          <p className="text-xs text-gray-550 mt-1">
            <span className="text-emerald-400 font-medium">{returning}</span> returning &nbsp;·&nbsp;
            <span className="text-indigo-400 font-medium">{newToday}</span> new today
          </p>
        </div>
        <Link
          href="/users?active_24=1"
          className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
        >
          View all in Directory →
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-950 text-gray-400 uppercase font-medium">
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
              <th className="px-6 py-4 whitespace-nowrap text-xs">
                Total Active Days
              </th>
              <th className={`${thClass} text-right`} onClick={() => handleSort("total_value")}>
                Value (INR) <SortIcon col="total_value" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-6 py-4 whitespace-nowrap text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-850/20">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                  className="hover:bg-gray-850 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-400">
                    {user.last_active_at
                      ? new Date(user.last_active_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "Just now"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                    {user.total_active_days ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                    {user.total_value > 0 ? `₹${user.total_value.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Details
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImpersonate(user.id);
                        }}
                        className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink size={14} /> Login
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
      <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
        {sorted.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
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
              className="bg-gray-950 rounded-xl p-4 space-y-4 hover:bg-gray-850/80 transition-all cursor-pointer shadow-md shadow-black/15">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">
                    {user.full_name || "N/A"}
                  </h4>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                </div>
                <span className="font-mono text-[9px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded shrink-0">
                  #{user.id}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-gray-900/50 p-2.5 rounded-lg text-center shadow-inner">
                <div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">Active Days</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">{user.total_active_days ?? 0}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">Portfolio Val</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                    {user.total_value > 0 ? `₹${Math.round(user.total_value).toLocaleString("en-IN")}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-550 uppercase tracking-wider">Portfolios</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">{user.portfolio_count}</div>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-gray-500">
                <div>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN") : "—"}</div>
                <div className="text-emerald-400 font-medium">
                  Active: {user.last_active_at ? new Date(user.last_active_at).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"}) : "Just now"}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-850/20">
                <Link
                  href={`/users/${user.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-xs font-semibold text-white transition-colors shadow-sm">
                  Details
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImpersonate(user.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-xs font-semibold text-purple-300 transition-colors cursor-pointer shadow-sm">
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
