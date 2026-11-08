const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('Phase 6: Smart Repeat Orders & Quotation Management Workflows', async (t) => {
  let server;
  let adminCookie = '';
  let testRepeatOrderId = '';
  let testQuotationId = '';
  const PORT = 5098;

  await t.test('Setup: Start isolated test server instance', async () => {
    await new Promise((resolve) => {
      server = app.listen(PORT, () => resolve());
    });
    assert.ok(server);
  });

  await t.test('1. Reject repeat order request below 50 kg minimum order requirement with HTTP 400', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/repeat-orders/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalEnquiryId: 'ENQ-TEST-01',
        customerPhone: '9843011111',
        customerEmail: 'test@hotel.com',
        businessName: 'Hotel Test',
        productInterest: 'Fresh Whole Chicken',
        quantity: '20 kg',
        deliveryLocation: 'Coimbatore'
      })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /50 kg/);
  });

  await t.test('2. Successfully submit valid repeat order request meeting >= 50 kg with HTTP 201', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/repeat-orders/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalEnquiryId: 'ENQ-TEST-01',
        customerPhone: '9843011111',
        customerEmail: 'test@hotel.com',
        businessName: 'Hotel Test',
        contactPerson: 'Chef Kumar',
        productInterest: 'Fresh Whole Chicken',
        quantity: '80 kg daily',
        deliveryLocation: 'Gandhipuram, Coimbatore',
        requestedDispatchTime: '04:30 AM',
        customerNotes: 'Require clean moisture-retained dressing'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.id.startsWith('RPT-'));
    assert.equal(data.data.status, 'Pending Review');
    testRepeatOrderId = data.data.id;
  });

  await t.test('3. Authenticate admin user to manage quotations', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@thangamfarms.in',
        password: 'ThangamFarms@2026Admin!'
      })
    });
    assert.equal(res.status, 200);
    adminCookie = res.headers.get('set-cookie');
    assert.ok(adminCookie);
  });

  await t.test('4. Admin creates quotation for repeat order with unit prices & validity', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie
      },
      body: JSON.stringify({
        sourceType: 'repeat_order',
        sourceId: testRepeatOrderId,
        customer: {
          fullName: 'Chef Kumar',
          businessName: 'Hotel Test',
          phone: '9843011111',
          email: 'test@hotel.com',
          deliveryLocation: 'Gandhipuram, Coimbatore'
        },
        items: [
          {
            productName: 'Fresh Whole Chicken',
            cutSpecification: 'Whole carcass dressed',
            quantityKg: 80,
            unitPricePerKg: 175
          }
        ],
        logisticsFee: 150,
        validDays: 2,
        adminNotes: 'Confirmed 04:30 AM dawn logistics availability'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.id.startsWith('QUO-'));
    assert.ok(data.data.quotationNumber.startsWith('QT-'));
    assert.equal(data.data.grandTotal, 80 * 175 + 150);
    testQuotationId = data.data.id;
  });

  await t.test('5. Customer views quotation and verifies transparent item breakdown', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/quotations/view/${testQuotationId}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.customer.businessName, 'Hotel Test');
  });

  await t.test('6. Customer accepts quotation recording timestamp and status update', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/quotations/view/${testQuotationId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Accepted',
        feedbackNotes: 'Rates confirmed. Please schedule dawn drop.',
        customerPhone: '9843011111'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'Accepted');
    assert.equal(data.data.customerFeedback.action, 'Accepted');
  });

  await t.test('7. Admin revises quotation while preserving versioning and original state', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/quotations/${testQuotationId}/revise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie
      },
      body: JSON.stringify({
        items: [
          {
            productName: 'Fresh Whole Chicken',
            cutSpecification: 'Whole carcass dressed',
            quantityKg: 100,
            unitPricePerKg: 170
          }
        ],
        logisticsFee: 100,
        validDays: 3,
        adminNotes: 'Volume tiered price revision for 100kg batch'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.version, 2);
    assert.ok(data.data.quotationNumber.includes('-R2'));
    assert.equal(data.data.grandTotal, 100 * 170 + 100);
  });

  await t.test('8. Admin metrics compute real quotation conversion numbers from storage', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/quotations/metrics`, {
      headers: { cookie: adminCookie }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(typeof data.data.total, 'number');
    assert.equal(typeof data.data.conversionRate, 'number');
  });

  await t.test('Teardown: Close test server instance', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});

