# 식품 QC·QA 신입 포트폴리오

## 공개 사이트: Cloudflare Workers + D1

https://portfolio-khj.khj021201.workers.dev

`src/worker.js`가 D1 기반 API(`/api/health`, `/api/experiences`, `/api/categories`)를 제공하고 `public/` 파일을 정적 assets로 제공합니다. `wrangler.jsonc`는 D1 binding과 Worker assets 설정을 담고, `migrations/`에는 스키마 및 초기 경험 데이터가 있습니다.

```powershell
npm install
npm run dev
npm run deploy
```

새 경험 데이터를 `scripts/experiences.json`에 반영한 뒤에는 `npm run d1:seed:generate`로 seed SQL을 다시 생성하고, 원격에 적용해야 합니다.

## GitHub Pages 정적 버전

GitHub Pages는 Worker/D1 API를 실행할 수 없으므로 `public/fallback-data.js` 정적 데이터를 사용합니다. 동적 D1 버전은 위 Cloudflare Workers URL에서 확인할 수 있습니다.

## 기존 로컬 Node/SQLite 개발

로컬 Express API와 SQLite CLI는 `npm start`로 실행할 수 있습니다. SQLite CLI가 PATH에서 검색되지 않는 경우 `SQLITE3_PATH` 환경 변수에 `sqlite3.exe` 경로를 설정하세요.
