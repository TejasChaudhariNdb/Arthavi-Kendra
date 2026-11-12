import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// BUG-019: the admin token lives in an HttpOnly cookie that browser code cannot read. Browser calls
// go to this same-origin proxy, which adds the token on the server before forwarding to the API.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  const target = new URL(`${API_URL}/${path.map(encodeURIComponent).join("/")}`);
  req.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const init: RequestInit = { method: req.method, headers, cache: "no-store" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, init);

  const outHeaders = new Headers();
  for (const name of ["content-type", "content-disposition", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) outHeaders.set(name, value);
  }
  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: outHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
