import { NextResponse } from "next/server";
import { deleteUserSession, getUserCookieOptions, USER_SESSION_COOKIE } from "@/lib/userSession";

export async function POST(request) {
  const sessionToken = request.cookies.get(USER_SESSION_COOKIE)?.value;
  await deleteUserSession(sessionToken);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(USER_SESSION_COOKIE, "", getUserCookieOptions(0));
  return response;
}
