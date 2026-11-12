import { NextRequest, NextResponse } from "next/server";

// BUG-019: sets the admin token as an HttpOnly, Secure (in production), SameSite=Strict cookie.
// The token is never returned to browser code.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days; the API token itself lasts longer

export async function POST(req: NextRequest) {
  const body = await req.text();
  const upstream = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json({ detail: "Login failed" }, { status: upstream.status });
  }

  const data = await upstream.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
