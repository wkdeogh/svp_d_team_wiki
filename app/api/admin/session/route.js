import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/adminSession";

export async function GET(request) {
  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return NextResponse.json({
    authenticated: verifyAdminSessionValue(sessionValue),
  });
}
