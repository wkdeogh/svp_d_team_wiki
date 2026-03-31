"use client";

import Image from "next/image";
import Link from "next/link";
import homeImage from "../home_image.jpeg";

const heroTags = ["결혼", "행사", "회식", "여행", "사진", "기념일"];

const highlights = [
  {
    href: "/history",
    eyebrow: "대표 기록",
    title: "D팀 역사",
    description: "결혼, 행사, 회식, 여행을 시간 순으로 정리해요.",
    className: "home-feature-wide",
  },
  {
    href: "/guestbook",
    eyebrow: "자유롭게",
    title: "방명록",
    description: "짧은 인사와 근황을 자유롭게 남겨요.",
  },
  {
    href: "/photos",
    eyebrow: "앨범",
    title: "사진 아카이브",
    description: "행사와 모임 사진을 앨범별로 모아봐요.",
  },
  {
    href: "/members",
    eyebrow: "우리 팀",
    title: "멤버 소개",
    description: "동기들의 소개와 기억하고 싶은 이야기를 담아요.",
  },
  {
    href: "/calendar",
    eyebrow: "중요한 날",
    title: "기념일 캘린더",
    description: "중요한 날짜를 한눈에 보고 챙겨요.",
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">SVP D Team</p>
          <h1 className="home-title">우리 팀의 시간을 모아두는 곳</h1>
          <p className="home-description">결혼, 행사, 여행, 회식, 그리고 그날의 사진까지.</p>
          <div className="hero-actions">
            <Link className="cta" href="/history">
              역사 보기
            </Link>
            <Link className="ghost" href="/photos">
              사진 보기
            </Link>
          </div>
          <div className="home-tag-row">
            {heroTags.map((tag) => (
              <span key={tag} className="home-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="home-hero-visual">
          <Image
            src={homeImage}
            alt="SVP D팀 홈 이미지"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 48vw"
            className="home-hero-image"
          />
          <div className="home-hero-overlay" />
          <div className="home-floating-panel home-floating-top">
            <span className="home-floating-label">SVP D팀</span>
            <strong className="home-floating-title">같이 보낸 시간들을 차곡차곡</strong>
          </div>
          <div className="home-floating-panel home-floating-bottom">
            <div>
              <p className="home-floating-meta">추천 시작점</p>
              <strong className="home-floating-title">D팀 역사</strong>
            </div>
            <Link href="/history" className="small-btn">
              바로 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="home-feature-grid">
        {highlights.map((item) => (
          <Link key={item.href} href={item.href} className={`home-feature-card ${item.className ?? ""}`}>
            <p className="home-feature-eyebrow">{item.eyebrow}</p>
            <h2 className="home-feature-title">{item.title}</h2>
            <p className="home-feature-description">{item.description}</p>
            <span className="home-feature-link">둘러보기</span>
          </Link>
        ))}
      </section>

      <section className="home-bottom-strip">
        <div className="home-bottom-card">
          <p className="home-bottom-label">남기기</p>
          <div className="home-bottom-actions">
            <Link href="/guestbook" className="small-btn">
              방명록
            </Link>
            <Link href="/history" className="small-btn">
              역사 추가
            </Link>
            <Link href="/photos" className="small-btn">
              사진 올리기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
