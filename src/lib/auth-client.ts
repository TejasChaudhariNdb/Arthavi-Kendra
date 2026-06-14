const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof document !== "undefined") {
    // Basic regex to parse cookie
    const match = document.cookie.match(new RegExp("(^| )admin_token=([^;]+)"));
    if (match) return match[2];
  }
  return "";
}

export async function loginAdmin(credentials: {
  username: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function registerAdmin(data: {
  email: string;
  password: string;
  full_name: string;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function impersonateUser(userId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/${userId}/impersonate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to impersonate");
  return res.json();
}

export async function updateStock(
  symbol: string,
  updates: Record<string, unknown>,
) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/stocks/${symbol}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function fetchStocksClient(page = 1, limit = 50, search = "") {
  const token = getToken();
  const skip = (page - 1) * limit;
  const res = await fetch(
    `${API_URL}/admin/stocks/?skip=${skip}&limit=${limit}&search=${search}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
}

export async function fetchRefreshStatusClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/stocks/refresh-status`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export async function sendNotification(data: {
  title: string;
  body: string;
  send_to_all: boolean;
  user_ids?: number[];
  user_id?: number | null;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to send notification");
  }
  return res.json();
}

export async function exportUsersCsv() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/export`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to export users CSV");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportSlippingUsersCsv(days: number = 5) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/users/export-slipping?days=${days}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to export slipping users CSV");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `slipping_users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchAdminUpdatesClient() {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/updates`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch platform updates");
  return res.json();
}

export async function createAdminUpdateClient(data: {
  title: string;
  description: string;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/updates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to create update");
  }
  return res.json();
}

export async function updateAdminUpdateClient(
  id: number,
  data: {
    title: string;
    description: string;
    cta_text?: string;
    cta_link?: string;
    is_active: boolean;
  }
) {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/updates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to update platform announcement");
  }
  return res.json();
}
