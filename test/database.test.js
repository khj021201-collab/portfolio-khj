const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { createApp, queryCategories, queryExperiences } = require('../scripts/database');

test('SQLite CLI initializes experience data and supports filtering/search', async () => {
  const tempDatabase = path.join(os.tmpdir(), `portfolio-test-${process.pid}-${Date.now()}.sqlite`);
  try {
    const { databasePath } = await createApp(tempDatabase);
    assert.equal((await queryExperiences(databasePath)).length, 8);
    assert.equal((await queryExperiences(databasePath, '현장 경험')).length, 1);
    assert.match((await queryExperiences(databasePath, 'all', '바나나'))[0].title, /바나나꽃/);
    assert.deepEqual(await queryExperiences(databasePath, 'all', 'nothing'), []);
    assert.equal((await queryCategories(databasePath)).length, 4);
  } finally {
    await fs.rm(tempDatabase, { force: true });
  }
});

test('Search values are safely quoted and tags decode', async () => {
  const tempDatabase = path.join(os.tmpdir(), `portfolio-test-${process.pid}-${Date.now()}.sqlite`);
  try {
    const { databasePath } = await createApp(tempDatabase);
    assert.equal((await queryExperiences(databasePath, 'all', "%' OR 1=1 --")).length, 0);
    assert.ok(Array.isArray((await queryExperiences(databasePath))[0].tags));
  } finally {
    await fs.rm(tempDatabase, { force: true });
  }
});
