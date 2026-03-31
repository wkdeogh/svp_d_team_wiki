import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/adminSession";
import { deleteTargetContent, targetOwnerFieldMap, targetTableMap } from "@/lib/contentModeration";
import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getUserSession } from "@/lib/userSession";

export async function DELETE(request) {
  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAdmin = verifyAdminSessionValue(adminSession);
  const userSession = await getUserSession(request);

  if (!isAdmin && !userSession?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다." }, { status: 500 });
  }

  try {
    const { targetType, targetId } = await request.json();
    const table = targetTableMap[targetType];
    const ownerField = targetOwnerFieldMap[targetType];

    if (!table || !ownerField) {
      return NextResponse.json({ error: "삭제할 대상이 올바르지 않습니다." }, { status: 400 });
    }

    if (!isAdmin) {
      const { data: target, error: fetchError } = await supabase
        .from(table)
        .select(`id, ${ownerField}`)
        .eq("id", targetId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!target || target[ownerField] !== userSession.user.id) {
        return NextResponse.json({ error: "본인 글만 삭제할 수 있습니다." }, { status: 403 });
      }
    }

    await deleteTargetContent(supabase, targetType, targetId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "삭제에 실패했습니다." }, { status: 500 });
  }
}
