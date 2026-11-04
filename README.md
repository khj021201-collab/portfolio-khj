# 식품 QC·QA 신입 포트폴리오

## 로컬에서 SQLite 동적 포트폴리오 실행

1. Node.js 설치 후 프로젝트 폴더에서 `npm install`
2. `npm start`
3. 브라우저에서 http://localhost:3000 열기

경험 목록은 SQLite 데이터베이스(`data/portfolio.sqlite`)에서 읽어옵니다. 데이터베이스 파일은 `.gitignore` 처리되어 GitHub에 올라가지 않습니다. 원본 콘텐츠는 `scripts/experiences.json`에 관리하며 `npm run db:init`으로 로컬 DB를 다시 초기화할 수 있습니다.

경험 섹션에서는 카테고리 필터와 키워드 검색을 사용할 수 있습니다.

## GitHub Pages 정적 버전

GitHub Pages에서는 Node/SQLite 백엔드가 실행되지 않습니다. 저장소 루트의 HTML은 정적 버전으로 보낼 안내 페이지이며, `public/`은 같은 검색·필터 동작을 JSON 정적 데이터로 제공하도록 구성되어 있습니다. 실제 동적 SQLite API를 공개 배포하려면 별도의 Node 호스팅 서비스가 필요합니다.
