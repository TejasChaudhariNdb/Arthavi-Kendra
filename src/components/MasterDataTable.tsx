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
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowUpDown,
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
      {/* Monitor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] p-4.5 rounded-xl shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Data Health
            </div>
            <div
              className={`text-lg font-bold flex items-center gap-1.5 mt-0.5 ${status?.status === "Healthy" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {status?.status === "Healthy" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {status?.status || "Checking..."}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] p-4.5 rounded-xl shadow-xs transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Last Refresh
          </div>
          <div className="text-slate-900 dark:text-white font-mono text-base font-semibold mt-0.5">
            {status?.last_refresh
              ? new Date(status.last_refresh + "Z").toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                })
              : "Unknown"}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] p-4.5 rounded-xl shadow-xs transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Total Stocks
          </div>
          <div className="text-slate-900 dark:text-white font-mono text-xl font-bold mt-0.5">
            {(status?.total_stocks || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search symbol or name..."
            className="w-full bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={loadData}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer self-end sm:self-auto border border-slate-200/80 dark:border-white/[0.08]"
          title="Refresh Data">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200/80 dark:border-white/[0.08]">
              <tr>
                <th
                  onClick={() => handleSort("symbol")}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex items-center gap-1">
                    Symbol <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("long_name")}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex items-center gap-1">
                    Name <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("current_price")}
                  className="px-6 py-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    Price <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sector")}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                  <div className="flex items-center gap-1">
                    Sector <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                    Loading data...
                  </td>
                </tr>
              ) : sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                    No stocks found matching search.
                  </td>
                </tr>
              ) : (
                sortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-300">{stock.long_name}</td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{stock.current_price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.08] px-2 py-0.5 rounded text-[10px] font-semibold">
                        {stock.sector || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Edit Record">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs">
            Loading data...
          </div>
        ) : sortedStocks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs">
            No stocks found.
          </div>
        ) : (
          sortedStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 space-y-2.5 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{stock.symbol}</span>
                  <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{stock.long_name}</h4>
                </div>
                <button
                  onClick={() => handleEdit(stock)}
                  className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded cursor-pointer">
                  <Edit2 size={14} />
                </button>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 dark:border-white/[0.05]">
                <span className="bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                  {stock.sector || "N/A"}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{stock.current_price?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit {editingStock.symbol}
              </h3>
              <button
                onClick={() => setEditingStock(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  value={editForm.long_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, long_name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Current Price (INR)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Sector
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    value={editForm.sector || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sector: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
              <button
                onClick={() => setEditingStock(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50">
                <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
