"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const highlights = [
  ["/guestbook", "방명록", "누구나 짧게 기록하는 자유 공간"],
  ["/history", "D팀 역사", "결혼, 행사, 회식, 여행을 시간 순으로 기록"],
  ["/photos", "사진 아카이브", "앨범과 사진을 함께 보관"],
  ["/members", "멤버 소개", "동기들의 한줄 소개와 추억"],
  ["/calendar", "기념일 캘린더", "월별로 중요한 날을 훑기"],
  ["/admin", "관리", "신고와 상태 변경을 정리"],
];

export default function HomePage() {
  return (
    <div className="section-grid">
      <SiteHeader
        title="SVP D팀 위키"
        description="동기들의 결혼, 행사, 회식, 여행, 방명록을 시간 순으로 남기고, 사진과 멤버 정보까지 모으는 웹앱이다. Supabase와 Vercel 무료 플랜을 고려해 가볍고 단순하게 시작한다."
        primaryActionHref="/history"
        primaryActionLabel="역사 보기"
        secondaryActionHref="/guestbook"
        secondaryActionLabel="방명록 남기기"
      />

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title" style={{ fontSize: 26 }}>
              바로 시작할 수 있는 기능
            </h2>
            <p className="section-description">첫 출시에서 중요한 것부터 빠르게 만들고, 무료 플랜 범위 안에서 운영한다.</p>
          </div>
        </div>
        <div className="content-grid">
          {highlights.map(([href, title, desc]) => (
            <Link key={href} href={href} className="story-card">
              <span className="tag">{title}</span>
              <h3 className="card-title">{title}</h3>
              <p className="card-body">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title" style={{ fontSize: 26 }}>
              구현 우선순위
            </h2>
            <p className="section-description">방명록과 역사 타임라인을 먼저 완성하고, 사진과 캘린더를 이어 붙이는 순서로 진행한다.</p>
          </div>
        </div>
        <div className="panel">
          <ol className="muted" style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Supabase 스키마와 RLS 정책</li>
            <li>방명록 CRUD</li>
            <li>D팀 역사 CRUD + 날짜 오름차순</li>
            <li>사진 아카이브와 업로드</li>
            <li>멤버 소개, 캘린더, 관리자 콘솔</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
