const test=require('node:test');
const assert=require('node:assert/strict');
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