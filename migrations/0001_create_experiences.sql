CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT NOT NULL,
  result TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS experiences_category_sort_idx
  ON experiences(category, sort_order);
