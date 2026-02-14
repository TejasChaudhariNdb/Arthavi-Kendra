import MasterDataTable from "@/components/MasterDataTable";
import { Database } from "lucide-react";

export const metadata = {
  title: "Master Data | Arthavi Admin",
};

export default function MasterDataPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-900/20 rounded-xl text-indigo-400">
          <Database size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Master Data</h1>
          <p className="text-gray-400 text-sm">
            Manage market data consistency and monitor update jobs
          </p>
        </div>
      </div>

      <MasterDataTable />
    </div>
  );
}
