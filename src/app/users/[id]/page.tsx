import { fetchUserDetail } from "@/lib/api";
import UserDetailClient from "@/components/UserDetailClient";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;
  try {
    data = await fetchUserDetail(id);
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

  // Pass all data to Client Component for interactive UI
  return <UserDetailClient data={data} />;
}
