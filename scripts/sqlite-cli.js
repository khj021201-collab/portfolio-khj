const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');

const configuredPath = process.env.SQLITE3_PATH;
const defaultPath = path.join(
  process.env.LOCALAPPDATA || '',
  'Microsoft', 'WinGet', 'Packages',
  'SQLite.SQLite_Microsoft.Winget.Source_8wekyb3d8bbwe',
  'sqlite3.exe'
);
const executable = configuredPath || (process.platform === 'win32' ? defaultPath : 'sqlite3');

function runSql(databasePath, sql, { json = true } = {}) {
  return new Promise((resolve, reject) => {
    const args = [];
    if (json) args.push('-json');
    args.push(databasePath);
    const child = spawn(executable, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.once('error', (error) => reject(new Error(`Unable to run SQLite CLI (${executable}): ${error.message}`)));
    child.once('close', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8').trim() || `sqlite3 exited with status ${code}`));
        return;
      }
      resolve(Buffer.concat(stdout).toString('utf8').trim());
    });
    child.stdin.end(sql, 'utf8');
  });
}

function quoteSqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function query(databasePath, sql) {
  const output = await runSql(databasePath, sql);
  if (!output) return [];
  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`SQLite returned invalid JSON: ${error.message}`);
  }
}

async function initialize(databasePath, experiences) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  const statements = [
    `CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      tags TEXT NOT NULL,
      result TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );`,
    'CREATE INDEX IF NOT EXISTS experiences_category_idx ON experiences(category);',
    'BEGIN IMMEDIATE;'
  ];
  for (const item of experiences) {
    statements.push(`INSERT INTO experiences (id,category,title,summary,tags,result,sort_order)
      VALUES (${quoteSqlString(item.id)},${quoteSqlString(item.category)},${quoteSqlString(item.title)},${quoteSqlString(item.summary)},${quoteSqlString(JSON.stringify(item.tags))},${quoteSqlString(item.result)},${Number(item.sortOrder) || 0})
      ON CONFLICT(id) DO UPDATE SET category=excluded.category,title=excluded.title,summary=excluded.summary,tags=excluded.tags,result=excluded.result,sort_order=excluded.sort_order;`);
  }
  statements.push('COMMIT;');
  await runSql(databasePath, statements.join('\n'), { json: false });
}

module.exports = { executable, initialize, query, quoteSqlString, runSql };
