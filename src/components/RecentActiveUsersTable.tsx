"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, User as UserIcon, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { impersonateUser } from "@/lib/auth-client";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
  last_active_at: string | null;
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

export default function RecentActiveUsersTable({ users }: { users: User[] }) {
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
        window.open(`${userAppUrl}/login?impersonate_token=${data.access_token}`, "_blank");
      }
    } catch {
      alert("Failed to generate impersonation token.");
    }
  };

  const thClass = "px-6 py-4 whitespace-nowrap text-xs cursor-pointer select-none hover:text-white transition-colors";

  // Count new users who joined today (IST)
  const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const newToday     = users.filter(u => u.created_at?.startsWith(todayIST)).length;
  const returning    = users.length - newToday;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium flex items-center gap-2">
            <UserIcon size={18} className="text-emerald-500" />
            Active Today ({users.length})
          </h3>
          <p className="text-xs text-gray-500 mt-1">
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

      <div className="overflow-x-auto">
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
              <th className={`${thClass} text-right`} onClick={() => handleSort("total_value")}>
                Value (INR) <SortIcon col="total_value" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-6 py-4 whitespace-nowrap text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users active in the last 24 hours.
                </td>
              </tr>
            ) : (
              sorted.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
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
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                    {user.total_value > 0 ? `₹${user.total_value.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-3">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleImpersonate(user.id)}
                      className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                    >
                      <ExternalLink size={14} /> Login
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
