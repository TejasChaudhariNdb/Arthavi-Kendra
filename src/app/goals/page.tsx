import { fetchGoalsAdmin } from "@/lib/api";
import Link from "next/link";
import { Target, CalendarClock, Users, IndianRupee } from "lucide-react";

export const dynamic = "force-dynamic";

type GoalsResponse = {
  summary: {
    total_goals: number;
    users_with_goals: number;
    avg_target_amount: number;
    goals_due_next_2_years: number;
  };
  recent_goals: Array<{
    id: number;
    name: string;
    icon?: string | null;
    description?: string | null;
    target_amount: number;
    target_year?: number | null;
    created_at?: string | null;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
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
  icon: typeof Target;
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

export default async function GoalsAdminPage() {
  let data: GoalsResponse;

  try {
    data = (await fetchGoalsAdmin()) as GoalsResponse;
  } catch (error) {
    console.error("Failed to load goals admin page", error);
    return (
      <div className="p-4 text-white">
        Error loading goals. Ensure backend is running.
      </div>
    );
  }

  const { summary, recent_goals } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Goals</h1>
          <p className="mt-2 text-gray-400">
            A lighter admin view for user goal planning and upcoming target years.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Goals"
          value={summary.total_goals}
          subtitle="All goals created by users"
          icon={Target}
        />
        <SummaryCard
          title="Users With Goals"
          value={summary.users_with_goals}
          subtitle="Unique users who have at least one goal"
          icon={Users}
        />
        <SummaryCard
          title="Avg Target Amount"
          value={`₹${Math.round(summary.avg_target_amount).toLocaleString("en-IN")}`}
          subtitle="Average target amount across all goals"
          icon={IndianRupee}
        />
        <SummaryCard
          title="Due In 2 Years"
          value={summary.goals_due_next_2_years}
          subtitle="Goals with target years coming up soon"
          icon={CalendarClock}
        />
      </div>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-md">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Recent Goals</h2>
          <p className="mt-1 text-sm text-gray-400">
            Latest user goals so you can quickly inspect planning activity.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800 text-gray-200 uppercase">
              <tr>
                <th className="rounded-tl-xl px-4 py-3">Goal</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Target Amount</th>
                <th className="px-4 py-3">Target Year</th>
                <th className="rounded-tr-xl px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recent_goals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center">
                    No goals found.
                  </td>
                </tr>
              ) : (
                recent_goals.map((goal) => (
                  <tr key={goal.id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{goal.name}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {goal.description || goal.icon || "No description"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/users/${goal.user.id}`}
                        className="font-medium text-emerald-400 hover:text-emerald-300"
                      >
                        {goal.user.name}
                      </Link>
                      <div className="mt-1 text-xs text-gray-500">{goal.user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-white">
                      ₹{Math.round(goal.target_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4">{goal.target_year || "N/A"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs">
                      {goal.created_at || "N/A"}
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
