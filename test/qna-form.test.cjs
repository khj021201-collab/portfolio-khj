const test=require('node:test');
const assert=require('node:assert/strict');
const {validateFields}=require('../public/qna.js');

const fields=[
 {name:'authorName',label:'작성자명',max:40},
 {name:'title',label:'제목',max:120},
 {name:'content',label:'내용',max:5000},
];

test('form validation rejects whitespace-only values and identifies the field',()=>{
 const result=validateFields({authorName:'홍길동',title:'   \t',content:'본문'},fields);
 assert.equal(result.field.name,'title');
 assert.match(result.message,/제목/);
});

test('form validation rejects values longer than the configured limit',()=>{
 const result=validateFields({authorName:'홍'.repeat(41),title:'제목',content:'본문'},fields);
 assert.equal(result.field.name,'authorName');
 assert.match(result.message,/40자/);
});

test('form validation accepts trimmed non-empty values at the length limit',()=>{
 const values={authorName:'홍길동',title:' 제목 ',content:'본문'.repeat(2500)};
 assert.equal(validateFields(values,fields),null);
});