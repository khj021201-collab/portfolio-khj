const test=require('node:test');
const assert=require('node:assert/strict');
const {default:worker}=require('../src/worker');

const SECRET='unit-test-secret';
const ORIGIN='https://portfolio-khj.khj021201.workers.dev';

function makeEnv(){
 const posts=new Map(),comments=new Map();
 const db={prepare(sql){return{bind(...args){this.args=args;return this},async all(){if(sql.includes('FROM qna_posts p'))return{results:[...posts.values()].map(p=>({...p,comment_count:[...comments.values()].filter(c=>c.post_id===p.id).length}))};if(sql.includes('FROM qna_comments WHERE post_id'))return{results:[...comments.values()].filter(c=>c.post_id===this.args[0])};throw Error(sql)},async first(){if(sql.startsWith('SELECT 1'))return{1:1};if(sql.includes('FROM qna_posts WHERE id'))return posts.get(this.args[0])||null;if(sql.includes('FROM qna_comments WHERE id'))return comments.get(this.args[0])||null;throw Error(sql)},async run(){const a=this.args;if(sql.startsWith('INSERT INTO qna_posts'))posts.set(a[0],{id:a[0],title:a[1],content:a[2],author_name:a[3],created_at:new Date().toISOString(),updated_at:'now',edit_token_hash:a[4]});else if(sql.startsWith('INSERT INTO qna_comments'))comments.set(a[0],{id:a[0],post_id:a[1],content:a[2],author_name:a[3],created_at:new Date().toISOString(),updated_at:'now',edit_token_hash:a[4]});else if(sql.startsWith('UPDATE qna_posts'))Object.assign(posts.get(a[3]),{title:a[0],content:a[1],author_name:a[2]});else if(sql.startsWith('UPDATE qna_comments'))Object.assign(comments.get(a[2]),{content:a[0],author_name:a[1]});else if(sql.startsWith('DELETE FROM qna_posts')){posts.delete(a[0]);for(const [id,comment]of comments)if(comment.post_id===a[0])comments.delete(id)}else if(sql.startsWith('DELETE FROM qna_comments'))comments.delete(a[0]);return{success:true}}}}};
 return{DB:db,QNA_TOKEN_SECRET:SECRET,QNA_ALLOWED_ORIGIN:ORIGIN,_posts:posts,_comments:comments};
}

const req=(url,method='GET',body,origin=ORIGIN,auth={})=>new Request('https://test.local'+url,{method,headers:{origin,'content-type':'application/json',...auth},body:body===undefined?undefined:JSON.stringify(body)});
async function tokenHeaders(id,token){const signature=await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',new TextEncoder().encode(SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),new TextEncoder().encode(`${id}:${token}`));return{'x-qna-access-token':token,'x-qna-signature':Buffer.from(signature).toString('base64url')}}
async function createPost(env){const response=await worker.fetch(req('/api/qna','POST',{title:'질문',content:'본문',authorName:'작성자'}),env);assert.equal(response.status,201);return response.json()}
async function createComment(env,postId){const response=await worker.fetch(req(`/api/qna/${postId}/comments`,'POST',{content:'댓글',authorName:'댓글 작성자'}),env);assert.equal(response.status,201);return response.json()}

test('only the matching post token and signature authorize edits and deletion',async()=>{
 const env=makeEnv(),created=await createPost(env),id=created.post.id;
 assert.equal(typeof created.accessToken,'string');assert.equal(typeof created.signature,'string');assert.equal(created.expiresIn,60*60*24*30);
 let response=await worker.fetch(req(`/api/qna/${id}`,'PATCH',{title:'무단 변경',content:'무단 본문',authorName:'공격자'}),env);assert.equal(response.status,403);
 response=await worker.fetch(req(`/api/qna/${id}`,'DELETE'),env);assert.equal(response.status,403);
 const forged=await tokenHeaders(id,'forged-token');response=await worker.fetch(req(`/api/qna/${id}`,'PATCH',{title:'무단 변경',content:'무단 본문',authorName:'공격자'},ORIGIN,forged),env);assert.equal(response.status,403);
 const auth=await tokenHeaders(id,created.accessToken);response=await worker.fetch(req(`/api/qna/${id}`,'PATCH',{title:'수정된 질문',content:'수정 본문',authorName:'작성자'},ORIGIN,auth),env);assert.equal(response.status,200);
 response=await worker.fetch(req('/api/qna'),env);assert.equal((await response.json()).posts[0].title,'수정된 질문');
 response=await worker.fetch(req(`/api/qna/${id}`,'DELETE',undefined,ORIGIN,auth),env);assert.equal(response.status,200);
 response=await worker.fetch(req(`/api/qna/${id}`,'GET'),env);assert.equal(response.status,404);
});

test('only the matching comment token and signature authorize edits and deletion',async()=>{
 const env=makeEnv(),post=await createPost(env),created=await createComment(env,post.post.id),id=created.comment.id;
 let response=await worker.fetch(req(`/api/qna/comments/${id}`,'PATCH',{content:'무단 변경',authorName:'공격자'}),env);assert.equal(response.status,403);
 response=await worker.fetch(req(`/api/qna/comments/${id}`,'DELETE'),env);assert.equal(response.status,403);
 const auth=await tokenHeaders(id,created.accessToken);response=await worker.fetch(req(`/api/qna/comments/${id}`,'PATCH',{content:'수정된 댓글',authorName:'댓글 작성자'},ORIGIN,auth),env);assert.equal(response.status,200);
 let listing=await worker.fetch(req(`/api/qna/${post.post.id}/comments`),env);assert.equal((await listing.json()).comments[0].content,'수정된 댓글');
 response=await worker.fetch(req(`/api/qna/comments/${id}`,'DELETE',undefined,ORIGIN,auth),env);assert.equal(response.status,200);
 listing=await worker.fetch(req(`/api/qna/${post.post.id}/comments`),env);assert.equal((await listing.json()).comments.length,0);
});

test('edit authorization expires after thirty days',async()=>{const env=makeEnv(),created=await createPost(env),id=created.post.id,auth=await tokenHeaders(id,created.accessToken);env._posts.get(id).created_at=new Date(Date.now()-60*60*24*30*1000-1000).toISOString();const response=await worker.fetch(req(`/api/qna/${id}`,'PATCH',{title:'만료 후 수정',content:'본문',authorName:'작성자'},ORIGIN,auth),env);assert.equal(response.status,403);assert.equal(env._posts.get(id).title,'질문')});

test('Q&A rejects invalid origin and invalid input',async()=>{const env=makeEnv();let response=await worker.fetch(req('/api/qna','POST',{title:'x',content:'y',authorName:'z'},'https://evil.example'),env);assert.equal(response.status,403);response=await worker.fetch(req('/api/qna','POST',{title:'',content:'y',authorName:'z'}),env);assert.equal(response.status,400)});

test('Q&A preflight allows the edit authorization headers only for the configured origin',async()=>{const env=makeEnv();let response=await worker.fetch(req('/api/qna','OPTIONS',undefined,ORIGIN,{'access-control-request-headers':'x-qna-access-token,x-qna-signature'}),env);assert.equal(response.status,204);assert.match(response.headers.get('access-control-allow-headers'),/x-qna-access-token/i);assert.match(response.headers.get('access-control-allow-headers'),/x-qna-signature/i);response=await worker.fetch(req('/api/qna','OPTIONS',undefined,'https://evil.example'),env);assert.equal(response.status,403)});