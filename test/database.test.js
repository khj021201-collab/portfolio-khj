const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp,queryExperiences}=require('../scripts/database');
test('SQLite initializes experience data and supports filtering/search',async()=>{const {database}=await createApp();try{assert.equal(queryExperiences(database).length,8);assert.equal(queryExperiences(database,'현장 경험').length,1);assert.match(queryExperiences(database,'all','바나나')[0].title,/바나나꽃/);assert.deepEqual(queryExperiences(database,'all','nothing'),[]);}finally{database.close();}});
test('SQL search text is parameterized and tags decode',async()=>{const {database}=await createApp();try{assert.equal(queryExperiences(database,'all',"%' OR 1=1 --").length,0);assert.ok(Array.isArray(queryExperiences(database)[0].tags));}finally{database.close();}});
