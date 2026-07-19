import { fetchBuyIdeas } from "@/lib/api";
import BuyIdeasPanelClient from "@/components/BuyIdeasPanelClient";

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
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Stocks Recommended
        </h1>
        <p className="text-gray-400 mt-2">
          Global MF and stock buy signals based on all user portfolio data.
        </p>
      </header>

      {buyIdeas ? (
        <BuyIdeasPanelClient initialData={buyIdeas} />
      ) : (
        <div className="text-red-550 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          Failed to load today&apos;s buy signals. Ensure backend is running.
        </div>
      )}
    </div>
  );
}
