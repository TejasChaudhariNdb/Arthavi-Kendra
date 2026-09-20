import { fetchPredictionsMeta, fetchPredictionsUsers } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, Users, Target, Activity, Trophy, Flame, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

type PredictionsMeta = {
  users_with_prediction: number;
  avg_streak: number;
  today_predictions: number;
};

type PredictionUser = {
  id: number;
  email: string;
  full_name: string | null;
  streak: number;
  total_predictions: number;
  win_rate: number;
};

export default async function PredictionsAdminPage() {
  let meta: PredictionsMeta = {
    users_with_prediction: 0,
    avg_streak: 0,
    today_predictions: 0,
  };
  let usersList: PredictionUser[] = [];

  try {
    const [m, u] = await Promise.all([
      fetchPredictionsMeta(),
      fetchPredictionsUsers(),
    ]);
    meta = m || meta;
    usersList = u || [];
  } catch (error) {
    console.error("Failed to load predictions admin page", error);
    return (
      <Card className="p-8 text-center border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
        <div className="flex flex-col items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-semibold">Error loading predictions</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Please ensure the backend server is running.</p>
        </div>
      </Card>
    );
  }

  const highestStreak = usersList.length > 0 ? Math.max(...usersList.map((u) => u.streak || 0)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Market Predictions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              User prediction performance, active streaks, and community engagement
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Participants
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {meta.users_with_prediction}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">users with &gt;=1 guess</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Player Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {Number(meta.avg_streak || 0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">consecutive wins</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {meta.today_predictions}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">predictions</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Highest Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {highestStreak}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">best active streak</span>
          </div>
        </Card>
      </div>

      {/* Leaderboard Table Card */}
      <Card>
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard & Prediction Roster
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by active winning streak and prediction accuracy
              </CardDescription>
            </div>
            <Badge variant="neutral" size="sm">
              {usersList.length} Players
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usersList.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No predictions yet"
              description="When users make market prediction guesses in the Arthavi app, they will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-3.5 w-16 text-center">Rank</th>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5 text-center">Active Streak</th>
                    <th className="px-5 py-3.5 text-center">Total Predictions</th>
                    <th className="px-5 py-3.5 text-center">Win Rate</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
                  {usersList.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-bold text-xs ${
                            index === 0
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 shadow-sm"
                              : index === 1
                              ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                              : index === 2
                              ? "bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/users/${user.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {user.full_name || "Anonymous User"}
                        </Link>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {user.streak > 0 ? (
                          <Badge variant="amber" size="sm">
                            🔥 {user.streak}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-slate-900 dark:text-white">
                        {user.total_predictions}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge
                          variant={user.win_rate >= 50 ? "emerald" : "rose"}
                          size="sm"
                        >
                          {Number(user.win_rate || 0).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/users/${user.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Profile →
                        </Link>
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
