const path = require('node:path');
const fs = require('node:fs/promises');
const { initialize } = require('./sqlite-cli');
const experiences = require('./experiences.json');
async function main() {
 const file = path.join(__dirname, '..', 'data', 'portfolio.sqlite');
 await initialize(file, experiences);
 console.log(`Initialized ${file} with ${experiences.length} experiences using sqlite3 CLI.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
