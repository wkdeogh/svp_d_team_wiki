import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "SVP D팀 위키",
  description: "SVP D팀의 방명록, 역사, 사진, 멤버 소개를 모은 위키",
};

const navItems = [
  ["/", "홈"],
  ["/guestbook", "방명록"],
  ["/history", "D팀 역사"],
  ["/photos", "사진 아카이브"],
  ["/members", "멤버 소개"],
  ["/calendar", "기념일 캘린더"],
  ["/admin", "관리"],
];

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div>
              <Link className="brand" href="/">
                SVP D팀 위키
              </Link>
              <p className="brand-subtitle">동기들의 기록을 한 곳에</p>
            </div>
            <nav className="nav">
              {navItems.map(([href, label]) => (
                <Link key={href} href={href} className="nav-link">
                  {label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="page-wrap">{children}</main>
          <footer className="footer">
            <span>SVP D팀의 기록을 모아두는 공간</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
