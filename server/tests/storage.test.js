const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs').promises;
const JsonStorage = require('../src/storage/jsonStorage');

test('Phase 2: JSON Storage Engine & Health Integration', async (t) => {
  const testDataDir = path.resolve(__dirname, '../data/_test_run');
  const storage = new JsonStorage('unit_test_collection', { dataDir: testDataDir });

  await t.test('1. Check storage health and directory provisioning', async () => {
    const health = await storage.checkHealth();
    assert.equal(health.healthy, true);
    assert.equal(health.type, 'local-json');
  });

  await t.test('2. Insert record and verify persistence fields', async () => {
    const doc = await storage.insert({
      id: 'TEST-001',
      title: 'Batch Inspection 1.8kg Whole Broiler',
      status: 'Verified',
      facility: 'Kannampalayam'
    });

    assert.equal(doc.id, 'TEST-001');
    assert.equal(doc.title, 'Batch Inspection 1.8kg Whole Broiler');
    assert.ok(doc.createdAt);
    assert.ok(doc.updatedAt);
  });

  await t.test('3. Read record back from disk', async () => {
    const found = await storage.findById('TEST-001');
    assert.ok(found);
    assert.equal(found.id, 'TEST-001');
    assert.equal(found.status, 'Verified');
  });

  await t.test('4. Update record and confirm updated fields', async () => {
    const updated = await storage.updateById('TEST-001', {
      status: 'Dispatched'
    });

    assert.equal(updated.status, 'Dispatched');
    assert.equal(updated.id, 'TEST-001');

    const retrieved = await storage.findById('TEST-001');
    assert.equal(retrieved.status, 'Dispatched');
  });

  await t.test('5. Data persistence after reinstantiating storage engine', async () => {
    // Simulate server restart by creating a new instance referencing same disk files
    const restartedStorage = new JsonStorage('unit_test_collection', { dataDir: testDataDir });
    const count = await restartedStorage.count();
    assert.equal(count, 1);

    const doc = await restartedStorage.findById('TEST-001');
    assert.equal(doc.status, 'Dispatched');
  });

  await t.test('6. Delete record and confirm cleanup', async () => {
    const deleted = await storage.deleteById('TEST-001');
    assert.equal(deleted, true);

    const afterDelete = await storage.findById('TEST-001');
    assert.equal(afterDelete, null);
  });

  // Clean up test directory after tests
  await fs.rm(testDataDir, { recursive: true, force: true });
});

