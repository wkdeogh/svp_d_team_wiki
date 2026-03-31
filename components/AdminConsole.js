'use client';

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { fallbackReports, fallbackGuestbookEntries, fallbackTimelineEntries } from "@/lib/mockData";
import { formatDateTime } from "@/lib/utils";

const targetTables = {
  guestbook: "guestbook_entries",
  timeline: "timeline_entries",
  photo: "photos",
  member: "members",
  album: "photo_albums",
};

export function AdminConsole() {
  const client = useMemo(() => getBrowserSupabase(), []);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);
  const [reports, setReports] = useState(fallbackReports);
  const [stats, setStats] = useState({ guestbook: 0, timeline: 0 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      if (!client) {
        if (active) {
          setReports(fallbackReports);
          setStats({ guestbook: fallbackGuestbookEntries.length, timeline: fallbackTimelineEntries.length });
          setLoading(false);
        }
        return;
      }

      const [{ data: reportRows }, { count: guestbookCount }, { count: timelineCount }] = await Promise.all([
        client.from("reports").select("*").order("created_at", { ascending: false }),
        client.from("guestbook_entries").select("id", { count: "exact", head: true }),
        client.from("timeline_entries").select("id", { count: "exact", head: true }),
      ]);

      if (active) {
        setReports(reportRows ?? []);
        setStats({ guestbook: guestbookCount ?? 0, timeline: timelineCount ?? 0 });
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [client]);

  async function signIn() {
    if (!client) return;
    setError("");
    const { error: signInError } = await client.auth.signInWithOtp({ email });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setNotice("로그인 링크를 보냈어요. 메일함을 확인해 주세요.");
  }

  async function resolveReport(report, status) {
    if (!client) return;
    const table = targetTables[report.target_type];
    if (!table) return;

    const [{ error: updateError }, { error: reportError }] = await Promise.all([
      client.from(table).update({ status }).eq("id", report.target_id),
      client.from("reports").update({ status: "resolved" }).eq("id", report.id),
    ]);

    if (updateError || reportError) {
      setError(updateError?.message || reportError?.message || "업데이트 실패");
      return;
    }

    setNotice("검토 상태를 반영했어요.");
    setReports((current) => current.filter((item) => item.id !== report.id));
  }

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2 className="section-title" style={{ fontSize: 26 }}>
            관리자 콘솔
          </h2>
          <p className="section-description">Supabase Auth로 로그인한 뒤 신고 처리와 상태 변경을 할 수 있게 준비한다.</p>
        </div>
        <span className="tag">{session ? "로그인됨" : "로그인 필요"}</span>
      </div>

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice" style={{ background: "#fef2f2", color: "#b91c1c" }}>{error}</div> : null}

      {!session ? (
        <div className="panel">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="email">관리자 이메일</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
            </div>
          </div>
          <div className="action-row" style={{ marginTop: 16 }}>
            <button className="primary" type="button" onClick={signIn} disabled={!email}>
              로그인 링크 보내기
            </button>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-value">{stats.guestbook}</p>
          <p className="stat-label">방명록 총 개수</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.timeline}</p>
          <p className="stat-label">역사 타임라인 총 개수</p>
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
              <button className="primary" type="button" onClick={() => resolveReport(report, "hidden")}>
                숨김
              </button>
              <button className="secondary" type="button" onClick={() => resolveReport(report, "published")}>
                유지
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
