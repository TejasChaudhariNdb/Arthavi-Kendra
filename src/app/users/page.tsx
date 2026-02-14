import { fetchUsers } from "@/lib/api";
import UsersTableClient from "@/components/UsersTableClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let users = [];
  try {
    users = await fetchUsers();
  } catch (e) {
    return (
      <div className="text-white p-4">
        Error loading users. Ensure backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Users</h1>
        <div className="text-gray-400">
          Total: {users.length} (showing latest 50)
        </div>
      </div>

      <UsersTableClient initialUsers={users} />
    </div>
  );
}
