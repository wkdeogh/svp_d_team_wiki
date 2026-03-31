# SVP D팀 위키

## 시작하기
1. `npm install`
2. `.env.local`에 Supabase 주소, anon key, 관리자 비밀번호, service role key 설정
3. `npm run dev`

## 환경변수
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

## Supabase
- `supabase/schema.sql`을 실행해서 테이블과 정책을 만든다.
- Storage 버킷 이름은 `photos`를 사용한다.

## 관리자 기능
- 관리자 페이지는 공유 비밀번호 로그인 방식이다.
- 삭제와 신고 처리는 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 수행한다.
