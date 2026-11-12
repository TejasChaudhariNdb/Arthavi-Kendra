import { NextResponse } from "next/server";

// BUG-019: clears the HttpOnly admin cookie. Browser code cannot clear an HttpOnly cookie itself.
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
