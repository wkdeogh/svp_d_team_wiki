export const targetTableMap = {
  guestbook: "guestbook_entries",
  timeline: "timeline_entries",
  photo: "photos",
  member: "members",
  album: "photo_albums",
};

export const targetOwnerFieldMap = {
  guestbook: "author_id",
  timeline: "author_id",
  photo: "created_by",
  member: "created_by",
  album: "created_by",
};

export async function deleteTargetContent(supabase, targetType, targetId) {
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
