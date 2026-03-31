'use client';

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";

export function AdminConsole() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [reports, setReports] = useState([]);
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [stats, setStats] = useState({ guestbook: 0, timeline: 0, reports: 0 });
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    setCheckingSession(true);

    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await response.json();
      const nextAuthenticated = Boolean(data.authenticated);
      setAuthenticated(nextAuthenticated);

      if (nextAuthenticated) {
        await loadDashboard();
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    } finally {
      setCheckingSession(false);
    }
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setAuthenticated(false);
        }
        throw new Error(data.error || "관리자 데이터를 불러오지 못했습니다.");
      }

      setReports(data.reports ?? []);
      setGuestbookEntries(data.guestbookEntries ?? []);
      setTimelineEntries(data.timelineEntries ?? []);
      setStats(data.stats ?? { guestbook: 0, timeline: 0, reports: 0 });
    } catch (loadError) {
      setError(loadError.message || "관리자 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      setAuthenticated(true);
      setPassword("");
      setNotice("관리자 로그인에 성공했습니다.");
      await loadDashboard();
    } catch (loginError) {
      setError(loginError.message || "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    setError("");

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAuthenticated(false);
      setReports([]);
      setGuestbookEntries([]);
      setTimelineEntries([]);
      setStats({ guestbook: 0, timeline: 0, reports: 0 });
      setNotice("로그아웃했습니다.");
    } catch {
      setError("로그아웃에 실패했습니다.");
    }
  }

  async function resolveReport(report, action) {
    setError("");
    setNotice("");
    const nextBusyKey = `report:${report.id}:${action}`;
    setBusyKey(nextBusyKey);

    try {
      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          targetType: report.target_type,
          targetId: report.target_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "처리에 실패했습니다.");
      }

      setNotice(action === "delete" ? "게시물을 삭제했습니다." : "신고를 처리했습니다.");
      await loadDashboard();
    } catch (resolveError) {
      setError(resolveError.message || "신고 처리에 실패했습니다.");
    } finally {
      setBusyKey("");
    }
  }

  async function deleteContent(targetType, targetId) {
    setError("");
    setNotice("");
    const nextBusyKey = `delete:${targetType}:${targetId}`;
    setBusyKey(nextBusyKey);

    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetType, targetId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      setNotice("게시물을 삭제했습니다.");
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message || "삭제에 실패했습니다.");
    } finally {
      setBusyKey("");
    }
  }

  const isBusy = (key) => busyKey === key;

  if (checkingSession) {
    return (
      <section className="section-card">
        <div className="empty">관리자 세션을 확인하는 중...</div>
      </section>
    );
  }

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2 className="section-title" style={{ fontSize: 26 }}>
            관리자 콘솔
          </h2>
          <p className="section-description">관리자 비밀번호로 로그인한 뒤 신고를 처리하고 방명록과 역사 글을 삭제할 수 있습니다.</p>
        </div>
        <div className="toolbar">
          <span className="tag">{authenticated ? "로그인됨" : "로그인 필요"}</span>
          {authenticated ? (
            <button className="secondary" type="button" onClick={signOut}>
              로그아웃
            </button>
          ) : null}
        </div>
      </div>

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice" style={{ background: "#fef2f2", color: "#b91c1c" }}>{error}</div> : null}

      {!authenticated ? (
        <form className="panel" onSubmit={signIn}>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="password">관리자 비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>
          <div className="action-row" style={{ marginTop: 16 }}>
            <button className="primary" type="submit" disabled={!password || submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
      ) : null}

      {authenticated ? (
        <>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-value">{stats.guestbook}</p>
          <p className="stat-label">방명록 총 개수</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.timeline}</p>
          <p className="stat-label">역사 타임라인 총 개수</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.reports}</p>
          <p className="stat-label">열린 신고 개수</p>
        </div>
      </div>

      <div className="divider" />

      <div className="section-head">
        <div>
          <h3 className="section-title" style={{ fontSize: 22 }}>
            최근 게시물
          </h3>
          <p className="section-description">방명록과 D팀 역사 글을 바로 삭제할 수 있습니다.</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="section-head">
            <h4 className="section-title" style={{ fontSize: 18 }}>
              방명록
            </h4>
          </div>
          <div className="report-grid">
            {guestbookEntries.length === 0 ? <div className="empty">방명록이 없습니다.</div> : null}
            {guestbookEntries.map((item) => {
              const actionKey = `delete:guestbook:${item.id}`;
              return (
                <article key={item.id} className="report-card">
                  <div className="report-top">
                    <span className="tag">{item.name}</span>
                    <span className="muted">{formatDateTime(item.created_at)}</span>
                  </div>
                  <p className="report-reason">{item.message}</p>
                  <div className="action-row" style={{ marginTop: 12 }}>
                    <button className="danger" type="button" disabled={isBusy(actionKey)} onClick={() => deleteContent("guestbook", item.id)}>
                      {isBusy(actionKey) ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="section-head">
            <h4 className="section-title" style={{ fontSize: 18 }}>
              D팀 역사
            </h4>
          </div>
          <div className="report-grid">
            {timelineEntries.length === 0 ? <div className="empty">역사 글이 없습니다.</div> : null}
            {timelineEntries.map((item) => {
              const actionKey = `delete:timeline:${item.id}`;
              return (
                <article key={item.id} className="report-card">
                  <div className="report-top">
                    <span className="tag">{item.category}</span>
                    <span className="muted">{item.event_date}</span>
                  </div>
                  <p className="calendar-title">{item.title}</p>
                  <p className="report-reason">{item.content}</p>
                  <div className="action-row" style={{ marginTop: 12 }}>
                    <button className="danger" type="button" disabled={isBusy(actionKey)} onClick={() => deleteContent("timeline", item.id)}>
                      {isBusy(actionKey) ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="report-grid">
        {loading ? <div className="empty">검토 대기 목록을 불러오는 중...</div> : null}
        {!loading && reports.length === 0 ? <div className="empty">처리할 신고가 없습니다.</div> : null}
        {reports.map((report) => (
          <article key={report.id} className="report-card">
            <div className="report-top">
              <span className="tag">{report.target_type}</span>
              <span className="muted">{formatDateTime(report.created_at)}</span>
            </div>
            <p className="report-reason">{report.reason}</p>
            <div className="action-row" style={{ marginTop: 12 }}>
              <button className="primary" type="button" disabled={isBusy(`report:${report.id}:hide`)} onClick={() => resolveReport(report, "hide")}>
                숨김
              </button>
              <button className="secondary" type="button" disabled={isBusy(`report:${report.id}:publish`)} onClick={() => resolveReport(report, "publish")}>
                유지
              </button>
              <button className="danger" type="button" disabled={isBusy(`report:${report.id}:delete`)} onClick={() => resolveReport(report, "delete")}>
                삭제
              </button>
            </div>
          </article>
        ))}
      </div>
        </>
      ) : null}
    </section>
  );
}
