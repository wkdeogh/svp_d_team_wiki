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
- 기존 프로젝트라면 이번 변경 후 `supabase/schema.sql`을 다시 실행해서 새 컬럼과 delete policy를 반영한다.
- 사진 업로드에서 `new row violates row-level security policy`가 뜨면 `storage.objects` 정책이 아직 없는 상태라서, `supabase/schema.sql`을 다시 실행해야 한다.

## 일반 로그인
- 상단에서 `닉네임 + 비밀번호`를 입력하면 로그인된다.
- 같은 닉네임이 없으면 자동으로 계정이 생성된다.
- 로그인 세션은 쿠키로 유지되어 다음 접속 시 자동 로그인된다.
- 로그인 후 작성한 글과 사진/앨범은 본인이 직접 삭제할 수 있다.

## 관리자 기능
- 관리자 페이지는 공유 비밀번호 로그인 방식이다.
- 삭제와 신고 처리는 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 수행한다.
