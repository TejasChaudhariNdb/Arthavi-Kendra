import React from "react";
import { fetchDonations } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  let donations = [];
  try {
    donations = await fetchDonations();
  } catch (err) {
    console.error("Failed to fetch donations", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
          Support Tracker
        </h1>
        <p className="text-sm text-gray-400">
          Monitor users who clicked the &quot;Donate via UPI&quot; button. Note
          that these are intent clicks, actual payments are not confirmed here.
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
        {donations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 border-t border-gray-800">
            No donation clicks found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-950 text-gray-400 font-medium border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">App Selected</th>
                  <th className="px-6 py-4">Clicked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {donations.map(
                  (d: {
                    id: number;
                    user: { name: string; email: string; id: number };
                    payment_app: string;
                    created_at: string;
                  }) => (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {d.user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {d.user?.email} (ID: {d.user?.id})
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize font-semibold text-emerald-400">
                        {d.payment_app}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {d.created_at}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
