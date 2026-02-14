"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchStocksClient,
  updateStock,
  fetchRefreshStatusClient,
} from "@/lib/auth-client";
import {
  Search,
  Edit2,
  RefreshCw,
  X,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Stock {
  symbol: string;
  long_name: string;
  current_price: number | null;
  sector: string | null;
  industry: string | null;
  last_updated: string | null;
}

interface RefreshStatus {
  last_refresh: string | null;
  total_stocks: number;
  status: "Healthy" | "Stale";
}

export default function MasterDataTable() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RefreshStatus | null>(null);
  const [page] = useState(1);

  // Edit State
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [editForm, setEditForm] = useState<Partial<Stock>>({});
  const [saving, setSaving] = useState(false);

  // Sort State
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stock;
    direction: "asc" | "desc";
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStocksClient(page, 50, search);
      setStocks(data.items || []);

      const statusData = await fetchRefreshStatusClient();
      setStatus(statusData);
    } catch (_) {
      // ignore error
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSort = (key: keyof Stock) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    if (aVal < bVal!) return direction === "asc" ? -1 : 1;
    if (aVal > bVal!) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setEditForm({
      long_name: stock.long_name,
      sector: stock.sector,
      industry: stock.industry,
      current_price: stock.current_price,
    });
  };

  const handleSave = async () => {
    if (!editingStock) return;
    setSaving(true);
    try {
      await updateStock(editingStock.symbol, editForm);
      // Update local state
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === editingStock.symbol
            ? ({ ...s, ...editForm } as Stock)
            : s,
        ),
      );
      setEditingStock(null);
    } catch (_) {
      alert("Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Monitor Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs uppercase font-medium">
              Data Health
            </div>
            <div
              className={`text-lg font-bold flex items-center gap-2 ${status?.status === "Healthy" ? "text-emerald-400" : "text-amber-400"}`}>
              {status?.status === "Healthy" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {status?.status || "Checking..."}
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-gray-500 text-xs uppercase font-medium">
            Last Refresh
          </div>
          <div className="text-white font-mono text-lg">
            {status?.last_refresh
              ? new Date(status.last_refresh + "Z").toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
              : "Unknown"}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-gray-500 text-xs uppercase font-medium">
            Total Stocks
          </div>
          <div className="text-white font-mono text-lg">
            {status?.total_stocks || 0}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search stocks..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={loadData}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
              <tr>
                <th
                  onClick={() => handleSort("symbol")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1">
                    Symbol{" "}
                    {sortConfig?.key === "symbol" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("long_name")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1">
                    Name{" "}
                    {sortConfig?.key === "long_name" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("current_price")}
                  className="px-6 py-4 text-right cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    Price{" "}
                    {sortConfig?.key === "current_price" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sector")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1">
                    Sector{" "}
                    {sortConfig?.key === "sector" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    Loading data...
                  </td>
                </tr>
              ) : sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    No stocks found.
                  </td>
                </tr>
              ) : (
                sortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-mono text-white">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-4">{stock.long_name}</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">
                      ₹{stock.current_price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                        {stock.sector || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-indigo-400 hover:text-white transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls could go here */}

      {/* Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">
                Edit {editingStock.symbol}
              </h3>
              <button
                onClick={() => setEditingStock(null)}
                className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  value={editForm.long_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, long_name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Current Price
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                    value={editForm.current_price || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        current_price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Sector
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                    value={editForm.sector || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sector: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingStock(null)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
