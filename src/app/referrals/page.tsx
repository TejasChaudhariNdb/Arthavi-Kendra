import { fetchReferrals } from "@/lib/api";
import { Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  let stats = { recent_referrals: [], top_referrers: [] };
  try {
    stats = await fetchReferrals();
  } catch (e) {
    return (
      <div className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-6 text-center text-sm">
        Error loading referrals. Ensure backend is running.
      </div>
    );
  }

  const { recent_referrals, top_referrers } = stats;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Gift size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Referrals & Viral Loops
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
            Track top referrers, invites sent, and user conversion stats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Top Referrers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200/80 dark:border-white/[0.08]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                {top_referrers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                      No referral records found.
                    </td>
                  </tr>
                ) : (
                  top_referrers.map((r: any, i: number) => (
                    <tr
                      key={r.code + i}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {r.code}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Recent Referrals
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200/80 dark:border-white/[0.08]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Referee</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                {recent_referrals.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                      No referrals yet.
                    </td>
                  </tr>
                ) : (
                  recent_referrals.map((r: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {r.referee_name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {r.referee_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {r.referrer_name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {r.referrer_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        {r.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

