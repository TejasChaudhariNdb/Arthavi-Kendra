"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchDonations } from "@/lib/api";

type DonationType = {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  payment_app: string;
  created_at: string;
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const data = await fetchDonations();
        setDonations(data || []);
      } catch (err) {
        console.error("Failed to fetch donations", err);
      } finally {
        setLoading(false);
      }
    };
    loadDonations();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Support Tracker
          </h1>
          <p className="text-sm text-gray-500">
            Monitor users who clicked the &quot;Donate via UPI&quot; button. Note that
            these are intent clicks, actual payments are not confirmed here.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center border-t border-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border-t border-gray-100">
              No donation clicks found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">App Selected</th>
                    <th className="px-6 py-4">Clicked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {donations.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {d.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {d.user.email} (ID: {d.user.id})
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize font-semibold text-emerald-600">
                        {d.payment_app}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {d.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
