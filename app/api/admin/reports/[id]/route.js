import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/adminSession";
import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { deleteTargetContent } from "@/app/api/admin/content/route";

const targetTableMap = {
  guestbook: "guestbook_entries",
  timeline: "timeline_entries",
  photo: "photos",
  member: "members",
  album: "photo_albums",
};

export async function PATCH(request, { params }) {
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
    const { action, targetType, targetId } = await request.json();
    const table = targetTableMap[targetType];

    if (!table) {
      return NextResponse.json({ error: "대상 타입이 올바르지 않습니다." }, { status: 400 });
    }

    if (action === "delete") {
      await deleteTargetContent(supabase, targetType, targetId);
      return NextResponse.json({ ok: true });
    }

    const nextStatus = action === "hide" ? "hidden" : "published";
    const [{ error: targetError }, { error: reportError }] = await Promise.all([
      supabase.from(table).update({ status: nextStatus }).eq("id", targetId),
      supabase.from("reports").update({ status: "resolved" }).eq("id", params.id),
    ]);

    if (targetError || reportError) {
      throw targetError || reportError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "처리에 실패했습니다." }, { status: 500 });
  }
}
