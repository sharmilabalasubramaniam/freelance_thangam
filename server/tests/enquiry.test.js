const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const JsonStorage = require('../src/storage/jsonStorage');
const EnquiryService = require('../src/services/enquiry.service');
const { enquiryValidationRules } = require('../src/validators/enquiry.validator');
const { validate } = require('../src/middleware/validate');

test('Phase 3: Enquiry API & Persistence Test Suite', async (t) => {
  const testDataDir = path.resolve(__dirname, '../data/_test_enquiries');
  const testStorage = new JsonStorage('test_enquiries', { dataDir: testDataDir });
  const enquiryService = new EnquiryService(testStorage);

  // Setup test Express app with enquiry route
  const app = express();
  app.use(express.json());
  app.post('/api/enquiries', enquiryValidationRules, validate, async (req, res, next) => {
    try {
      const result = await enquiryService.createEnquiry(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  let server;
  const PORT = 5098;

  await t.test('Setup: Start isolated test server', async () => {
    await new Promise(resolve => {
      server = app.listen(PORT, resolve);
    });
    assert.ok(server);
  });

  const validPayload = {
    fullName: 'K. R. Natarajan',
    businessName: 'Kongu Heritage Hotel & Banquets',
    phone: '9843123456',
    email: 'purchase@konguheritage.in',
    productInterest: 'Fresh Whole Chicken',
    quantity: '200 kg daily',
    deliveryLocation: 'Avinashi Road, Coimbatore',
    message: 'Dawn delivery before 5:30 AM required'
  };

  await t.test('1. Valid enquiry submission returns HTTP 201', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.id);
  });

  await t.test('2. Saved enquiry receives a unique ID format and proper timestamps', async () => {
    const all = await testStorage.find();
    assert.equal(all.length, 1);
    const item = all[0];
    assert.match(item.id, /^ENQ-[A-Z0-9]{6}$/);
    assert.equal(item.status, 'New');
    assert.ok(item.createdAt);
    assert.ok(item.updatedAt);
  });

  await t.test('3. Client-supplied status and ID cannot override server values', async () => {
    const maliciousPayload = {
      ...validPayload,
      phone: '9843999999',
      id: 'CUSTOM-HACK-ID',
      status: 'Completed'
    };

    const res = await fetch(`http://localhost:${PORT}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousPayload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.notEqual(body.data.id, 'CUSTOM-HACK-ID');
    assert.match(body.data.id, /^ENQ-[A-Z0-9]{6}$/);
    assert.equal(body.data.status, 'New');
  });

  await t.test('4. Missing required fields return HTTP 400', async () => {
    const invalidPayload = {
      fullName: '',
      businessName: '',
      phone: '',
      email: '',
      productInterest: '',
      quantity: '',
      deliveryLocation: ''
    };

    const res = await fetch(`http://localhost:${PORT}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.errors.length >= 5);
  });

  await t.test('5. Invalid email returns HTTP 400', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validPayload,
        phone: '9843888888',
        email: 'not-an-email-address'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /valid email/i);
  });

  await t.test('6. Invalid product value returns HTTP 400', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validPayload,
        phone: '9843777777',
        productInterest: 'Invalid Chicken Type 123'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Product must be one of/i);
  });

  await t.test('7. Optional message can be empty', async () => {
    const noMessagePayload = {
      ...validPayload,
      phone: '9843666666',
      message: ''
    };

    const res = await fetch(`http://localhost:${PORT}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noMessagePayload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.message, '');
  });

  await t.test('8. Enquiry persists across storage re-instantiation (restart simulation)', async () => {
    const restartedStorage = new JsonStorage('test_enquiries', { dataDir: testDataDir });
    const count = await restartedStorage.count();
    assert.ok(count >= 3);
  });

  await t.test('Teardown: Close test server and clean up test data', async () => {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(testDataDir, { recursive: true, force: true });
  });
});

