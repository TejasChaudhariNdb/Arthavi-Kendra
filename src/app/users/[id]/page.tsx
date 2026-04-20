import { fetchUserDetail, fetchUserActivity } from "@/lib/api";
import UserDetailClient from "@/components/UserDetailClient";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; chatId?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  let data, activity;
  try {
    [data, activity] = await Promise.all([
      fetchUserDetail(id),
      fetchUserActivity(id).catch(() => null), // Catch errors so page still works if tracking missing
    ]);
    console.log(activity);
  } catch (e) {
    return (
      <div className="p-8 text-center text-red-500 bg-gray-900 border border-gray-800 rounded-xl">
        <h3 className="text-lg font-bold">Error loading user details</h3>
        <p className="text-sm mt-2">
          {e instanceof Error ? e.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const initialTab =
    sp.tab === "chats" || sp.tab === "holdings" ? sp.tab : "overview";
  const initialChatId =
    sp.chatId && !Number.isNaN(Number(sp.chatId)) ? Number(sp.chatId) : null;

  return (
    <UserDetailClient
      data={data}
      activity={activity}
      initialTab={initialTab}
      initialChatId={initialChatId}
    />
  );
}
