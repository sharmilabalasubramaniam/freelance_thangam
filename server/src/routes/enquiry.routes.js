const express = require('express');
const { enquiryValidationRules } = require('../validators/enquiry.validator');
const { validate } = require('../middleware/validate');
const { requireAdminAuth } = require('../middleware/auth.middleware');
const {
  createEnquiryHandler,
  getEnquiriesHandler,
  getEnquiryByIdHandler,
  updateEnquiryHandler,
  deleteEnquiryHandler
} = require('../controllers/enquiry.controller');

const router = express.Router();

/**
 * Public route for wholesale buyers submitting commercial enquiry
 */
router.post('/', enquiryValidationRules, validate, createEnquiryHandler);

/**
 * Protected routes for admin management
 */
router.get('/', requireAdminAuth, getEnquiriesHandler);
router.get('/:id', requireAdminAuth, getEnquiryByIdHandler);
router.patch('/:id', requireAdminAuth, updateEnquiryHandler);
router.delete('/:id', requireAdminAuth, deleteEnquiryHandler);

module.exports = router;
