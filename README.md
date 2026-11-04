# Food QC/QA Portfolio

Production site: https://portfolio-khj.khj021201.workers.dev

## Cloudflare Workers + D1

- Worker API: `src/worker.js`
- Public static assets: `public/`
- D1 schema/migrations: `migrations/`
- Q&A supports anonymous post/comment creation, editing and deletion. Each record has a random edit token held only in the creating browser's local storage; requests require a Worker HMAC signature. Editing/deletion token expires in 30 days. Clearing local browser storage loses those controls.
- Q&A has no user login, moderation workflow, or CAPTCHA. Anonymous public boards can receive spam. Requests are restricted to the portfolio origin and content lengths are capped, but this is not a substitute for moderation/rate-limit controls before high-traffic public use.

```powershell
npm install
npm run dev
npm run deploy
```

After changing portfolio experience data, regenerate/reapply D1 seed only when intentionally updating remote records: `npm run d1:seed:generate`, then `npm run d1:seed`.

## Local Express + SQLite CLI

`npm start` runs the existing local development API using the installed SQLite CLI. Set `SQLITE3_PATH` if `sqlite3.exe` is not on the configured default path.

## Q&A 게시판

- 우측 상단 Q&A 메뉴는 독립 페이지 `/qna`로 이동합니다. Workers + D1에 익명 질문/답변(댓글) 작성, 수정, 삭제 기능을 제공합니다.
- 작성 시 무작위 편집 토큰은 브라우저 localStorage에만 보관하고 서버에는 SHA-256 해시만 저장합니다. 수정/삭제는 저장된 토큰과 Workers HMAC 서명이 있어야 가능합니다. 토큰은 30일 후 만료됩니다. 브라우저 저장공간을 지우면 작성자도 편집 권한을 잃습니다.
- 게시글 최대 120자/5,000자, 댓글 최대 2,000자, 작성자명 최대 40자입니다.
- 로그인·실명 인증·CAPTCHA는 사용하지 않습니다. 공개 익명 게시판이므로 스팸이나 부적절한 내용을 수동 관리해야 합니다. 비밀 토큰이 없으면 API는 쓰기 권한을 제공하지 않습니다.
- 배포 전 `QNA_TOKEN_SECRET` Wrangler secret을 설정하고 `0003_create_qna.sql` 마이그레이션을 적용해야 합니다.
