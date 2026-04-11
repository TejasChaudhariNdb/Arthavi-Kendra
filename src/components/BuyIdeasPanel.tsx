import { fetchBuyIdeas } from "@/lib/api";
import { Layers, Target, TrendingUp } from "lucide-react";

export default async function BuyIdeasPanel() {
  let buyIdeas;
  try {
    buyIdeas = await fetchBuyIdeas();
  } catch {
    return (
      <div className="text-red-500">Failed to load today&apos;s buy signals.</div>
    );
  }

  const coverage = buyIdeas.coverage || {};
  const allocation = buyIdeas.allocation || {};
  const recommendations = buyIdeas.recommendations || [];
  const popularMutualFunds = buyIdeas.popular_mutual_funds || [];
  const popularStocks = buyIdeas.popular_stocks || [];

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
            <Target size={16} /> Today&apos;s Buy Signals
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Global admin view based on all user MF and stock holdings.
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Generated: {buyIdeas.generated_at || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            MF Users
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(coverage.mf_users || 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Stock Users
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(coverage.stock_users || 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            MF Share
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(allocation.mf_share_pct || 0).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Debt + Hybrid Share
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {Number(allocation.debt_hybrid_share_pct || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map(
              (item: {
                title: string;
                name?: string | null;
                meta?: string | null;
                instrument_type: string;
                priority: string;
                reason: string;
              }) => (
                <div
                  key={`${item.title}-${item.name ?? item.meta ?? "idea"}`}
                  className="rounded-xl border border-gray-800 bg-gray-800/30 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                          {item.instrument_type.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-300 bg-gray-700/70 px-2 py-1 rounded">
                          {item.priority}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mt-3">
                        {item.title}
                      </h4>
                      {item.name && (
                        <p className="text-emerald-300 font-medium mt-1">
                          {item.name}
                        </p>
                      )}
                      {item.meta && (
                        <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">
                          {item.meta}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              ),
            )
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5 text-gray-500">
              No buy signals available yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
            <h4 className="text-sm font-medium uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <Layers size={15} /> Popular Mutual Funds
            </h4>
            <div className="space-y-3 mt-4">
              {popularMutualFunds.length > 0 ? (
                popularMutualFunds.map(
                  (item: {
                    name: string;
                    bucket: string;
                    holders: number;
                    total_value: number;
                  }) => (
                    <div
                      key={item.name}
                      className="border-b border-gray-800 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="text-sm font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.bucket} • {item.holders} users
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ₹{Number(item.total_value || 0).toLocaleString()}
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="text-sm text-gray-500">No MF data found.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
            <h4 className="text-sm font-medium uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <TrendingUp size={15} /> Popular Stocks
            </h4>
            <div className="space-y-3 mt-4">
              {popularStocks.length > 0 ? (
                popularStocks.map(
                  (item: {
                    symbol: string;
                    sector: string;
                    holders: number;
                    total_value: number;
                  }) => (
                    <div
                      key={item.symbol}
                      className="border-b border-gray-800 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="text-sm font-medium text-white">
                        {item.symbol}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.sector} • {item.holders} users
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ₹{Number(item.total_value || 0).toLocaleString()}
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="text-sm text-gray-500">No stock data found.</div>
              )}
            </div>
          </div>

          {allocation.top_sector_name && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs uppercase tracking-wide text-amber-300">
                Sector concentration
              </p>
              <p className="text-white font-semibold mt-2">
                {allocation.top_sector_name}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {Number(allocation.top_sector_share_pct || 0).toFixed(1)}% of total stock value.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
