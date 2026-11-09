# 권혁주 식품 QC·QA 포트폴리오

## 배포 사이트

현재 공개 중인 포트폴리오는 [portfolio-khj.khj021201.workers.dev](https://portfolio-khj.khj021201.workers.dev)에서 확인할 수 있습니다. 사이트는 Cloudflare Workers에 배포되며, 정적 페이지와 API는 한 도메인에서 제공됩니다.

## 개발 방식

이 프로젝트는 포트폴리오 화면을 정적 웹 자산으로 제공하고, 질문·댓글 기능과 경험 데이터 API를 Cloudflare Workers와 D1 데이터베이스로 구현합니다. 주요 화면과 브라우저 코드는 `public/`, Worker API는 `src/worker.js`, 데이터베이스 스키마와 변경 내역은 `migrations/`에 있습니다.

개발 환경에서는 Wrangler로 Worker와 D1을 로컬에서 실행합니다. 필요한 패키지를 설치한 다음 `npm run dev`를 실행하면 로컬 개발 서버에서 변경 사항을 확인할 수 있습니다.

```powershell
npm install
npm run dev
```

로컬에서 Express와 SQLite CLI를 사용하는 대체 개발 서버도 제공합니다. `npm start`는 포트 3000에서 API와 사이트를 실행합니다. SQLite 실행 파일을 기본 경로에서 찾지 못하면 `SQLITE3_PATH`에 `sqlite3.exe`의 실제 경로를 지정하세요.

```powershell
npm start
```

## 배포 방법

사이트를 Cloudflare Workers에 게시하거나 변경 사항을 반영하려면 Wrangler에 Cloudflare 계정으로 로그인한 뒤 `npm run deploy`를 실행합니다. 배포 전에 `wrangler.jsonc`에서 Worker, 정적 자산, D1 데이터베이스 설정을 확인하세요.

```powershell
npm run deploy
```

배포 명령에서 인증 오류가 발생하면 먼저 `npx wrangler login`을 실행해 브라우저에서 Cloudflare 로그인을 완료하세요. 경험 데이터를 원격 D1에 변경할 때는 의도한 데이터 변경인지 확인한 뒤 시드 SQL을 생성하고 적용합니다.

```powershell
npm run d1:seed:generate
npm run d1:seed
```

## Q&A 게시판

Q&A 게시판은 로그인 없이 질문과 댓글을 작성할 수 있습니다. 각 항목의 수정·삭제 권한은 작성 시 발급되는 비밀 토큰과 Worker 서명으로 보호하며, 토큰은 작성한 브라우저의 로컬 저장소에 보관되고 30일 후 만료됩니다. 수정·삭제 버튼은 해당 브라우저에 유효한 토큰이 있는 항목에만 표시됩니다. 브라우저 저장 공간을 사용할 수 없거나 저장소를 지우면 권한을 복구할 수 없으므로, 작성 직후 권한 저장 안내를 확인하세요.

토큰 저장이 적용되기 전에 등록된 기존 게시글·댓글의 편집 토큰은 복구할 수 없습니다. 이 항목은 새 권한 검증 적용 후에도 작성자 본인이 수정·삭제할 수 없으며, 필요하면 새 글이나 댓글로 다시 등록해 주세요.

2026-11-09 보안 조치로 `QNA_TOKEN_SECRET`을 회전했습니다. 이 시점 이전에 발급된 편집 서명은 새 키에서 검증되지 않으므로, 이미 등록된 게시글·댓글의 기존 편집 권한은 사용할 수 없습니다. 새 게시글과 댓글부터 새 키로 정상 작동합니다.

게시판은 익명 공개 서비스이며 로그인, CAPTCHA, 자동 신고·중재 기능을 제공하지 않습니다. 따라서 부적절한 게시물 관리가 필요하며, 방문자가 늘어나는 경우에는 운영 정책과 추가적인 스팸·요청 제한을 마련해야 합니다. Worker 배포 전에 `QNA_TOKEN_SECRET` Wrangler secret 설정과 `0003_create_qna.sql` 마이그레이션 적용 여부를 확인하세요.

## 테스트

프로젝트는 Node.js 기본 테스트 러너를 사용합니다. `npm test`는 SQLite 기반 데이터베이스 테스트를 실행하고, `npm run test:worker`는 Worker API 테스트를 실행합니다.

```powershell
npm test
npm run test:worker
```
