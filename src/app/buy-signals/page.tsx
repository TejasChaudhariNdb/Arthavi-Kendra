import BuyIdeasPanel from "@/components/BuyIdeasPanel";

export const dynamic = "force-dynamic";

export default function BuySignalsPage() {
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

      <BuyIdeasPanel />
    </div>
  );
}
