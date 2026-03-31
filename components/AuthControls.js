'use client';

import { useState } from "react";
import { useViewer } from "@/lib/useViewer";

export function AuthControls() {
  const { client, user, loading } = useViewer();
  const [submitting, setSubmitting] = useState(false);
  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.name || user?.email || "Google 사용자";

  async function signInWithGoogle() {
    if (!client) return;
    setSubmitting(true);

    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
      },
    });

    setSubmitting(false);
  }

  async function signOut() {
    if (!client) return;
    setSubmitting(true);
    await client.auth.signOut();
    setSubmitting(false);
  }

  return (
    <div className="auth-controls">
      {loading ? <span className="auth-meta">로그인 확인 중...</span> : null}

      {!loading && !user ? (
        <button className="secondary auth-button" type="button" onClick={signInWithGoogle} disabled={submitting || !client}>
          Google 로그인
        </button>
      ) : null}

      {!loading && user ? (
        <>
          <div className="auth-user-chip">
            {avatarUrl ? <img className="auth-avatar" src={avatarUrl} alt={displayName} /> : <div className="auth-avatar auth-avatar-fallback">G</div>}
            <div className="auth-user-copy">
              <span className="auth-user-name">{displayName}</span>
              <span className="auth-meta">내 글 삭제 가능</span>
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
