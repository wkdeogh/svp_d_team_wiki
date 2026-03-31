export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMonthLabel(value) {
  if (!value) return "날짜 미정";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export function formatShortMonthDay(value) {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function ensureAnonymousKey() {
  if (typeof window === "undefined") return "server";
  const key = "svp-d-team-anon-key";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function groupByDate(items) {
  return items.reduce((acc, item) => {
    const dateKey = item.event_date || item.created_at || "unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});
}

export function sortByDate(items, key, ascending = true) {
  return [...items].sort((left, right) => {
    const a = new Date(left?.[key] || 0).getTime();
    const b = new Date(right?.[key] || 0).getTime();
    return ascending ? a - b : b - a;
  });
}
