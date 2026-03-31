import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  getAdminCookieOptions,
  hasAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/adminSession";

export async function POST(request) {
  if (!hasAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD 환경변수가 필요합니다." },
      { status: 500 },
    );
  }

  const { password } = await request.json();

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), getAdminCookieOptions());
  return response;
}
