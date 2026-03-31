import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/adminSession";
import { deleteTargetContent } from "@/lib/contentModeration";
import { getAdminSupabase } from "@/lib/supabaseAdmin";

export async function DELETE(request) {
  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionValue(sessionValue)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다." },
      { status: 500 },
    );
  }

  try {
    const { targetType, targetId } = await request.json();
    await deleteTargetContent(supabase, targetType, targetId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "삭제에 실패했습니다." }, { status: 500 });
  }
}
