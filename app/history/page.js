"use client";

import { CrudSection } from "@/components/CrudSection";
import { fallbackTimelineEntries } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

const categories = ["결혼", "행사", "회식", "여행", "프로젝트", "기타"];

export default function HistoryPage() {
  return (
    <CrudSection
      title="D팀 역사"
      description="결혼, 행사, 회식, 여행, 프로젝트 같은 팀의 사건을 날짜 순으로 쌓는 타임라인이다."
      table="timeline_entries"
      orderBy="event_date"
      ascending={true}
      fallbackItems={fallbackTimelineEntries}
      select="*"
      submitLabel="역사 추가"
      emptyMessage="아직 기록이 없어요. 첫 사건을 추가해 주세요."
      reactionTargetType="timeline"
      reportTargetType="timeline"
      ownerField="author_id"
      targetType="timeline"
      fields={[
        { name: "title", label: "제목", type: "text", required: true, placeholder: "예: 첫 회식" },
        { name: "content", label: "내용", type: "textarea", required: true, placeholder: "어떤 일이 있었는지 적어주세요", wide: true },
        { name: "event_date", label: "날짜", type: "date", required: true },
        {
          name: "category",
          label: "카테고리",
          type: "select",
          required: true,
          options: categories.map((value) => ({ label: value, value })),
        },
        { name: "author_name", label: "작성자", type: "text", required: true, placeholder: "기록 담당" },
      ]}
      preparePayload={(payload) => ({ ...payload, status: "published" })}
      renderItem={(item, helpers) => (
        <article className="story-card">
          <div className="card-top">
            <span className="tag">{item.category ?? "기타"}</span>
            <span className="muted">{formatDate(item.event_date)}</span>
          </div>
          <h3 className="card-title">{item.title}</h3>
          <p className="card-body">{item.content}</p>
          <div className="card-footer" style={{ marginTop: 16 }}>
            <span className="muted">by {item.author_name ?? "미상"}</span>
            <div className="action-row">
              <button className="small-btn" type="button" onClick={helpers.onReact}>
                공감 {helpers.reactionCount > 0 ? `(${helpers.reactionCount})` : ""}
              </button>
              <button className="small-btn" type="button" onClick={helpers.onReport}>
                신고
              </button>
              {helpers.canDelete ? (
                <button className="danger" type="button" disabled={helpers.deleting} onClick={helpers.onDelete}>
                  {helpers.deleting ? "삭제 중..." : "삭제"}
                </button>
              ) : null}
            </div>
          </div>
        </article>
      )}
    />
  );
}
