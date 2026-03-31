'use client';

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { useViewer } from "@/lib/useViewer";
import { ensureAnonymousKey, sortByDate } from "@/lib/utils";

function getInitialForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? "";
    return acc;
  }, {});
}

function getInputType(field) {
  if (field.type === "file") return "file";
  if (field.type === "date") return "date";
  if (field.type === "textarea") return "textarea";
  if (field.type === "select") return "select";
  if (field.type === "url") return "url";
  return "text";
}

export function CrudSection({
  title,
  description,
  table,
  orderBy = "created_at",
  ascending = false,
  select = "*",
  fields = [],
  allowCreate = true,
  submitLabel = "등록하기",
  emptyMessage = "아직 항목이 없습니다.",
  fallbackItems = [],
  storageBucket,
  renderItem,
  preparePayload,
  reactionTargetType,
  reportTargetType,
  ownerField,
  targetType,
}) {
  const fallbackClient = useMemo(() => getBrowserSupabase(), []);
  const viewer = useViewer();
  const client = viewer.client ?? fallbackClient;
  const [items, setItems] = useState(fallbackItems);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(getInitialForm(fields));
  const [files, setFiles] = useState({});
  const [anonKey, setAnonKey] = useState("server");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    setForm(getInitialForm(fields));
  }, [fields]);

  useEffect(() => {
    setAnonKey(ensureAnonymousKey());
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      if (!client) {
        if (!active) return;
        setItems(sortByDate(fallbackItems, orderBy, ascending));
        setCounts({});
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await client
        .from(table)
        .select(select)
        .order(orderBy, { ascending });

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setItems(sortByDate(fallbackItems, orderBy, ascending));
      } else {
        setItems(data ?? []);
      }

      if (reactionTargetType) {
        const { data: reactionRows } = await client
          .from("reactions")
          .select("target_id")
          .eq("target_type", reactionTargetType);

        if (active) {
          const nextCounts = {};
          (reactionRows ?? []).forEach((row) => {
            nextCounts[row.target_id] = (nextCounts[row.target_id] ?? 0) + 1;
          });
          setCounts(nextCounts);
        }
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [client, table, select, orderBy, ascending, fallbackItems, reactionTargetType]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (ownerField && !viewer.user) {
        throw new Error("로그인 후에 작성할 수 있어요.");
      }

      let payload = { ...form };

      for (const field of fields) {
        if (field.type === "file") {
          const file = files[field.name];
          if (!file) continue;
          if (!client || !storageBucket) {
            throw new Error("파일 업로드를 위해 Supabase Storage 설정이 필요합니다.");
          }

          const ext = file.name.split(".").pop();
          const path = `${table}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await client.storage.from(storageBucket).upload(path, file, {
            upsert: false,
            contentType: file.type,
          });

          if (uploadError) throw uploadError;

          const { data: publicData } = client.storage.from(storageBucket).getPublicUrl(path);
          payload[field.uploadTo ?? field.name.replace(/_file$/, "_url")] = publicData.publicUrl;
          delete payload[field.name];
        }
      }

      if (ownerField && viewer.user) {
        payload[ownerField] = viewer.user.id;
      }

      if (preparePayload) {
        payload = preparePayload(payload);
      }

      if (!client) {
        const localItem = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...payload,
        };
        setItems((current) => sortByDate([localItem, ...current], orderBy, ascending));
      } else {
        const { data, error: insertError } = await client.from(table).insert([payload]).select(select).single();
        if (insertError) throw insertError;
        if (data) {
          setItems((current) => sortByDate([data, ...current], orderBy, ascending));
        }
      }

      setForm(getInitialForm(fields));
      setFiles({});
      setNotice("등록이 완료됐어요.");
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (submitError) {
      setError(submitError.message || "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReact(item) {
    if (!client || !reactionTargetType) return;
    const { error: insertError } = await client.from("reactions").insert([
      {
        target_type: reactionTargetType,
        target_id: item.id,
        reaction_type: "like",
        user_key: anonKey,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNotice("공감이 저장됐어요.");
    const next = { ...counts, [item.id]: (counts[item.id] ?? 0) + 1 };
    setCounts(next);
  }

  async function handleReport(item) {
    if (!client || !reportTargetType) return;
    const { error: reportError } = await client.from("reports").insert([
      {
        target_type: reportTargetType,
        target_id: item.id,
        reason: "검토 요청",
        status: "open",
      },
    ]);

    if (reportError) {
      setError(reportError.message);
      return;
    }

    setNotice("신고가 접수됐어요.");
  }

  function canDeleteItem(item) {
    if (viewer.isAdmin) return true;
    if (!viewer.user || !ownerField) return false;
    return item?.[ownerField] === viewer.user.id;
  }

  async function handleDelete(item) {
    if (!targetType) return;

    setDeletingId(item.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/content/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetType, targetId: item.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice("삭제가 완료됐어요.");
    } catch (deleteError) {
      setError(deleteError.message || "삭제에 실패했습니다.");
    } finally {
      setDeletingId("");
    }
  }

  const hasFields = fields.length > 0;

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2 className="section-title" style={{ fontSize: 26 }}>
            {title}
          </h2>
          <p className="section-description">{description}</p>
        </div>
        <div className="toolbar">
          <span className="tag">{loading ? "불러오는 중" : `${items.length}개 항목`}</span>
          {reactionTargetType ? <span className="tag">공감 기능</span> : null}
          {ownerField ? <span className="tag">로그인 시 내 글 삭제</span> : null}
        </div>
      </div>

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice" style={{ background: "#fef2f2", color: "#b91c1c" }}>{error}</div> : null}

      {allowCreate && hasFields ? (
        <form className="panel" onSubmit={handleSubmit}>
          <div className="field-grid">
            {fields.map((field) => {
              const inputType = getInputType(field);

              if (inputType === "textarea") {
                return (
                  <div key={field.name} className="field" style={{ gridColumn: field.wide ? "1 / -1" : undefined }}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <textarea
                      id={field.name}
                      value={form[field.name]}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                    {field.helperText ? <span className="helper">{field.helperText}</span> : null}
                  </div>
                );
              }

              if (inputType === "select") {
                return (
                  <div key={field.name} className="field">
                    <label htmlFor={field.name}>{field.label}</label>
                    <select
                      id={field.name}
                      value={form[field.name]}
                      required={field.required}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    >
                      <option value="">선택하세요</option>
                      {(field.options ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (inputType === "file") {
                return (
                  <div key={field.name} className="field">
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                      id={field.name}
                      type="file"
                      accept={field.accept ?? "image/*"}
                      onChange={(event) => setFiles((current) => ({ ...current, [field.name]: event.target.files?.[0] ?? null }))}
                    />
                    <span className="helper">{files[field.name]?.name ?? field.helperText ?? "파일을 선택하세요"}</span>
                  </div>
                );
              }

              return (
                <div key={field.name} className="field">
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    id={field.name}
                    type={inputType}
                    value={form[field.name]}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                  {field.helperText ? <span className="helper">{field.helperText}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="action-row" style={{ marginTop: 16 }}>
            <button className="primary" type="submit" disabled={submitting}>
              {submitting ? "저장 중..." : submitLabel}
            </button>
          </div>
        </form>
      ) : null}

      <div className="divider" />

      <div className="content-grid">
        {items.length === 0 ? (
          <div className="empty">{emptyMessage}</div>
        ) : (
          items.map((item) =>
            renderItem ? (
              <div key={item.id}>
                {renderItem(item, {
                  onReact: () => handleReact(item),
                  onReport: () => handleReport(item),
                  onDelete: () => handleDelete(item),
                  canDelete: canDeleteItem(item),
                  deleting: deletingId === item.id,
                  reactionCount: counts[item.id] ?? 0,
                })}
              </div>
            ) : (
              <article key={item.id} className="story-card">
                <p className="card-body">{JSON.stringify(item)}</p>
              </article>
            ),
          )
        )}
      </div>
    </section>
  );
}
