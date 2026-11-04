const path=require('node:path');
const Database=require('better-sqlite3');
const fs=require('node:fs/promises');
const defaultExperiences=require('./experiences.json');
const databasePath=path.join(__dirname,'..','data','portfolio.sqlite');
async function createApp(){
 await fs.mkdir(path.dirname(databasePath),{recursive:true});
 const database=new Database(databasePath);
 database.pragma('journal_mode = WAL');
 database.exec('CREATE TABLE IF NOT EXISTS experiences (id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, tags TEXT NOT NULL, result TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0)');
 const count=database.prepare('SELECT COUNT(*) AS count FROM experiences').get().count;
 if(!count){const insert=database.prepare('INSERT INTO experiences (id,category,title,summary,tags,result,sort_order) VALUES (@id,@category,@title,@summary,@tags,@result,@sortOrder)');const seed=database.transaction((items)=>items.forEach(item=>insert.run({...item,tags:JSON.stringify(item.tags)})));seed(defaultExperiences);}
 return {database};
}
function queryExperiences(database,category='all',query=''){
 const conditions=[];const values=[];
 if(category!=='all'){conditions.push('category = ?');values.push(category);}
 if(query){const term=`%${query}%`;conditions.push('(title LIKE ? OR summary LIKE ? OR tags LIKE ?)');values.push(term,term,term);}
 const where=conditions.length?`WHERE ${conditions.join(' AND ')}`:'';
 return database.prepare(`SELECT id,category,title,summary,tags,result,sort_order FROM experiences ${where} ORDER BY sort_order,id`).all(...values).map(row=>({...row,tags:JSON.parse(row.tags)}));
}
module.exports={createApp,queryExperiences};
