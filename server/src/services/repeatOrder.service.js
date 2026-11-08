const { v4: uuidv4 } = require('uuid');
const JsonStorage = require('../storage/jsonStorage');
const { RepeatOrderRequest, ALLOWED_REPEAT_STATUSES } = require('../models/repeatOrder.model');
const { Enquiry } = require('../models/enquiry.model');
const config = require('../config/env');
const mongoose = require('mongoose');

class RepeatOrderService {
  constructor() {
    this.jsonStorage = new JsonStorage('repeat_orders');
    this.enquiryJsonStorage = new JsonStorage('enquiries');
  }

  isMongo() {
    return config.storageMode === 'mongodb' &&
           Boolean(config.mongodb.uri) &&
           mongoose.connection.readyState === 1;
  }

  /**
   * Helper to parse numerical KG from quantity string
   */
  parseQuantityKg(qtyStr) {
    if (typeof qtyStr === 'number') return qtyStr;
    const match = String(qtyStr || '').match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get customer's past orders/confirmed enquiries by verified phone
   */
  async getCustomerOrderHistory(phone) {
    const cleanPhone = String(phone || '').replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      const err = new Error('A valid 10-digit mobile number is required');
      err.statusCode = 400;
      throw err;
    }

    if (this.isMongo()) {
      // Find matching enquiries with completed/in progress status or past repeat requests
      const enquiries = await Enquiry.find({
        phone: new RegExp(cleanPhone.slice(-10) + '$'),
        status: { $in: ['Completed', 'In Progress', 'Contacted', 'New'] }
      }).sort({ createdAt: -1 });

      const repeatRequests = await RepeatOrderRequest.find({
        customerPhone: new RegExp(cleanPhone.slice(-10) + '$')
      }).sort({ createdAt: -1 });

      return {
        phone: cleanPhone,
        enquiries: enquiries.map(e => e.toJSON()),
        repeatOrders: repeatRequests.map(r => r.toJSON())
      };
    } else {
      const allEnquiries = await this.enquiryJsonStorage.find();
      const enquiries = allEnquiries.filter(e => {
        const p = String(e.phone || '').replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');
        return p.endsWith(cleanPhone.slice(-10));
      });

      const allRepeats = await this.jsonStorage.find();
      const repeatOrders = allRepeats.filter(r => {
        const p = String(r.customerPhone || '').replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');
        return p.endsWith(cleanPhone.slice(-10));
      });

      return {
        phone: cleanPhone,
        enquiries,
        repeatOrders
      };
    }
  }

  /**
   * Create a repeat order request linked to a prior enquiry
   */
  async createRepeatOrder({
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
  }) {
    const cleanPhone = String(customerPhone || '').replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');
    const kg = this.parseQuantityKg(quantity);

    if (kg < 50) {
      const err = new Error('Minimum wholesale order quantity is 50 kg per delivery drop');
      err.statusCode = 400;
      throw err;
    }

    if (!originalEnquiryId || !cleanPhone || !businessName || !productInterest || !deliveryLocation) {
      const err = new Error('Missing required fields for repeat order request');
      err.statusCode = 400;
      throw err;
    }

    const id = `RPT-${uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()}`;

    const requestData = {
      id,
      originalEnquiryId,
      customerPhone: cleanPhone,
      customerEmail: customerEmail || 'trade@customer.com',
      businessName,
      contactPerson: contactPerson || 'Procurement Incharge',
      productInterest,
      quantity: `${kg} kg`,
      quantityKg: kg,
      deliveryLocation,
      requestedDispatchTime: requestedDispatchTime || 'Dawn 04:00 AM - 06:30 AM',
      customerNotes: customerNotes ? String(customerNotes).trim() : '',
      status: 'Pending Review',
      adminNotes: '',
      quotationId: null
    };

    if (this.isMongo()) {
      const created = await RepeatOrderRequest.create(requestData);
      return created.toJSON();
    } else {
      const created = await this.jsonStorage.insert(requestData);
      return created;
    }
  }

  /**
   * Admin: Query all repeat order requests
   */
  async queryRepeatOrders({ status, search, limit = 50 }) {
    if (this.isMongo()) {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (search) {
        filter.$or = [
          { id: new RegExp(search, 'i') },
          { businessName: new RegExp(search, 'i') },
          { customerPhone: new RegExp(search, 'i') }
        ];
      }
      const records = await RepeatOrderRequest.find(filter).sort({ createdAt: -1 }).limit(limit);
      return records.map(r => r.toJSON());
    } else {
      let records = await this.jsonStorage.find();
      if (status && status !== 'all') {
        records = records.filter(r => r.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        records = records.filter(r =>
          (r.id && r.id.toLowerCase().includes(s)) ||
          (r.businessName && r.businessName.toLowerCase().includes(s)) ||
          (r.customerPhone && r.customerPhone.includes(s))
        );
      }
      return records.slice(0, limit);
    }
  }

  /**
   * Admin: Update status / notes of repeat order request
   */
  async updateRepeatOrder(id, { status, adminNotes, quotationId }) {
    if (status && !ALLOWED_REPEAT_STATUSES.includes(status)) {
      const err = new Error(`Invalid repeat order status. Allowed: ${ALLOWED_REPEAT_STATUSES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = String(adminNotes).trim();
    if (quotationId !== undefined) updates.quotationId = quotationId;

    if (this.isMongo()) {
      const updated = await RepeatOrderRequest.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true, runValidators: true }
      );
      return updated ? updated.toJSON() : null;
    } else {
      return this.jsonStorage.updateById(id, updates);
    }
  }
}

module.exports = new RepeatOrderService();

