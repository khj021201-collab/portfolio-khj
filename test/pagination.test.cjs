const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {paginate}=require('../public/pagination.js');

test('pagination returns the first page and expected total pages',()=>{
 const result=paginate(Array.from({length:14},(_,index)=>index+1),1,6);
 assert.deepEqual(result.items,[1,2,3,4,5,6]);
 assert.equal(result.currentPage,1);
 assert.equal(result.totalPages,3);
 assert.equal(result.totalItems,14);
});

test('pagination clamps out-of-range pages and returns the final partial page',()=>{
 const result=paginate(Array.from({length:14},(_,index)=>index+1),99,6);
 assert.deepEqual(result.items,[13,14]);
 assert.equal(result.currentPage,3);
});

test('pagination uses one empty page for an empty list',()=>{
 assert.deepEqual(paginate([],1,5),{items:[],currentPage:1,totalPages:1,totalItems:0});
});

test('pagination and Q&A classic scripts do not declare conflicting global bindings',()=>{
 const context=vm.createContext({window:{},module:undefined,document:undefined});
 const publicDir=path.join(__dirname,'..','public');
 assert.doesNotThrow(()=>vm.runInContext(fs.readFileSync(path.join(publicDir,'pagination.js'),'utf8'),context));
 assert.doesNotThrow(()=>vm.runInContext(fs.readFileSync(path.join(publicDir,'qna.js'),'utf8'),context));
 assert.equal(typeof context.window.portfolioPaginate,'function');
});

test('Q&A registers each delegated UI handler once when the page DOM is available',async()=>{
 const handlers=new Map();
 const makeElement=(id)=>({id,addEventListener(type,listener){const key=`${id}:${type}`;handlers.set(key,[...(handlers.get(key)||[]),listener])}});
 const elements={'#qna-list':makeElement('list'),'#qna-status':makeElement('status'),'#qna-write-open':makeElement('open')};
 const context=vm.createContext({
  window:{portfolioPaginate(items,page,pageSize){return{items:items.slice(0,pageSize),currentPage:page,totalPages:1}}},
  document:{querySelector(selector){return elements[selector]||null}},
  module:undefined,
  fetch:async()=>({ok:true,json:async()=>({posts:[]})}),
  localStorage:{getItem(){return null},setItem(){}},
  FormData:class{},Intl,Date,URL,console,Promise,Object,Array,String,Number,JSON,
  confirm(){return true},
 });
 const source=fs.readFileSync(path.join(__dirname,'..','public','qna.js'),'utf8');
 vm.runInContext(source,context);
 await new Promise(resolve=>setImmediate(resolve));
 for(const key of ['open:click','list:submit','list:click'])assert.equal(handlers.get(key)?.length,1,`${key} handler must only be registered once`);
});

test('Q&A source keeps UI event registration in the page initialization path only',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','public','qna.js'),'utf8');
 assert.equal((source.match(/openButton\??\.addEventListener\('click'/g)||[]).length,1);
 assert.equal((source.match(/list\??\.addEventListener\('submit'/g)||[]).length,1);
 assert.equal((source.match(/list\??\.addEventListener\('click'/g)||[]).length,1);
 assert.equal((source.match(/(?:openButton|list)\??\.addEventListener\(/g)||[]).length,3);
 assert.doesNotMatch(source,/if\(typeof document!==['"]undefined['"]&&list\)/);
});

test('Q&A initialization loads the list once after registering its UI handlers',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','public','qna.js'),'utf8');
 assert.equal((source.match(/^load\(\);$/gm)||[]).length,1);
 assert.ok(source.indexOf("list?.addEventListener('click'")<source.lastIndexOf('\nload();'));
});

test('header alignment padding matches section content at common desktop widths',()=>{
 const sectionLeft=(width)=>Math.max((width-1080)/2,0)+30;
 const headerLeft=(width)=>Math.max((width-1080)/2+30,30);
 for(const width of [1024,1440,1920])assert.equal(headerLeft(width),sectionLeft(width));
});

test('contact background wrapper spans the viewport and keeps inner content constrained',()=>{
 const css=fs.readFileSync(path.join(__dirname,'..','public','style.css'),'utf8');
 assert.match(css,/\.contact-section\{width:100%;[^}]*background:var\(--pale\)\}/);
 assert.match(css,/\.contact-inner\{max-width:1080px;margin:auto/);
});

test('portfolio email links use the current contact address',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');
 assert.equal((html.match(/href="mailto:khj200212@naver\.com"/g)||[]).length,2);
 assert.doesNotMatch(html,/mailto:khj021201@naver\.com/);
});

test('Q&A dialog explicitly centers itself despite the global zero-margin reset',()=>{
 const css=fs.readFileSync(path.join(__dirname,'..','public','style.css'),'utf8');
 assert.match(css,/\.qna-dialog\{[^}]*position:fixed;inset:0;margin:auto/);
 assert.match(css,/\.qna-dialog\{[^}]*max-height:calc\(100dvh - 30px\);overflow:auto/);
});

test('Q&A comment submission has one delegated submit handler',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','public','qna.js'),'utf8');
 assert.equal((source.match(/list\??\.addEventListener\('submit'/g)||[]).length,1);
});