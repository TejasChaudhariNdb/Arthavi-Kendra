"use client";

import Link from "next/link";
import { ExternalLink, User as UserIcon } from "lucide-react";
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

export default function RecentActiveUsersTable({ users }: { users: User[] }) {
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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <UserIcon size={18} className="text-emerald-500" />
          Active Today ({users.length})
        </h3>
        <Link 
          href="/users?active_24=1" 
          className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
        >
          View all in Directory →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap text-xs">Name</th>
              <th className="px-6 py-4 whitespace-nowrap text-xs">Email</th>
              <th className="px-6 py-4 whitespace-nowrap text-xs">Last Active</th>
              <th className="px-6 py-4 whitespace-nowrap text-xs text-right">Value (INR)</th>
              <th className="px-6 py-4 whitespace-nowrap text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No users active in the last 24 hours.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-400">
                    {user.last_active_at || "Just now"}
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
