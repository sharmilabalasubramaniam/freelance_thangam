const express = require('express');
const repeatOrderService = require('../services/repeatOrder.service');
const { requireAdminAuth } = require('../middleware/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

/**
 * Customer: Retrieve past order / enquiry history by verified phone
 */
router.get('/customer-history', async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return errorResponse(res, 'Customer phone number is required', 400);
    }
    const history = await repeatOrderService.getCustomerOrderHistory(phone);
    return successResponse(res, history, 'Customer order history retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * Customer: Submit a repeat order request
 */
router.post('/request', async (req, res, next) => {
  try {
    const {
      originalEnquiryId,
      customerPhone,
      customerEmail,
      businessName,
      contactPerson,
      productInterest,
      quantity,
      deliveryLocation,
      requestedDispatchTime,
      customerNotes
    } = req.body;

    const created = await repeatOrderService.createRepeatOrder({
      originalEnquiryId,
      customerPhone,
      customerEmail,
      businessName,
      contactPerson,
      productInterest,
      quantity,
      deliveryLocation,
      requestedDispatchTime,
      customerNotes
    });

    return successResponse(res, created, 'Repeat order request logged for commercial review', 201);
  } catch (err) {
    if (err.statusCode === 400) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
});

/**
 * Admin: List all repeat order requests
 */
router.get('/admin/list', requireAdminAuth, async (req, res, next) => {
  try {
    const { status, search, limit } = req.query;
    const records = await repeatOrderService.queryRepeatOrders({ status, search, limit: parseInt(limit, 10) || 50 });
    return successResponse(res, { repeatOrders: records }, 'Repeat order requests retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * Admin: Update repeat order status / notes
 */
router.patch('/admin/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, quotationId } = req.body;
    const updated = await repeatOrderService.updateRepeatOrder(id, { status, adminNotes, quotationId });
    if (!updated) {
      return errorResponse(res, `Repeat order request ${id} not found`, 404);
    }
    return successResponse(res, updated, 'Repeat order status updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
});

module.exports = router;

