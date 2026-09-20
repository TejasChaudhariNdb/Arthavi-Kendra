import MasterDataTable from "@/components/MasterDataTable";
import { Database } from "lucide-react";

export const metadata = {
  title: "Master Data | Arthavi Admin",
};

export default function MasterDataPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Database size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Master Data</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
            Manage market instruments, price updates, and data health
          </p>
        </div>
      </div>

      <MasterDataTable />
    </div>
  );
}

