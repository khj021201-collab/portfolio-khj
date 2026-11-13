CREATE TABLE IF NOT EXISTS qna_posts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  edit_token_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS qna_posts_created_idx ON qna_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS qna_comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  edit_token_hash TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES qna_posts(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS qna_posts_delete_comments
AFTER DELETE ON qna_posts
BEGIN
  DELETE FROM qna_comments WHERE post_id = OLD.id;
END;

CREATE INDEX IF NOT EXISTS qna_comments_post_created_idx
  ON qna_comments(post_id, created_at);
