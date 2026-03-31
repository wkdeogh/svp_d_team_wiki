import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/adminSession";
import { getAdminSupabase } from "@/lib/supabaseAdmin";

const targetTableMap = {
  guestbook: "guestbook_entries",
  timeline: "timeline_entries",
  photo: "photos",
  member: "members",
  album: "photo_albums",
};

async function deleteTargetContent(supabase, targetType, targetId) {
  const table = targetTableMap[targetType];

  if (!table) {
    throw new Error("삭제할 대상 타입이 올바르지 않습니다.");
  }

  const [{ error: deleteTargetError }, { error: deleteReactionError }, { error: deleteReportError }] = await Promise.all([
    supabase.from(table).delete().eq("id", targetId),
    supabase.from("reactions").delete().eq("target_type", targetType).eq("target_id", targetId),
    supabase.from("reports").delete().eq("target_type", targetType).eq("target_id", targetId),
  ]);

  if (deleteTargetError || deleteReactionError || deleteReportError) {
    throw deleteTargetError || deleteReactionError || deleteReportError;
  }
}

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

export { deleteTargetContent };
