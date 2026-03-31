"use client";

import { CrudSection } from "@/components/CrudSection";
import { fallbackGuestbookEntries } from "@/lib/mockData";

export default function GuestbookPage() {
  return (
    <CrudSection
      title="방명록"
      description="누구나 짧은 인사나 근황을 남길 수 있는 공간이다."
      table="guestbook_entries"
      orderBy="created_at"
      ascending={false}
      fallbackItems={fallbackGuestbookEntries}
      select="*"
      submitLabel="방명록 남기기"
      emptyMessage="아직 방명록이 없어요. 첫 글을 남겨주세요."
      reactionTargetType="guestbook"
      reportTargetType="guestbook"
      fields={[
        { name: "name", label: "이름 또는 닉네임", type: "text", required: true, placeholder: "익명 가능" },
        { name: "message", label: "내용", type: "textarea", required: true, placeholder: "짧게 한마디 남겨주세요" },
      ]}
      renderItem={(item, helpers) => (
        <article className="story-card">
          <div className="card-top">
            <span className="tag">{item.name}</span>
            <span className="muted">{item.created_at ? new Date(item.created_at).toLocaleString("ko-KR") : "-"}</span>
          </div>
          <h3 className="card-title">{item.title ?? ""}</h3>
          <p className="card-body">{item.message}</p>
          <div className="card-footer" style={{ marginTop: 16 }}>
            <button className="small-btn" type="button" onClick={helpers.onReact}>
              공감 {helpers.reactionCount > 0 ? `(${helpers.reactionCount})` : ""}
            </button>
            <button className="small-btn" type="button" onClick={helpers.onReport}>
              신고
            </button>
          </div>
        </article>
      )}
    />
  );
}
