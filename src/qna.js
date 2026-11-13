const encoder = new TextEncoder();
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_TITLE_LENGTH = 120;
const MAX_CONTENT_LENGTH = 5000;
const MAX_AUTHOR_LENGTH = 40;
const MAX_COMMENT_LENGTH = 2000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

function cleanText(value, { singleLine = false } = {}) {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return (singleLine ? cleaned.replace(/[\r\n]+/g, ' ') : cleaned.replace(/\r\n?/g, '\n')).trim();
}

function validText(value, max, { singleLine = false } = {}) {
  if (typeof value !== 'string' || (singleLine && /[\r\n]/.test(value))) return false;
  const cleaned = cleanText(value);
  return cleaned.length > 0 && cleaned.length <= max && /[^\s\u200B-\u200D\uFEFF\x00-\x1F\x7F]/u.test(cleaned);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  if (origin && origin === env.QNA_ALLOWED_ORIGIN) {
    return {
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'content-type,x-qna-access-token,x-qna-signature',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'Origin',
    };
  }
  return {};
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin && request.method === 'GET' && new URL(request.url).pathname === '/api/qna') return true;
  if (origin && origin === env.QNA_ALLOWED_ORIGIN) return true;
  try {
    const parsed = new URL(origin);
    return env.ENVIRONMENT === 'development'
      && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
      && ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function encodeToken(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function signToken(secret, resourceId, token) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return encodeToken(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${resourceId}:${token}`))));
}

function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index++) difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  return difference === 0;
}

async function authorized(request, secret, id, storedHash, createdAt) {
  const token = request.headers.get('x-qna-access-token');
  const signature = request.headers.get('x-qna-signature');
  const created = Date.parse(createdAt);
  if (!token || !signature || !Number.isFinite(created) || Date.now() - created >= TOKEN_TTL_SECONDS * 1000) return false;
  const [hash, expectedSignature] = await Promise.all([sha256(token), signToken(secret, id, token)]);
  return constantTimeEqual(hash, storedHash) && constantTimeEqual(signature, expectedSignature);
}

async function issueToken(secret, id) {
  const token = encodeToken(crypto.getRandomValues(new Uint8Array(32)));
  return { token, signature: await signToken(secret, id, token), hash: await sha256(token), expiresIn: TOKEN_TTL_SECONDS };
}

async function parseBody(request) {
  try { return await request.json(); } catch { return null; }
}

async function listPosts(db) {
  const { results } = await db.prepare(`
    SELECT p.id,p.title,p.content,p.author_name,p.created_at,p.updated_at,
      (SELECT COUNT(*) FROM qna_comments c WHERE c.post_id=p.id) AS comment_count
    FROM qna_posts p ORDER BY p.created_at DESC LIMIT 100
  `).all();
  return results;
}

async function listComments(db, postId) {
  const { results } = await db.prepare(`
    SELECT id,post_id,content,author_name,created_at,updated_at
    FROM qna_comments WHERE post_id=? ORDER BY created_at ASC LIMIT 200
  `).bind(postId).all();
  return results;
}

async function listPostsWithComments(db) {
  const posts = await listPosts(db);
  if (!posts.length) return posts;
  const { results } = await db.prepare(`
    SELECT id,post_id,content,author_name,created_at,updated_at FROM (
      SELECT id,post_id,content,author_name,created_at,updated_at,
        ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at ASC) AS comment_rank
      FROM qna_comments WHERE post_id IN (${posts.map(() => '?').join(',')})
    ) WHERE comment_rank<=200 ORDER BY post_id,created_at ASC
  `).bind(...posts.map((post) => post.id)).all();
  const grouped = new Map(posts.map((post) => [post.id, []]));
  for (const comment of results) grouped.get(comment.post_id)?.push(comment);
  return posts.map((post) => ({ ...post, comments: grouped.get(post.id) || [] }));
}

async function handleQna(request, env, url) {
  const headers = corsHeaders(request, env);
  if (!originAllowed(request, env)) return json({ error: 'Origin not allowed' }, 403, headers);
  const { method } = request;
  const { pathname } = url;
  if (method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (pathname === '/api/qna' && method === 'GET') {
    try { return json({ posts: await listPostsWithComments(env.DB) }, 200, headers); }
    catch (error) { console.error('Q&A list failed', error); return json({ error: 'Unable to load posts' }, 500, headers); }
  }

  if (pathname === '/api/qna' && method === 'POST') {
    const body = await parseBody(request);
    if (!body || !validText(body.title, MAX_TITLE_LENGTH, { singleLine: true })
      || !validText(body.content, MAX_CONTENT_LENGTH)
      || !validText(body.authorName, MAX_AUTHOR_LENGTH, { singleLine: true })) {
      return json({ error: '제목·작성자명은 한 줄로, 모든 항목은 표시 가능한 내용으로 입력해 주세요.' }, 400, headers);
    }
    try {
      const id = crypto.randomUUID();
      const title = cleanText(body.title, { singleLine: true }), content = cleanText(body.content), authorName = cleanText(body.authorName, { singleLine: true });
      const access = await issueToken(env.QNA_TOKEN_SECRET, id);
      await env.DB.prepare('INSERT INTO qna_posts (id,title,content,author_name,edit_token_hash) VALUES (?,?,?,?,?)')
        .bind(id, title, content, authorName, access.hash).run();
      return json({ post: { id, title, content, author_name: authorName }, accessToken: access.token, signature: access.signature, expiresIn: access.expiresIn }, 201, headers);
    } catch (error) {
      console.error('Q&A create failed', error);
      return json({ error: 'Unable to create post' }, 500, headers);
    }
  }

  const postMatch = pathname.match(/^\/api\/qna\/([0-9a-f-]{36})$/i);
  if (postMatch) {
    const id = postMatch[1];
    if (method === 'GET') {
      const post = await env.DB.prepare('SELECT id,title,content,author_name,created_at,updated_at FROM qna_posts WHERE id=?').bind(id).first();
      if (!post) return json({ error: 'Post not found' }, 404, headers);
      return json({ post, comments: await listComments(env.DB, id) }, 200, headers);
    }
    if (method === 'PATCH' || method === 'DELETE') {
      const body = method === 'PATCH' ? await parseBody(request) : {};
      const existing = await env.DB.prepare('SELECT id,edit_token_hash,created_at FROM qna_posts WHERE id=?').bind(id).first();
      if (!existing) return json({ error: 'Post not found' }, 404, headers);
      if (!await authorized(request, env.QNA_TOKEN_SECRET, id, existing.edit_token_hash, existing.created_at)) {
        return json({ error: '수정 또는 삭제 권한을 확인할 수 없습니다.' }, 403, headers);
      }
      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM qna_posts WHERE id=?').bind(id).run();
        return json({ ok: true }, 200, headers);
      }
      if (!validText(body?.title, MAX_TITLE_LENGTH, { singleLine: true })
        || !validText(body?.content, MAX_CONTENT_LENGTH)
        || !validText(body?.authorName, MAX_AUTHOR_LENGTH, { singleLine: true })) {
        return json({ error: '제목·작성자명은 한 줄로, 모든 항목은 표시 가능한 내용으로 입력해 주세요.' }, 400, headers);
      }
      await env.DB.prepare("UPDATE qna_posts SET title=?,content=?,author_name=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
        .bind(cleanText(body.title, { singleLine: true }), cleanText(body.content), cleanText(body.authorName, { singleLine: true }), id).run();
      return json({ ok: true }, 200, headers);
    }
  }

  const commentsPath = pathname.match(/^\/api\/qna\/([0-9a-f-]{36})\/comments$/i);
  if (commentsPath) {
    const postId = commentsPath[1];
    const exists = await env.DB.prepare('SELECT id FROM qna_posts WHERE id=?').bind(postId).first();
    if (!exists) return json({ error: 'Post not found' }, 404, headers);
    if (method === 'GET') return json({ comments: await listComments(env.DB, postId) }, 200, headers);
    if (method === 'POST') {
      const body = await parseBody(request);
      if (!body || !validText(body.content, MAX_COMMENT_LENGTH)
        || !validText(body.authorName, MAX_AUTHOR_LENGTH, { singleLine: true })) {
        return json({ error: '작성자명은 한 줄로, 댓글은 표시 가능한 내용으로 입력해 주세요.' }, 400, headers);
      }
      const id = crypto.randomUUID();
      const content = cleanText(body.content), authorName = cleanText(body.authorName, { singleLine: true });
      const access = await issueToken(env.QNA_TOKEN_SECRET, id);
      await env.DB.prepare('INSERT INTO qna_comments (id,post_id,content,author_name,edit_token_hash) VALUES (?,?,?,?,?)')
        .bind(id, postId, content, authorName, access.hash).run();
      return json({ comment: { id, post_id: postId, content, author_name: authorName }, accessToken: access.token, signature: access.signature, expiresIn: access.expiresIn }, 201, headers);
    }
  }

  const commentMatch = pathname.match(/^\/api\/qna\/comments\/([0-9a-f-]{36})$/i);
  if (commentMatch && (method === 'PATCH' || method === 'DELETE')) {
    const id = commentMatch[1];
    const body = method === 'PATCH' ? await parseBody(request) : {};
    const existing = await env.DB.prepare('SELECT id,edit_token_hash,created_at FROM qna_comments WHERE id=?').bind(id).first();
    if (!existing) return json({ error: 'Comment not found' }, 404, headers);
    if (!await authorized(request, env.QNA_TOKEN_SECRET, id, existing.edit_token_hash, existing.created_at)) {
      return json({ error: '수정 또는 삭제 권한을 확인할 수 없습니다.' }, 403, headers);
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM qna_comments WHERE id=?').bind(id).run();
      return json({ ok: true }, 200, headers);
    }
    if (!validText(body?.content, MAX_COMMENT_LENGTH)
      || !validText(body?.authorName, MAX_AUTHOR_LENGTH, { singleLine: true })) {
      return json({ error: '작성자명은 한 줄로, 댓글은 표시 가능한 내용으로 입력해 주세요.' }, 400, headers);
    }
    await env.DB.prepare("UPDATE qna_comments SET content=?,author_name=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
      .bind(cleanText(body.content), cleanText(body.authorName, { singleLine: true }), id).run();
    return json({ ok: true }, 200, headers);
  }

  return json({ error: 'Not found' }, 404, headers);
}

export { handleQna, cleanText, validText };