"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ExternalLink,
  Send,
  UserX,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface WinBackUser {
  id: number;
  email: string;
  name: string;
  signup_source: string;
  signup_date: string | null;
  last_active_date: string | null;
  days_inactive: number;
  lifetime_active_days: number;
  has_push: boolean;
}

export default function WinBackUsersTable({
  users,
}: {
  users: WinBackUser[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pushOnly, setPushOnly] = useState(false);
  const [sentMap, setSentMap] = useState<Record<number, boolean>>({});

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPush = !pushOnly || u.has_push;
    return matchesSearch && matchesPush;
  });

  const handleSimulatePush = (id: number) => {
    setSentMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSentMap((prev) => ({ ...prev, [id]: false }));
    }, 4000);
  };

  return (
    <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs flex flex-col transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2">
              <UserX size={16} className="text-amber-500" />
              Win-Back & Slippage CRM List
            </h3>
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full font-semibold">
              {users.length} Candidates
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Users registered 30+ days ago with strong past engagement who haven&apos;t visited in 14+ days.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filter by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.03] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/[0.05]">
            <input
              type="checkbox"
              checked={pushOnly}
              onChange={(e) => setPushOnly(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <Bell size={12} className="text-indigo-500" />
            <span>Push Ready</span>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/[0.08] text-slate-400 font-semibold">
              <th className="py-2.5 px-3">User Profile</th>
              <th className="py-2.5 px-3">Signup Source</th>
              <th className="py-2.5 px-3 text-center">Days Inactive</th>
              <th className="py-2.5 px-3 text-center">Lifetime Active</th>
              <th className="py-2.5 px-3 text-center">FCM Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No slipping users found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isSent = sentMap[u.id];
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {u.email}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300">
                        {u.signup_source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.days_inactive >= 30
                            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {u.days_inactive}d quiet
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {u.lifetime_active_days} days
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {u.has_push ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle size={12} /> Push Ready
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          No Token
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.has_push && (
                          <button
                            onClick={() => handleSimulatePush(u.id)}
                            disabled={isSent}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              isSent
                                ? "bg-emerald-600 text-white cursor-default"
                                : "bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                            }`}
                          >
                            <Send size={11} />
                            {isSent ? "Dispatched" : "Notify"}
                          </button>
                        )}
                        <Link
                          href={`/users/${u.id}`}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                          title="View user details"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
