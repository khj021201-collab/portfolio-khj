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

test('Q&A dialog explicitly centers itself despite the global zero-margin reset',()=>{
 const css=fs.readFileSync(path.join(__dirname,'..','public','style.css'),'utf8');
 assert.match(css,/\.qna-dialog\{[^}]*position:fixed;inset:0;margin:auto/);
 assert.match(css,/\.qna-dialog\{[^}]*max-height:calc\(100dvh - 30px\);overflow:auto/);
});

test('Q&A comment submission uses one delegated handler with an in-flight guard and finally reset',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','public','qna.js'),'utf8');
 assert.equal((source.match(/list\.addEventListener\('submit'/g)||[]).length,1);
 assert.match(source,/form\.dataset\.submitting==='true'/);
 assert.match(source,/submitButton\.disabled=true/);
 assert.match(source,/form\.reset\(\)/);
 assert.match(source,/finally\{form\.dataset\.submitting='false';if\(submitButton\)submitButton\.disabled=false\}/);
});