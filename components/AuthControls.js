'use client';

import { useEffect, useState } from "react";
import { emitViewerChanged, useViewer } from "@/lib/useViewer";

export function AuthControls() {
  const { user, loading } = useViewer();
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayName = user?.nickname || "로그인 사용자";

  useEffect(() => {
    if (!loading && !user) {
      setIsModalOpen(true);
    }
  }, [loading, user]);

  async function signIn() {
    if (!nickname.trim() || !password.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      setPassword("");
      setError("");
      setIsModalOpen(false);
      emitViewerChanged();
    } catch (loginError) {
      setError(loginError.message || "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    setSubmitting(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsModalOpen(true);
      emitViewerChanged();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-controls">
      {!loading && !user ? (
        <button className="secondary auth-button" type="button" onClick={() => setIsModalOpen(true)}>
          로그인
        </button>
      ) : null}

      {!loading && user ? (
        <>
          <div className="auth-user-chip">
            <div className="auth-avatar auth-avatar-fallback">{displayName.slice(0, 1)}</div>
            <div className="auth-user-copy">
              <span className="auth-user-name">{displayName}</span>
            </div>
          </div>
          <button className="secondary auth-button" type="button" onClick={signOut} disabled={submitting}>
            로그아웃
          </button>
        </>
      ) : null}

      {!loading && !user && isModalOpen ? (
        <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <div className="auth-modal-card">
            <div className="auth-modal-head">
              <div>
                <p className="auth-modal-kicker">SVP D팀 위키</p>
                <h2 id="auth-modal-title" className="auth-modal-title">로그인</h2>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="로그인 창 닫기">
                닫기
              </button>
            </div>

            <div className="auth-modal-body">
              <input
                className="auth-modal-input"
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="닉네임"
              />
              <input
                className="auth-modal-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    signIn();
                  }
                }}
              />
              <button className="primary auth-modal-submit" type="button" onClick={signIn} disabled={submitting || !nickname.trim() || !password.trim()}>
                {submitting ? "확인 중..." : "로그인"}
              </button>
              {error ? <span className="auth-error">{error}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
