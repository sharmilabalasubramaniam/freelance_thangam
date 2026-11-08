const express = require('express');
const quotationService = require('../services/quotation.service');
const { requireAdminAuth } = require('../middleware/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

/**
 * Public / Customer: View single quotation by ID or quotation number
 */
router.get('/view/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const quote = await quotationService.getQuotation(identifier);
    if (!quote) {
      return errorResponse(res, 'Quotation not found or expired', 404);
    }
    return successResponse(res, quote, 'Quotation details retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * Customer: Action quotation (Accept, Reject, Request Discussion)
 */
router.post('/view/:identifier/respond', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const { action, feedbackNotes, customerPhone } = req.body;
    const updated = await quotationService.recordCustomerAction(identifier, {
      action,
      feedbackNotes,
      customerPhone
    });
    return successResponse(res, updated, `Quotation ${action.toLowerCase()} successfully`);
  } catch (err) {
    if (err.statusCode === 400 || err.statusCode === 403 || err.statusCode === 404) {
      return errorResponse(res, err.message, err.statusCode);
    }
    next(err);
  }
});

/**
 * Admin: Create quotation
 */
router.post('/', requireAdminAuth, async (req, res, next) => {
  try {
    const {
      sourceType,
      sourceId,
      customer,
      items,
      logisticsFee,
      validDays,
      adminNotes
    } = req.body;

    const created = await quotationService.createQuotation({
      sourceType,
      sourceId,
      customer,
      items,
      logisticsFee,
      validDays,
      adminNotes
    });

    return successResponse(res, created, 'Commercial quotation generated successfully', 201);
  } catch (err) {
    if (err.statusCode === 400) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
});

/**
 * Admin: Query quotations
 */
router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const { status, search, limit } = req.query;
    const quotes = await quotationService.queryQuotations({
      status,
      search,
      limit: parseInt(limit, 10) || 50
    });
    return successResponse(res, { quotations: quotes }, 'Quotations retrieved successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * Admin: Get quotation conversion metrics & follow-up counters
 */
router.get('/metrics', requireAdminAuth, async (req, res, next) => {
  try {
    const metrics = await quotationService.getQuotationMetrics();
    return successResponse(res, metrics, 'Quotation metrics calculated');
  } catch (err) {
    next(err);
  }
});

/**
 * Admin: Revise quotation
 */
router.post('/:id/revise', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, logisticsFee, validDays, adminNotes } = req.body;
    const revised = await quotationService.reviseQuotation(id, {
      items,
      logisticsFee,
      validDays,
      adminNotes
    });
    return successResponse(res, revised, 'Quotation revised and new version generated', 201);
  } catch (err) {
    if (err.statusCode === 400 || err.statusCode === 404) {
      return errorResponse(res, err.message, err.statusCode);
    }
    next(err);
  }
});

module.exports = router;

