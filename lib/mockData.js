export const fallbackGuestbookEntries = [
  {
    id: "guest-1",
    name: "D팀 1기",
    message: "여기서 우리 추억 쭉 기록하자.",
    created_at: "2026-03-31T09:00:00.000Z",
  },
  {
    id: "guest-2",
    name: "익명의 동기",
    message: "행사 사진 또 올리러 올게요.",
    created_at: "2026-03-30T09:00:00.000Z",
  },
];

export const fallbackTimelineEntries = [
  {
    id: "timeline-1",
    title: "D팀 첫 회식",
    content: "첫 회식에서 서로 이름 외우느라 정신없었지만 재밌었다.",
    event_date: "2024-04-12",
    category: "행사",
    author_name: "운영진",
    created_at: "2026-03-31T09:00:00.000Z",
  },
  {
    id: "timeline-2",
    title: "OOO 동기 결혼",
    content: "모두가 축하하러 모였던 행복한 날.",
    event_date: "2025-11-02",
    category: "결혼",
    author_name: "기록 담당",
    created_at: "2026-03-31T10:00:00.000Z",
  },
];

export const fallbackMembers = [
  {
    id: "member-1",
    name: "김동기",
    nickname: "D1",
    bio: "기록 담당.",
    join_story: "초기 멤버로 위키 제안.",
    avatar_url: "",
    created_at: "2026-03-31T09:00:00.000Z",
  },
  {
    id: "member-2",
    name: "이동기",
    nickname: "D2",
    bio: "행사 사진 담당.",
    join_story: "행사마다 카메라를 들고 다님.",
    avatar_url: "",
    created_at: "2026-03-31T09:10:00.000Z",
  },
];

export const fallbackAlbums = [
  {
    id: "album-1",
    title: "첫 회식",
    description: "D팀의 시작을 기록한 사진들",
    created_at: "2026-03-31T09:00:00.000Z",
  },
];

export const fallbackPhotos = [
  {
    id: "photo-1",
    album_id: "album-1",
    title: "단체 사진",
    caption: "첫 회식 기념",
    image_url: "",
    event_date: "2024-04-12",
    created_at: "2026-03-31T09:00:00.000Z",
  },
];

export const fallbackComments = [
  {
    id: "comment-1",
    target_type: "guestbook",
    target_id: "guest-1",
    author_name: "D2",
    content: "좋다 좋아. 자주 남기자.",
    created_at: "2026-03-31T09:20:00.000Z",
  },
  {
    id: "comment-2",
    target_type: "guestbook",
    target_id: "guest-1",
    author_name: "D3",
    content: "사진도 많이 올리자.",
    created_at: "2026-03-31T09:40:00.000Z",
  },
  {
    id: "comment-3",
    target_type: "guestbook",
    target_id: "guest-1",
    author_name: "D4",
    content: "나중에 회식 일정도 적자.",
    created_at: "2026-03-31T10:10:00.000Z",
  },
  {
    id: "comment-4",
    target_type: "photo",
    target_id: "photo-1",
    author_name: "D1",
    content: "이날 진짜 재밌었지.",
    created_at: "2026-03-31T09:30:00.000Z",
  },
];

export const fallbackReports = [
  {
    id: "report-1",
    target_type: "timeline",
    target_id: "timeline-1",
    reason: "내용 확인 필요",
    status: "open",
    created_at: "2026-03-31T09:00:00.000Z",
  },
];
