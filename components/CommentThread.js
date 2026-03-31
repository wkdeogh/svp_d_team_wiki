'use client';

import { useMemo, useState } from "react";

const DEFAULT_VISIBLE_COUNT = 2;

function formatCommentDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CommentThread({
  comments = [],
  onSubmit,
  submitting = false,
  disabled = false,
  placeholder = "댓글 남기기",
}) {
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);

  const sortedComments = useMemo(
    () => [...comments].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()),
    [comments],
  );

  const visibleComments = expanded ? sortedComments : sortedComments.slice(0, DEFAULT_VISIBLE_COUNT);
  const hiddenCount = Math.max(0, sortedComments.length - visibleComments.length);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent || disabled) return;

    await onSubmit(nextContent);
    setContent("");
  }

  return (
    <div className="comment-thread">
      {sortedComments.length > 0 ? (
        <div className="comment-list">
          {visibleComments.map((comment) => (
            <article key={comment.id} className="comment-item">
              <div className="comment-head">
                <span className="comment-author">{comment.author_name}</span>
                <span className="comment-date">{formatCommentDate(comment.created_at)}</span>
              </div>
              <p className="comment-body">{comment.content}</p>
            </article>
          ))}
        </div>
      ) : null}

      {hiddenCount > 0 ? (
        <button className="comment-toggle" type="button" onClick={() => setExpanded(true)}>
          +{hiddenCount}개 더보기
        </button>
      ) : null}

      {expanded && sortedComments.length > DEFAULT_VISIBLE_COUNT ? (
        <button className="comment-toggle" type="button" onClick={() => setExpanded(false)}>
          접기
        </button>
      ) : null}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          className="comment-input"
          type="text"
          value={content}
          placeholder={disabled ? "로그인 후 댓글 작성" : placeholder}
          disabled={disabled || submitting}
          onChange={(event) => setContent(event.target.value)}
        />
        <button className="small-btn" type="submit" disabled={disabled || submitting || !content.trim()}>
          {submitting ? "등록 중..." : "댓글"}
        </button>
      </form>
    </div>
  );
}
