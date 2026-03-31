"use client";

import { CrudSection } from "@/components/CrudSection";
import { fallbackMembers } from "@/lib/mockData";

export default function MembersPage() {
  return (
    <CrudSection
      title="멤버 소개"
      description="SVP D팀 구성원들의 간단한 소개와 추억을 모으는 페이지다."
      table="members"
      orderBy="created_at"
      ascending={false}
      fallbackItems={fallbackMembers}
      select="*"
      submitLabel="멤버 저장"
      emptyMessage="아직 멤버 정보가 없습니다."
      ownerField="created_by"
      targetType="member"
      fields={[
        { name: "name", label: "이름", type: "text", required: true },
        { name: "nickname", label: "닉네임", type: "text", required: false },
        { name: "bio", label: "한줄 소개", type: "textarea", required: true },
        { name: "join_story", label: "입사 동기/기록", type: "textarea", required: true, wide: true },
        { name: "avatar_file", label: "대표 사진", type: "file", required: false, helperText: "이미지 파일 업로드", uploadTo: "avatar_url" },
      ]}
      storageBucket="photos"
      preparePayload={(payload) => ({ ...payload, status: "published" })}
      renderItem={(item, helpers) => (
        <article className="member-card">
          <div className="card-top">
            <span className="tag">{item.nickname || "D팀"}</span>
            <span className="muted">{item.created_at ? new Date(item.created_at).toLocaleDateString("ko-KR") : "-"}</span>
          </div>
          {item.avatar_url ? <img className="avatar" src={item.avatar_url} alt={item.name} /> : <div className="avatar" />}
          <h3 className="member-name">{item.name}</h3>
          <p className="member-bio">{item.bio}</p>
          <div className="divider" />
          <p className="member-bio">{item.join_story}</p>
          {helpers.canDelete ? <div className="divider" /> : null}
          {helpers.canDelete ? (
            <div className="action-row">
              <button className="danger" type="button" disabled={helpers.deleting} onClick={helpers.onDelete}>
                {helpers.deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          ) : null}
        </article>
      )}
    />
  );
}
