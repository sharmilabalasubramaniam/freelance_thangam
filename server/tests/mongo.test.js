const test = require('node:test');
const assert = require('node:assert/strict');
const { connectDatabase } = require('../src/config/database');
const config = require('../src/config/env');
const { getStorageHealth } = require('../src/services/storageFactory');

test('Phase 5: Database Connection & Graceful Degrade Suite', async (t) => {
  await t.test('1. connectDatabase rejects gracefully when MONGO_URI is missing or empty', async () => {
    const originalUri = config.mongodb.uri;
    config.mongodb.uri = '';

    await assert.rejects(
      async () => {
        await connectDatabase();
      },
      {
        message: /MONGO_URI is not defined in environment variables/
      }
    );

    config.mongodb.uri = originalUri;
  });

  await t.test('2. Storage health check reports correct status and storage mode', async () => {
    const health = getStorageHealth();
    assert.ok(health.type);
    if (health.type === 'local-json') {
      assert.equal(health.healthy, true);
      assert.ok(health.dataDir);
    } else {
      assert.ok(health.configured !== undefined);
    }
  });

  await t.test('3. Sanitize error messages to prevent password leaks during invalid connection strings', async () => {
    const originalUri = config.mongodb.uri;
    config.mongodb.uri = 'mongodb+srv://secretuser:supersecretpass@cluster0.mongodb.net/test';

    try {
      await connectDatabase();
      assert.fail('Should have failed connection');
    } catch (err) {
      assert.equal(err.message.includes('supersecretpass'), false);
      assert.ok(err.message.includes('***:***') || !err.message.includes('supersecretpass'));
    } finally {
      config.mongodb.uri = originalUri;
    }
  });
});

