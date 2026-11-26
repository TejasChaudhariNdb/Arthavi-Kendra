import { fetchDailyUsers } from "@/lib/api";
import DailyUsersClient from "@/components/DailyUsersClient";

export const dynamic = "force-dynamic";

export default async function DailyUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ dates?: string }>;
}) {
  const { dates } = await searchParams;
  const data = await fetchDailyUsers(dates).catch(() => null);
  if (!data) {
    return <div className="p-6 text-sm text-rose-500">Could not load daily users. Check the backend.</div>;
  }
  return <DailyUsersClient data={data} />;
}
