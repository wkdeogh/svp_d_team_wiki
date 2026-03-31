import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/adminSession";
import { getAdminSupabase } from "@/lib/supabaseAdmin";

export async function GET(request) {
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

  const [reportsResult, guestbookCountResult, timelineCountResult, guestbookResult, timelineResult] = await Promise.all([
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("guestbook_entries").select("id", { count: "exact", head: true }),
    supabase.from("timeline_entries").select("id", { count: "exact", head: true }),
    supabase.from("guestbook_entries").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("timeline_entries").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const error =
    reportsResult.error ||
    guestbookCountResult.error ||
    timelineCountResult.error ||
    guestbookResult.error ||
    timelineResult.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    stats: {
      guestbook: guestbookCountResult.count ?? 0,
      timeline: timelineCountResult.count ?? 0,
      reports: reportsResult.data?.length ?? 0,
    },
    reports: reportsResult.data ?? [],
    guestbookEntries: guestbookResult.data ?? [],
    timelineEntries: timelineResult.data ?? [],
  });
}
