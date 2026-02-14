"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
  portfolio_count: number;
  total_value: number;
}

interface UsersTableClientProps {
  initialUsers: User[];
}

type SortKey = keyof User;
type SortDirection = "asc" | "desc";

export default function UsersTableClient({
  initialUsers,
}: UsersTableClientProps) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);

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

  const filteredUsers = useMemo(() => {
    let result = [...initialUsers];

    // Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.full_name && u.full_name.toLowerCase().includes(q)),
      );
    }

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
  }, [initialUsers, search, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig?.key !== columnKey)
      return <ChevronsUpDown size={14} className="text-gray-600" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} className="text-emerald-500" />
    ) : (
      <ChevronDown size={14} className="text-emerald-500" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
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

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
              <tr>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("full_name")}>
                  <div className="flex items-center gap-2">
                    Name <SortIcon columnKey="full_name" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-2">
                    Email <SortIcon columnKey="email" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-2">
                    Joined <SortIcon columnKey="created_at" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-center whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("portfolio_count")}>
                  <div className="flex items-center justify-center gap-2">
                    Portfolios <SortIcon columnKey="portfolio_count" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right whitespace-nowrap cursor-pointer hover:bg-gray-900 transition-colors group"
                  onClick={() => handleSort("total_value")}>
                  <div className="flex items-center justify-end gap-2">
                    Total Value <SortIcon columnKey="total_value" />
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
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${user.portfolio_count > 0 ? "bg-blue-900 text-blue-300" : "bg-gray-800 text-gray-500"}`}>
                      {user.portfolio_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-emerald-400 whitespace-nowrap">
                    {user.total_value > 0
                      ? `₹${user.total_value.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                      View Details
                    </Link>
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
        Showing {filteredUsers.length} of {initialUsers.length} loaded users
      </div>
    </div>
  );
}
