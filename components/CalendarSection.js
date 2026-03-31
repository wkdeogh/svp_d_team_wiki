'use client';

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { fallbackTimelineEntries } from "@/lib/mockData";
import { formatDate, formatMonthLabel, formatShortMonthDay, sortByDate } from "@/lib/utils";

export function CalendarSection() {
  const client = useMemo(() => getBrowserSupabase(), []);
  const [items, setItems] = useState(fallbackTimelineEntries);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      if (!client) {
        if (active) {
          setItems(sortByDate(fallbackTimelineEntries, "event_date", true));
          setLoading(false);
        }
        return;
      }

      const { data } = await client.from("timeline_entries").select("*").order("event_date", { ascending: true });
      if (active) {
        setItems(data ?? []);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [client]);

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchesMonth = month ? (item.event_date ?? "").startsWith(month) : true;
    const matchesCategory = category ? item.category === category : true;
    return matchesMonth && matchesCategory;
  });

  const grouped = filteredItems.reduce((acc, item) => {
    const key = item.event_date ?? "미정";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2 className="section-title" style={{ fontSize: 26 }}>
            기념일 캘린더
          </h2>
          <p className="section-description">결혼식, 행사, 회식, 여행 같은 중요한 날을 날짜 단위로 빠르게 확인한다.</p>
        </div>
        <div className="toolbar">
          <span className="tag">{loading ? "불러오는 중" : `${filteredItems.length}개`}</span>
        </div>
      </div>

      <div className="panel">
        <div className="auth-box">
          <div className="field">
            <label htmlFor="month">월 필터</label>
            <input id="month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="category">카테고리</label>
            <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">전체</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        {Object.keys(grouped).length === 0 ? (
          <div className="empty">일정이 없습니다.</div>
        ) : (
          Object.entries(grouped).map(([key, list]) => (
            <div key={key} className="calendar-day">
              <p className="calendar-date">{key === "미정" ? key : `${formatMonthLabel(key)} · ${formatShortMonthDay(key)}`}</p>
              {list.map((item) => (
                <article key={item.id} style={{ marginBottom: 12 }}>
                  <p className="calendar-title">{item.title}</p>
                  <p className="photo-caption">{item.category ? `${item.category} · ` : ""}{item.author_name ?? "기록자 미상"}</p>
                  <p className="photo-caption">{item.content}</p>
                </article>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="notice">타임라인에 쌓인 기록을 월별 달력처럼 빠르게 훑어보는 화면이다.</div>
    </section>
  );
}
