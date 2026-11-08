const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const cookieParser = require('cookie-parser');
const JsonStorage = require('../src/storage/jsonStorage');
const AuthService = require('../src/services/auth.service');
const EnquiryService = require('../src/services/enquiry.service');
const { requireAdminAuth } = require('../src/middleware/auth.middleware');
const config = require('../src/config/env');

test('Phase 4: Admin Authentication, Authorization & Dashboard CRUD', async (t) => {
  const testDataDir = path.resolve(__dirname, '../data/_test_phase4');
  const adminStorage = new JsonStorage('test_phase4_admins', { dataDir: testDataDir });
  const enquiryStorage = new JsonStorage('test_phase4_enquiries', { dataDir: testDataDir });

  const authService = new AuthService(adminStorage);
  const enquiryService = new EnquiryService(enquiryStorage);

  // Setup test Express app with exact routes and middleware
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Mount Auth Routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
      const { user, token } = await authService.login(email, password);
      res.cookie(config.jwt.cookieName, token, { httpOnly: true });
      res.json({ success: true, data: { user, token } });
    } catch (err) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  });

  // Custom auth middleware for isolated test storage
  const testRequireAuth = async (req, res, next) => {
    let token = req.cookies ? req.cookies[config.jwt.cookieName] : null;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const user = await authService.verifyToken(token);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    req.admin = user;
    next();
  };

  app.get('/api/admin/me', testRequireAuth, (req, res) => {
    res.json({ success: true, data: { user: req.admin } });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.clearCookie(config.jwt.cookieName);
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/admin/overview', testRequireAuth, async (req, res) => {
    const overview = await enquiryService.getOverviewMetrics();
    res.json({ success: true, data: overview });
  });

  app.get('/api/enquiries', testRequireAuth, async (req, res) => {
    const data = await enquiryService.queryEnquiries(req.query);
    res.json({ success: true, data });
  });

  app.get('/api/enquiries/:id', testRequireAuth, async (req, res) => {
    const item = await enquiryService.getEnquiryById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  });

  app.patch('/api/enquiries/:id', testRequireAuth, async (req, res) => {
    try {
      const updated = await enquiryService.updateEnquiry(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/enquiries/:id', testRequireAuth, async (req, res) => {
    const deleted = await enquiryService.deleteEnquiry(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  });

  let server;
  const PORT = 5097;
  let authCookie = '';
  let testEnquiryId = '';

  await t.test('Setup: Seed test admin & start test server', async () => {
    await new Promise(resolve => {
      server = app.listen(PORT, resolve);
    });
    // Provision test admin
    await authService.createAdmin({
      email: 'testops@thangamfarms.in',
      password: 'SecureTestPassword123!',
      name: 'Test Operations Admin'
    });
    assert.ok(server);
  });

  // --- AUTHENTICATION TESTS ---

  await t.test('1. Valid admin login succeeds and returns user without password hash', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testops@thangamfarms.in',
        password: 'SecureTestPassword123!'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'testops@thangamfarms.in');
    assert.equal(body.data.user.passwordHash, undefined);
    assert.ok(body.data.token);

    // Save cookie for subsequent authenticated calls
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    authCookie = setCookie.split(';')[0];
  });

  await t.test('2. Invalid password returns HTTP 401', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testops@thangamfarms.in',
        password: 'WrongPassword!'
      })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /invalid email or password/i);
  });

  await t.test('3. Missing credentials return HTTP 400', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' })
    });

    assert.equal(res.status, 400);
  });

  await t.test('4. Unauthenticated request to protected endpoint returns HTTP 401', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await t.test('5. Authenticated request using cookie succeeds on GET /api/admin/me', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/me`, {
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'testops@thangamfarms.in');
  });

  await t.test('6. Empty database returns zero counts on GET /api/admin/overview', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/overview`, {
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.total, 0);
    assert.equal(body.data.new, 0);
  });

  // --- ENQUIRY MANAGEMENT TESTS ---

  await t.test('7. Seed real test enquiries into storage', async () => {
    const e1 = await enquiryService.createEnquiry({
      fullName: 'S. Ramanathan',
      businessName: 'Kongu Grand Hotel',
      phone: '9843111111',
      email: 'ramanathan@kongugrand.in',
      productInterest: 'Fresh Whole Chicken',
      quantity: '300 kg daily',
      deliveryLocation: 'Peelamedu, Coimbatore'
    });
    testEnquiryId = e1.id;

    await enquiryService.createEnquiry({
      fullName: 'A. Murugan',
      businessName: 'Coimbatore Biryani Hub',
      phone: '9843222222',
      email: 'murugan@biryanihub.in',
      productInterest: 'Chicken Cuts',
      quantity: '150 kg daily',
      deliveryLocation: 'RS Puram, Coimbatore'
    });

    assert.ok(testEnquiryId);
  });

  await t.test('8. GET /api/admin/overview returns real calculated metrics', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/overview`, {
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.total, 2);
    assert.equal(body.data.new, 2);
    assert.equal(body.data.completed, 0);
    assert.equal(body.data.recent.length, 2);
  });

  await t.test('9. GET /api/enquiries supports search query', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries?search=Biryani`, {
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.enquiries.length, 1);
    assert.equal(body.data.enquiries[0].businessName, 'Coimbatore Biryani Hub');
  });

  await t.test('10. GET /api/enquiries supports status filter', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries?status=Completed`, {
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.enquiries.length, 0);
  });

  await t.test('11. GET /api/enquiries/:id returns single record', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries/${testEnquiryId}`, {
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.id, testEnquiryId);
    assert.equal(body.data.businessName, 'Kongu Grand Hotel');
  });

  await t.test('12. PATCH /api/enquiries/:id updates status and admin notes', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie
      },
      body: JSON.stringify({
        status: 'In Progress',
        adminNotes: 'Sample rate quote sent via WhatsApp'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.status, 'In Progress');
    assert.equal(body.data.adminNotes, 'Sample rate quote sent via WhatsApp');

    // Customer fields and ID must remain untouched
    assert.equal(body.data.id, testEnquiryId);
    assert.equal(body.data.businessName, 'Kongu Grand Hotel');
  });

  await t.test('13. PATCH /api/enquiries/:id rejects invalid status with HTTP 400', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie
      },
      body: JSON.stringify({
        status: 'BogusStatus'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /invalid status/i);
  });

  await t.test('14. DELETE /api/enquiries/:id deletes record', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/enquiries/${testEnquiryId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);

    const check = await fetch(`http://localhost:${PORT}/api/enquiries/${testEnquiryId}`, {
      headers: { Cookie: authCookie }
    });
    assert.equal(check.status, 404);
  });

  await t.test('15. POST /api/admin/logout clears auth session', async () => {
    const res = await fetch(`http://localhost:${PORT}/api/admin/logout`, {
      method: 'POST',
      headers: { Cookie: authCookie }
    });

    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(
      setCookie.toLowerCase().includes('expires=thu, 01 jan 1970') ||
      setCookie.toLowerCase().includes('max-age=0') ||
      setCookie.includes(`${config.jwt.cookieName}=;`)
    );
  });

  await t.test('Teardown: Close test server and cleanup test storage', async () => {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(testDataDir, { recursive: true, force: true });
  });
});
