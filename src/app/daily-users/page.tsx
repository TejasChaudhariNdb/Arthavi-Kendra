import { fetchDailyUsers } from "@/lib/api";
import DailyUsersClient from "@/components/DailyUsersClient";

export const dynamic = "force-dynamic";

export default async function DailyUsersPage() {
  const data = await fetchDailyUsers().catch(() => null);
  if (!data) {
    return <div className="p-6 text-sm text-rose-500">Could not load daily users. Check the backend.</div>;
  }
  return <DailyUsersClient data={data} />;
}
