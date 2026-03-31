import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabaseAdmin";
import {
  USER_SESSION_COOKIE,
  createUserSession,
  getUserCookieOptions,
  hashPassword,
  verifyPassword,
} from "@/lib/userSession";

export async function POST(request) {
  const { nickname, password } = await request.json();

  if (!nickname?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "닉네임과 비밀번호를 입력하세요." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다." }, { status: 500 });
  }

  const normalizedNickname = nickname.trim();
  const trimmedPassword = password.trim();

  const { data: existingUser, error: fetchError } = await supabase
    .from("user_accounts")
    .select("id, nickname, password_hash")
    .eq("nickname", normalizedNickname)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let user = existingUser;

  if (!user) {
    const { data: createdUser, error: createError } = await supabase
      .from("user_accounts")
      .insert([{ nickname: normalizedNickname, password_hash: hashPassword(trimmedPassword) }])
      .select("id, nickname")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    user = createdUser;
  } else if (!verifyPassword(trimmedPassword, user.password_hash)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const sessionToken = await createUserSession(user.id);
  const response = NextResponse.json({ ok: true, user: { id: user.id, nickname: user.nickname } });
  response.cookies.set(USER_SESSION_COOKIE, sessionToken, getUserCookieOptions());
  return response;
}
