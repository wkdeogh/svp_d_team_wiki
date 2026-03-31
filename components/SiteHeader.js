"use client";

import Link from "next/link";

const quickLinks = [
  ["/guestbook", "방명록"],
  ["/history", "역사"],
  ["/photos", "사진"],
  ["/members", "멤버"],
  ["/calendar", "캘린더"],
];

export function SiteHeader({ title, description, primaryActionHref, primaryActionLabel, secondaryActionHref, secondaryActionLabel }) {
  return (
    <section className="hero">
      <div>
        <span className="badge">무료 플랜 대응 MVP</span>
        <h1>{title}</h1>
        <p className="section-subtitle">{description}</p>
        <div className="hero-actions" style={{ marginTop: 18 }}>
          {primaryActionHref ? (
            <Link className="cta" href={primaryActionHref}>
              {primaryActionLabel}
            </Link>
          ) : null}
          {secondaryActionHref ? (
            <Link className="ghost" href={secondaryActionHref}>
              {secondaryActionLabel}
            </Link>
          ) : null}
        </div>
      </div>
      <aside className="hero-aside">
        <div className="panel">
          <div className="summary-row">
            <span className="tag">빠른 이동</span>
            <span className="muted">모바일도 동일</span>
          </div>
          <div className="chip-row" style={{ marginTop: 10 }}>
            {quickLinks.map(([href, label]) => (
              <Link key={href} href={href} className="small-btn">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title" style={{ fontSize: 18 }}>
            이번 릴리즈
          </h2>
          <p className="section-subtitle" style={{ marginTop: 8 }}>
            방명록, D팀 역사, 사진 아카이브, 멤버 소개, 기념일 캘린더, 관리 기능을 순차적으로 붙여나가는 구조로 시작한다.
          </p>
        </div>
      </aside>
    </section>
  );
}
