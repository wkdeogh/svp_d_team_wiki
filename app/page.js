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
        description="동기들의 결혼, 행사, 회식, 여행, 방명록을 시간 순으로 남기고, 사진과 멤버 정보까지 모아두는 공간이다."
        primaryActionHref="/history"
        primaryActionLabel="역사 보기"
        secondaryActionHref="/guestbook"
        secondaryActionLabel="방명록 남기기"
      />

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title" style={{ fontSize: 26 }}>
              주요 메뉴
            </h2>
            <p className="section-description">방명록부터 타임라인, 사진과 멤버 소개까지 필요한 메뉴를 바로 갈 수 있어요.</p>
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

    </div>
  );
}
