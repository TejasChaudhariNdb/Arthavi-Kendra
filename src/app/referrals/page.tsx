import { fetchReferrals } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  let stats = { recent_referrals: [], top_referrers: [] };
  try {
    stats = await fetchReferrals();
  } catch (e) {
    return (
      <div className="text-white p-4">
        Error loading referrals. Ensure backend is running.
      </div>
    );
  }

  const { recent_referrals, top_referrers } = stats;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Referrals
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Referrers */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            Top Referrers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {top_referrers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  top_referrers.map((r: any, i: number) => (
                    <tr
                      key={r.code + i}
                      className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400">
                        {r.code}
                      </td>
                      <td className="px-4 py-3 text-right">{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Referrals
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Referee</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3 rounded-tr-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recent_referrals.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center">
                      No referrals yet
                    </td>
                  </tr>
                ) : (
                  recent_referrals.map((r: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">
                          {r.referee_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.referee_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">
                          {r.referrer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.referrer_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
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
