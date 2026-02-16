import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchAdminProfile() {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/admin/auth/me`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function fetchStocks(page = 1, limit = 50, search = "") {
  const headers = await getHeaders();
  const skip = (page - 1) * limit;
  const res = await fetch(
    `${API_URL}/admin/stocks/?skip=${skip}&limit=${limit}&search=${search}`,
    { headers, cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
}

export async function fetchRefreshStatus() {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/admin/stocks/refresh-status`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export async function fetchStats() {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/admin/stats`, {
    cache: "no-store",
    headers,
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchGrowthData() {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/admin/growth`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch growth data");
  return res.json();
}

export async function fetchUsers(skip = 0, limit = 50) {
  const headers = await getHeaders();
  const res = await fetch(
    `${API_URL}/admin/users?skip=${skip}&limit=${limit}`,
    {
      cache: "no-store",
      headers,
    },
  );
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchUserDetail(userId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch user details");
  return res.json();
}

export async function fetchChats(skip = 0, limit = 50) {
  const headers = await getHeaders();
  const res = await fetch(
    `${API_URL}/admin/chats?skip=${skip}&limit=${limit}`,
    {
      cache: "no-store",
      headers,
    },
  );
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function fetchReferrals() {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/admin/referrals`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch referral stats");
  return res.json();
}
