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

## Google 로그인 설정
- Supabase Dashboard -> Authentication -> Providers -> Google 에서 Google 로그인을 활성화한다.
- Google Cloud Console에서 OAuth Client를 만들고 `Client ID`, `Client Secret`을 Supabase에 입력한다.
- Redirect URL은 Supabase가 안내하는 URL을 Google Cloud에 그대로 등록한다.
- Vercel 도메인을 쓸 경우 `https://your-domain.vercel.app` 를 Site URL과 Redirect URL 목록에 추가한다.
- 로그인 후 작성한 글과 사진만 본인이 직접 삭제할 수 있다.

## 관리자 기능
- 관리자 페이지는 공유 비밀번호 로그인 방식이다.
- 삭제와 신고 처리는 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 수행한다.
