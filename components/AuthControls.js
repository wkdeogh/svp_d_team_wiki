'use client';

import { useState } from "react";
import { emitViewerChanged, useViewer } from "@/lib/useViewer";

export function AuthControls() {
  const { user, loading } = useViewer();
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const displayName = user?.nickname || "로그인 사용자";

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
      emitViewerChanged();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-controls">
      {loading ? <span className="auth-meta">로그인 확인 중...</span> : null}

      {!loading && !user ? (
        <div className="auth-login-box">
          <input
            className="auth-input"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임"
          />
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
          />
          <button className="secondary auth-button" type="button" onClick={signIn} disabled={submitting || !nickname.trim() || !password.trim()}>
            {submitting ? "확인 중..." : "로그인"}
          </button>
          <span className="auth-meta">처음이면 자동 가입</span>
          {error ? <span className="auth-error">{error}</span> : null}
        </div>
      ) : null}

      {!loading && user ? (
        <>
          <div className="auth-user-chip">
            <div className="auth-avatar auth-avatar-fallback">{displayName.slice(0, 1)}</div>
            <div className="auth-user-copy">
              <span className="auth-user-name">{displayName}</span>
              <span className="auth-meta">자동 로그인 유지</span>
            </div>
          </div>
          <button className="secondary auth-button" type="button" onClick={signOut} disabled={submitting}>
            로그아웃
          </button>
        </>
      ) : null}
    </div>
  );
}
