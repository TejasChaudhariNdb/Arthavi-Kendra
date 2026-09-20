import React from "react";
import { fetchDonations } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeartHandshake, Smartphone, Clock, User, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  let donations: Array<{
    id: number;
    user: { name: string; email: string; id: number };
    payment_app: string;
    created_at: string;
  }> = [];

  try {
    donations = await fetchDonations();
  } catch (err) {
    console.error("Failed to fetch donations", err);
  }

  // Quick stats
  const totalClicks = donations.length;
  const uniqueUsers = new Set(donations.map((d) => d.user?.id).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Support & UPI Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Monitor user intent signals for voluntary platform contribution via UPI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Support Clicks
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {totalClicks}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">intent clicks</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interested Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {uniqueUsers}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">unique supporters</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              UPI Intent Notice
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Clicks represent voluntary UPI app launches. Bank confirmations are completed via UPI protocol outside the app.
          </p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] px-5 py-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Support Click History
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Realtime log of members who opened donation links
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {donations.length === 0 ? (
            <EmptyState
              icon={HeartHandshake}
              title="No donation clicks logged yet"
              description="When users click on the voluntary UPI support button in Arthavi, they will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Payment App</th>
                    <th className="px-5 py-3.5">Clicked At</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
                  {donations.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {d.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {d.user?.email || "No email"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="indigo" size="sm" className="capitalize">
                          {d.payment_app || "UPI App"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {d.created_at}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {d.user?.id && (
                          <Link
                            href={`/users/${d.user.id}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            View User →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
