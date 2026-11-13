const path = require('node:path');
const experiences = require('./experiences.json');
const { initialize, query, quoteSqlString } = require('./sqlite-cli');
const databasePath = path.join(__dirname, '..', 'data', 'portfolio.sqlite');
async function createApp(dbPath = databasePath) { await initialize(dbPath, experiences); return { databasePath: dbPath }; }
async function queryExperiences(dbPath, category = 'all', searchTerm = '') {
 const conditions = [];
 if (category !== 'all') conditions.push(`category = ${quoteSqlString(category)}`);
 if (searchTerm) { const term = quoteSqlString(`%${searchTerm}%`); conditions.push(`(title LIKE ${term} OR summary LIKE ${term} OR tags LIKE ${term})`); }
 const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
 const rows = await query(dbPath, `SELECT id,category,title,summary,tags,result,sort_order FROM experiences ${where} ORDER BY sort_order,id;`);
 return rows.map(row => ({...row,tags:JSON.parse(row.tags)}));
}
async function queryCategories(dbPath) { const rows = await query(dbPath,'SELECT DISTINCT category FROM experiences ORDER BY category;'); return rows.map(({category})=>category); }
module.exports = { createApp, databasePath, queryCategories, queryExperiences };
