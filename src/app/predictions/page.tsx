import { fetchPredictionsMeta, fetchPredictionsUsers } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, Users, Target, Activity } from "lucide-react";

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

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
          <Icon size={20} />
        </div>
      </div>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

export default async function PredictionsAdminPage() {
  let meta: PredictionsMeta;
  let usersList: PredictionUser[];

  try {
    [meta, usersList] = await Promise.all([
      fetchPredictionsMeta(),
      fetchPredictionsUsers(),
    ]);
  } catch (error) {
    console.error("Failed to load predictions admin page", error);
    return (
      <div className="p-4 text-white">
        Error loading predictions. Ensure backend is running.
      </div>
    );
  }

  // Find user with highest streak
  const highestStreak = usersList.length > 0 ? Math.max(...usersList.map((u) => u.streak)) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={32} /> Market Predictions
          </h1>
          <p className="mt-2 text-gray-400">
            Keep track of user prediction performance, active streaks, and engagement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Active Participants"
          value={meta.users_with_prediction}
          subtitle="Users who have made at least 1 prediction"
          icon={Users}
        />
        <SummaryCard
          title="Avg Player Streak"
          value={`🔥 ${meta.avg_streak.toFixed(1)}`}
          subtitle="Average current streak among participants"
          icon={Activity}
        />
        <SummaryCard
          title="Today's Volume"
          value={meta.today_predictions}
          subtitle="Number of predictions made today"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Highest Streak"
          value={`🏆 ${highestStreak}`}
          subtitle="Best active streak running right now"
          icon={Target}
        />
      </div>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-md">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Leaderboard & Stats</h2>
            <p className="mt-1 text-sm text-gray-400">
              User breakdown sorted by current streak and total predictions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800/80 text-gray-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="rounded-tl-xl px-4 py-4">User</th>
                <th className="px-4 py-4 text-center">Active Streak</th>
                <th className="px-4 py-4 text-center">Total Predictions</th>
                <th className="rounded-tr-xl px-4 py-4 text-center">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No predictions yet.
                  </td>
                </tr>
              ) : (
                usersList.map((user, index) => (
                  <tr key={user.id} className={`hover:bg-gray-800/40 transition-colors ${index < 3 ? 'bg-gray-800/20' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <Link
                            href={`/users/${user.id}`}
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            {user.full_name || "Anonymous User"}
                          </Link>
                          <div className="mt-0.5 text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {user.streak > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 border border-orange-500/20">
                          🔥 {user.streak}
                        </span>
                      ) : (
                        <span className="text-gray-600 font-medium">0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-300 font-medium">
                      {user.total_predictions}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.win_rate >= 50 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {user.win_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
