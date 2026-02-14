const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchStats() {
  const res = await fetch(`${API_URL}/admin/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchGrowthData() {
  const res = await fetch(`${API_URL}/admin/growth`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch growth data");
  return res.json();
}

export async function fetchUsers(skip = 0, limit = 50) {
  const res = await fetch(
    `${API_URL}/admin/users?skip=${skip}&limit=${limit}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchUserDetail(userId: string) {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user details");
  return res.json();
}

export async function fetchChats(skip = 0, limit = 50) {
  const res = await fetch(
    `${API_URL}/admin/chats?skip=${skip}&limit=${limit}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}
