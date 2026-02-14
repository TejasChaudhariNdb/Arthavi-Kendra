const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof document !== "undefined") {
    // Basic regex to parse cookie
    const match = document.cookie.match(new RegExp("(^| )admin_token=([^;]+)"));
    if (match) return match[2];
  }
  return "";
}

export async function loginAdmin(credentials: any) {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function registerAdmin(data: any) {
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
