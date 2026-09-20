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
    <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] p-5 shadow-xs transition-colors">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
          <Icon size={20} />
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
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
      <div className="p-4 text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-center text-sm">
        Error loading goals. Ensure backend is running.
      </div>
    );
  }

  const { summary, recent_goals } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Target size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Goals</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
            User goal planning, target amounts, and upcoming maturity timelines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Goals"
          value={summary.total_goals}
          subtitle="All user-defined goals"
          icon={Target}
        />
        <SummaryCard
          title="Users With Goals"
          value={summary.users_with_goals}
          subtitle="Unique users with planning"
          icon={Users}
        />
        <SummaryCard
          title="Avg Target Amount"
          value={`₹${Math.round(summary.avg_target_amount).toLocaleString("en-IN")}`}
          subtitle="Average target value"
          icon={IndianRupee}
        />
        <SummaryCard
          title="Due In 2 Years"
          value={summary.goals_due_next_2_years}
          subtitle="Upcoming target deadlines"
          icon={CalendarClock}
        />
      </div>

      <section className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d121f] p-5 shadow-xs transition-colors">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Goals</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Latest user goals logged across the platform
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200/80 dark:border-white/[0.08]">
              <tr>
                <th className="rounded-l-lg px-4 py-3">Goal</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Target Amount</th>
                <th className="px-4 py-3 text-right">Target Year</th>
                <th className="rounded-r-lg px-4 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
              {recent_goals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                    No goals found.
                  </td>
                </tr>
              ) : (
                recent_goals.map((goal) => (
                  <tr key={goal.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{goal.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                        {goal.description || goal.icon || "No description"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/users/${goal.user.id}`}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {goal.user.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{goal.user.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {goal.target_amount ? `₹${Math.round(goal.target_amount).toLocaleString("en-IN")}` : "Flexible"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">{goal.target_year || "Flexible"}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right text-[11px] text-slate-400 dark:text-slate-500 font-mono">
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

