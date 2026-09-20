import { fetchBuyIdeas } from "@/lib/api";
import BuyIdeasPanelClient from "@/components/BuyIdeasPanelClient";
import { Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function BuySignalsPage() {
  let buyIdeas = null;
  try {
    buyIdeas = await fetchBuyIdeas();
  } catch (error) {
    console.error("Failed to fetch buy ideas", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Recommended Signals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Aggregated portfolio signals, asset distribution & algorithm-driven rebalance recommendations
            </p>
          </div>
        </div>
      </div>

      {buyIdeas ? (
        <BuyIdeasPanelClient initialData={buyIdeas} />
      ) : (
        <Card className="p-8 text-center border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex flex-col items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">Failed to load today&apos;s buy signals</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please ensure the backend API service is running.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
