const express = require('express');
const { loginHandler, getMeHandler, logoutHandler } = require('../controllers/auth.controller');
const { getOverviewHandler, exportEnquiriesCsvHandler } = require('../controllers/enquiry.controller');
const { requireAdminAuth } = require('../middleware/auth.middleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Public Admin Login Endpoint (Rate-limited)
 */
router.post('/login', loginRateLimiter, loginHandler);

/**
 * Protected Endpoints
 */
router.get('/me', requireAdminAuth, getMeHandler);
router.post('/logout', requireAdminAuth, logoutHandler);
router.get('/overview', requireAdminAuth, getOverviewHandler);
router.get('/export-csv', requireAdminAuth, exportEnquiriesCsvHandler);

module.exports = router;
