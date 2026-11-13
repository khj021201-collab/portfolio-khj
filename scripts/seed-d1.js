const fs = require('node:fs');
const path = require('node:path');
const experiences = require('./experiences.json');

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statements = experiences.map((item) => `
INSERT INTO experiences (id, category, title, summary, tags, result, sort_order)
VALUES (
  ${sqlString(item.id)},
  ${sqlString(item.category)},
  ${sqlString(item.title)},
  ${sqlString(item.summary)},
  ${sqlString(JSON.stringify(item.tags))},
  ${sqlString(item.result)},
  ${Number(item.sortOrder) || 0}
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  title=excluded.title,
  summary=excluded.summary,
  tags=excluded.tags,
  result=excluded.result,
  sort_order=excluded.sort_order;
`.trim()).join('\n\n');

const destination = path.join(__dirname, '..', 'migrations', '0002_seed_experiences.sql');
fs.writeFileSync(destination, `${statements}\n`, 'utf8');
console.log(`Wrote ${experiences.length} D1 seed statements to ${destination}`);
