# SVP D팀 위키

## 시작하기
1. `npm install`
2. `.env.local`에 Supabase 주소와 anon key 설정
3. `npm run dev`

## 환경변수
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase
- `supabase/schema.sql`을 실행해서 테이블과 정책을 만든다.
- Storage 버킷 이름은 `photos`를 사용한다.
