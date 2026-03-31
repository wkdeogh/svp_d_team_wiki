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
            <span className="muted">모바일에서도 편하게</span>
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
            한눈에 보기
          </h2>
          <p className="section-subtitle" style={{ marginTop: 8 }}>
            방명록, 역사, 사진, 멤버 소개, 기념일을 한 곳에서 볼 수 있어요.
          </p>
        </div>
      </aside>
    </section>
  );
}
