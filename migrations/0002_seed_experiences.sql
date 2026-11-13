INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'factory-training',
  '현장 경험',
  '소스·분말 제품 제조 현장 근무',
  '소스·분말 식품공장에서 2개월간 생산 현장에서 근무하며 원료 투입부터 생산, 포장까지 제조공정을 경험했습니다.',
  '["원료 투입","생산 공정","포장","제조 현장"]',
  '2개월 근무',
  1
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'banana-blossom-candy',
  '연구·논문',
  '바나나꽃 활용 기능성 캔디',
  '바나나꽃의 기능적 특성을 탐색하고 캔디 제품 적용 연구를 진행하며 실험·분석을 수행하고 있습니다.',
  '["기능성 원료","제품 개발","실험·분석"]',
  '졸업논문 진행 중',
  2
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'meat-freshness-display',
  '공모전',
  '육류 신선도 확인 디스플레이',
  '부패 가스 포집과 금 이온 색 변화를 이용해 식품 안전성을 확인하는 기계 및 포장지 아이디어를 제안했습니다.',
  '["식품 포장","안전성 표시","아이디어 기획"]',
  '디스플레이 분야 공모전 입상',
  3
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'food-safety-paper',
  '공모전',
  '식품안전 포장 주제 연구',
  '식품안전 논문 공모전에서 포장 관련 주제를 탐구하고 연구 내용을 발전시켰습니다.',
  '["식품안전","포장","자료 조사"]',
  '2026 본선 진출',
  4
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'ai-control-dashboard',
  '교육',
  'AI 관제 대시보드 교육',
  '1개월 교육에서 AI의 기본 개념과 실무에 적용할 수 있는 AI 도구 활용을 배웠습니다.',
  '["AI 기초","AI 도구","실무 적용"]',
  '1개월 교육 이수',
  5
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'department-promotion',
  '공모전',
  '식품공학과 홍보 콘텐츠',
  '전공의 특성과 가치를 전달하는 홍보 아이디어를 기획하고 결과물로 발전시켰습니다.',
  '["콘텐츠 기획","전공 홍보"]',
  '커리어넷 학과 홍보 공모전 입상',
  6
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'admissions-assistant',
  '조직·협업',
  '단국대학교 입학팀 근로장학생',
  '입학설명회와 실기고사 등 입학 관련 행사를 지원했습니다. 행사 준비와 현장 안내, 문의 응대를 맡으며 사전 확인과 정확한 안내의 중요성을 배웠습니다.',
  '["행사 운영","현장 안내","사전 준비"]',
  '약 2년 근무',
  7
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'student-council-planning',
  '조직·협업',
  '식품공학과 학생회 기획부장',
  '학과 행사와 학생회 활동을 기획하고 운영하며 구성원과 일정을 조율하고 맡은 업무를 실행했습니다.',
  '["행사 기획","조직 운영","협업"]',
  '2025 활동',
  8
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'hitejinro-supporters',
  '조직·협업',
  '하이트진로 서포터즈',
  '기업과 소비자를 연결하는 서포터즈 홍보 활동에 참여했습니다.',
  '["기업 홍보","콘텐츠","소통"]',
  '대외활동',
  9
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'c-anchor-planning',
  '조직·협업',
  'C-앵커사업단 서포터즈 기획팀장',
  '교내 C-앵커사업단 서포터즈 기획팀장으로 활동하며 팀 기획과 운영을 맡고 있습니다.',
  '["기획","팀 리딩","운영"]',
  '2026 활동',
  10
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'tennis-treasurer',
  '조직·협업',
  '테니스 동아리 총무',
  '동아리 총무로 활동하며 구성원과 운영을 지원했습니다. 테니스는 꾸준히 이어가고 있는 취미입니다.',
  '["동아리 운영","소통","테니스"]',
  '총무 활동',
  11
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;

INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  'military-driver',
  '조직·협업',
  '고위급 인사 의전 운전병',
  '군 복무 중 장성 및 장관 등 고위급 인사의 의전 운전 임무를 수행하며 시간 준수와 사전 확인, 책임감을 배웠습니다.',
  '["책임감","정확성","사전 확인"]',
  '군 복무',
  12
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;
