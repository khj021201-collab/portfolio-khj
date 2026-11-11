# 권혁주 식품 QC·QA 포트폴리오

이 프로젝트는 식품 QC·QA 직무 지원을 위한 개인 포트폴리오이며, 공개 사이트는 [https://portfolio-khj.khj021201.workers.dev](https://portfolio-khj.khj021201.workers.dev)에서 확인할 수 있습니다.

## 공개 서비스

포트폴리오와 Q&A 게시판은 Cloudflare Workers에서 운영됩니다. 정적 페이지와 API를 같은 도메인에서 제공하며, 경험 데이터와 Q&A 데이터는 Cloudflare D1 데이터베이스를 사용합니다.

- 포트폴리오: [https://portfolio-khj.khj021201.workers.dev](https://portfolio-khj.khj021201.workers.dev)
- Q&A 게시판: [https://portfolio-khj.khj021201.workers.dev/qna](https://portfolio-khj.khj021201.workers.dev/qna)

## 개발 구성

사이트 화면과 브라우저 스크립트는 `public/`에, Cloudflare Worker API는 `src/worker.js`와 `src/`의 모듈에, D1 스키마 및 마이그레이션은 `migrations/`에 있습니다. `wrangler.jsonc`에서 Worker, 정적 자산, D1 바인딩과 개발 환경을 관리합니다.

경험 목록은 Worker API가 D1에서 제공하고, Q&A의 질문·댓글은 별도 API를 통해 저장됩니다. 브라우저에서 수정·삭제를 요청할 때는 게시글 작성 시 발급되는 토큰과 Worker 서명을 사용합니다.

## 로컬 개발

Cloudflare Workers와 D1을 사용하는 기본 개발 서버는 Wrangler로 실행합니다. 의존성을 설치한 뒤 `npm run dev`를 실행하고 `http://localhost:8787`에서 확인하세요.

```powershell
npm install
npm run dev
```

Express와 SQLite CLI를 사용하는 대체 개발 서버도 제공합니다. `npm start`는 포트 3000에서 사이트와 API를 실행합니다. SQLite 실행 파일을 기본 경로에서 찾지 못하면 `SQLITE3_PATH`에 `sqlite3.exe`의 절대 경로를 지정하세요.

```powershell
npm start
```

## 테스트

프로젝트는 Node.js 기본 테스트 러너를 사용합니다. `npm test`는 SQLite 데이터베이스 테스트를, `npm run test:worker`는 Worker API 테스트를 실행합니다. Q&A 화면과 페이지네이션 테스트는 다음 명령으로 실행할 수 있습니다.

```powershell
npm test
npm run test:worker
node --test test/pagination.test.cjs test/qna-form.test.cjs
```

## 배포

Cloudflare Workers에 현재 프로젝트를 배포하려면 Cloudflare에 인증된 상태에서 `npm run deploy`를 실행합니다. 배포 전 `wrangler.jsonc`의 Worker 이름, 환경, 정적 자산 및 D1 설정을 확인하세요.

```powershell
npm run deploy
```

인증이 필요하면 `npx wrangler login`으로 로그인합니다. 원격 D1 경험 데이터를 바꿀 때는 SQL 변경을 검토한 뒤 시드 파일을 생성하고 적용하세요.

```powershell
npm run d1:seed:generate
npm run d1:seed
```

## 분석 및 검색 등록

사이트에는 Google Tag Manager 컨테이너 `GTM-T9MF6KQX`가 설치되어 있으며, GA4 웹 스트림 측정 ID `G-YJW616Q3S8`로 기본 방문 데이터를 수집합니다. GA4 속성에서 페이지 조회와 세션 관련 기본 보고서를 확인할 수 있습니다. 사용자 행동별 맞춤 이벤트는 현재 범위에 포함하지 않습니다.

사이트 URL은 Google Search Console에도 등록되어 있습니다. 공개 페이지의 검색 노출 현황과 검색어·클릭 데이터는 Search Console에서 확인할 수 있으며, 검색 데이터가 보고서에 나타나기까지는 수집 및 처리 시간이 필요합니다.

## Q&A 운영 안내

Q&A 게시판은 로그인 없이 질문과 댓글을 작성할 수 있습니다. 수정·삭제 권한은 작성 시 발급되는 비밀 토큰과 Worker 서명으로 보호되며, 토큰은 작성 브라우저의 로컬 저장소에 30일 동안 보관됩니다. 브라우저 저장 공간을 지우거나 사용할 수 없으면 해당 권한을 복구할 수 없습니다.

게시판은 익명 공개 서비스로 CAPTCHA, 로그인, 자동 신고·중재 기능을 제공하지 않습니다. 운영 시 게시물을 직접 관리하고, 방문이 늘어나는 경우 스팸 방지 및 요청 제한을 추가하는 것이 좋습니다. 배포 전에 Cloudflare에 `QNA_TOKEN_SECRET`이 설정되어 있고 `0003_create_qna.sql` 마이그레이션이 적용되어 있는지 확인하세요.
