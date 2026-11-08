const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const config = require('../src/config/env');

test('Phase 2: API Server Foundation & Health Endpoint', async (t) => {
  let server;
  const PORT = 5099;

  await t.test('1. Start server instance on test port', async () => {
    if (config.storageMode === 'mongodb' && config.mongodb.uri) {
      await connectDatabase().catch(() => {});
    }
    await new Promise((resolve) => {
      server = app.listen(PORT, () => resolve());
    });
    assert.ok(server);
  });

  await t.test('2. GET /api/health responds with 200 and valid schema', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'UP');
    assert.equal(data.data.brand, 'STP Chickens');
    assert.equal(data.data.facility, 'Kannampalayam, Coimbatore');
    assert.equal(typeof data.data.storage.healthy, 'boolean');
    assert.ok(data.data.storage.type === 'local-json' || data.data.storage.type === 'mongodb-atlas');
  });

  await t.test('3. Non-existent routes return structured 404', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/non_existent_route`);
    assert.equal(res.status, 404);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Route not found/);
    assert.ok(data.timestamp);
  });

  await t.test('4. Close test server instance cleanly', async () => {
    await new Promise((resolve) => server.close(resolve));
    if (config.storageMode === 'mongodb' && config.mongodb.uri) {
      await disconnectDatabase().catch(() => {});
    }
  });
});

