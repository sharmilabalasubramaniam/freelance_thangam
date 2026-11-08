const { v4: uuidv4 } = require('uuid');
const JsonStorage = require('../storage/jsonStorage');
const { Quotation, ALLOWED_QUOTATION_STATUSES } = require('../models/quotation.model');
const config = require('../config/env');
const mongoose = require('mongoose');

class QuotationService {
  constructor() {
    this.jsonStorage = new JsonStorage('quotations');
  }

  isMongo() {
    return config.storageMode === 'mongodb' &&
           Boolean(config.mongodb.uri) &&
           mongoose.connection.readyState === 1;
  }

  generateQuotationNumber() {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `QT-${dateStr}-${rand}`;
  }

  /**
   * Admin: Create a new quotation
   */
  async createQuotation({
    sourceType = 'enquiry',
    sourceId,
    customer,
    items,
    logisticsFee = 0,
    validDays = 2,
    adminNotes = ''
  }) {
    if (!sourceId || !customer || !items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Quotation requires sourceId, customer info, and at least one item');
      err.statusCode = 400;
      throw err;
    }

    // Validate 50 kg MOQ across items
    let totalKg = 0;
    let subtotal = 0;

    const validatedItems = items.map(it => {
      const kg = parseFloat(it.quantityKg) || 0;
      const unitPrice = parseFloat(it.unitPricePerKg) || 0;
      totalKg += kg;
      const itemTotal = parseFloat((kg * unitPrice).toFixed(2));
      subtotal += itemTotal;

      return {
        productName: it.productName || 'Fresh Wholesale Chicken',
        cutSpecification: it.cutSpecification || 'Standard Butchery Trim',
        quantityKg: kg,
        unitPricePerKg: unitPrice,
        totalAmount: itemTotal
      };
    });

    if (totalKg < 50) {
      const err = new Error('Total quotation quantity must meet the 50 kg minimum order requirement');
      err.statusCode = 400;
      throw err;
    }

    const grandTotal = parseFloat((subtotal + (parseFloat(logisticsFee) || 0)).toFixed(2));
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    const quotationData = {
      id: `QUO-${uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      quotationNumber: this.generateQuotationNumber(),
      version: 1,
      parentQuotationId: null,
      sourceType,
      sourceId,
      customer: {
        fullName: customer.fullName,
        businessName: customer.businessName,
        phone: String(customer.phone).replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, ''),
        email: customer.email,
        deliveryLocation: customer.deliveryLocation
      },
      items: validatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      logisticsFee: parseFloat(logisticsFee) || 0,
      grandTotal,
      validUntil,
      status: 'Sent',
      adminNotes: adminNotes ? String(adminNotes).trim() : '',
      customerFeedback: {
        action: null,
        feedbackNotes: '',
        actionTimestamp: null
      },
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next-day follow-up
      convertedToOrder: false
    };

    if (this.isMongo()) {
      const created = await Quotation.create(quotationData);
      return created.toJSON();
    } else {
      const created = await this.jsonStorage.insert(quotationData);
      return created;
    }
  }

  /**
   * Admin or Customer: Get quotation by ID or quotationNumber
   */
  async getQuotation(identifier) {
    if (this.isMongo()) {
      const quote = await Quotation.findOne({
        $or: [{ id: identifier }, { quotationNumber: identifier }]
      });
      return quote ? quote.toJSON() : null;
    } else {
      const quotes = await this.jsonStorage.find();
      const quote = quotes.find(q => q.id === identifier || q.quotationNumber === identifier);
      return quote || null;
    }
  }

  /**
   * Customer: Respond to quotation (Accept, Reject, Request Discussion)
   */
  async recordCustomerAction(quotationId, { action, feedbackNotes, customerPhone }) {
    const validActions = ['Accepted', 'Rejected', 'Requested Discussion'];
    if (!validActions.includes(action)) {
      const err = new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const quote = await this.getQuotation(quotationId);
    if (!quote) {
      const err = new Error('Quotation not found');
      err.statusCode = 404;
      throw err;
    }

    // Verify phone matches for security
    if (customerPhone) {
      const cleanPhone = String(customerPhone).replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');
      if (!quote.customer.phone.endsWith(cleanPhone.slice(-10))) {
        const err = new Error('Unauthorized: customer contact does not match quotation record');
        err.statusCode = 403;
        throw err;
      }
    }

    const updates = {
      status: action === 'Accepted' ? 'Accepted' : (action === 'Rejected' ? 'Rejected' : 'Sent'),
      customerFeedback: {
        action,
        feedbackNotes: feedbackNotes ? String(feedbackNotes).trim() : '',
        actionTimestamp: new Date()
      }
    };

    if (this.isMongo()) {
      const updated = await Quotation.findOneAndUpdate(
        { id: quote.id },
        { $set: updates },
        { new: true }
      );
      return updated.toJSON();
    } else {
      return this.jsonStorage.updateById(quote.id, updates);
    }
  }

  /**
   * Admin: Revise quotation (Preserves historical version)
   */
  async reviseQuotation(originalId, { items, logisticsFee, validDays, adminNotes }) {
    const original = await this.getQuotation(originalId);
    if (!original) {
      const err = new Error('Original quotation not found');
      err.statusCode = 404;
      throw err;
    }

    // Mark original as Revised
    if (this.isMongo()) {
      await Quotation.updateOne({ id: original.id }, { $set: { status: 'Revised' } });
    } else {
      await this.jsonStorage.updateById(original.id, { status: 'Revised' });
    }

    // Compute new version items
    let subtotal = 0;
    const validatedItems = items.map(it => {
      const kg = parseFloat(it.quantityKg) || 0;
      const unitPrice = parseFloat(it.unitPricePerKg) || 0;
      const total = parseFloat((kg * unitPrice).toFixed(2));
      subtotal += total;
      return {
        productName: it.productName || 'Fresh Wholesale Chicken',
        cutSpecification: it.cutSpecification || 'Standard Butchery Trim',
        quantityKg: kg,
        unitPricePerKg: unitPrice,
        totalAmount: total
      };
    });

    const grandTotal = parseFloat((subtotal + (parseFloat(logisticsFee) || 0)).toFixed(2));
    const validUntil = new Date(Date.now() + (validDays || 2) * 24 * 60 * 60 * 1000);

    const revisedData = {
      id: `QUO-${uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
      quotationNumber: `${original.quotationNumber.split('-R')[0]}-R${original.version + 1}`,
      version: original.version + 1,
      parentQuotationId: original.id,
      sourceType: original.sourceType,
      sourceId: original.sourceId,
      customer: original.customer,
      items: validatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      logisticsFee: parseFloat(logisticsFee) || 0,
      grandTotal,
      validUntil,
      status: 'Sent',
      adminNotes: adminNotes || `Revised from version ${original.version}`,
      customerFeedback: { action: null, feedbackNotes: '', actionTimestamp: null },
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      convertedToOrder: false
    };

    if (this.isMongo()) {
      const created = await Quotation.create(revisedData);
      return created.toJSON();
    } else {
      return this.jsonStorage.insert(revisedData);
    }
  }

  /**
   * Admin: Query quotations with filters & metrics
   */
  async queryQuotations({ status, search, limit = 50 }) {
    if (this.isMongo()) {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (search) {
        filter.$or = [
          { quotationNumber: new RegExp(search, 'i') },
          { 'customer.businessName': new RegExp(search, 'i') },
          { 'customer.phone': new RegExp(search, 'i') }
        ];
      }
      const quotes = await Quotation.find(filter).sort({ createdAt: -1 }).limit(limit);
      return quotes.map(q => q.toJSON());
    } else {
      let quotes = await this.jsonStorage.find();
      if (status && status !== 'all') quotes = quotes.filter(q => q.status === status);
      if (search) {
        const s = search.toLowerCase();
        quotes = quotes.filter(q =>
          q.quotationNumber.toLowerCase().includes(s) ||
          q.customer.businessName.toLowerCase().includes(s) ||
          q.customer.phone.includes(s)
        );
      }
      return quotes.slice(0, limit);
    }
  }

  /**
   * Admin: Real quote conversion and overdue follow-up metrics
   */
  async getQuotationMetrics() {
    const now = new Date();
    let allQuotes = [];

    if (this.isMongo()) {
      const quotes = await Quotation.find();
      allQuotes = quotes.map(q => q.toJSON());
    } else {
      allQuotes = await this.jsonStorage.find();
    }

    const total = allQuotes.length;
    const sent = allQuotes.filter(q => q.status === 'Sent').length;
    const accepted = allQuotes.filter(q => q.status === 'Accepted').length;
    const rejected = allQuotes.filter(q => q.status === 'Rejected').length;
    const expired = allQuotes.filter(q => q.status === 'Expired' || (q.status === 'Sent' && new Date(q.validUntil) < now)).length;
    const revised = allQuotes.filter(q => q.status === 'Revised').length;

    // Follow-ups due
    const followUpsDue = allQuotes.filter(q =>
      ['Sent', 'Draft'].includes(q.status) &&
      q.followUpDate &&
      new Date(q.followUpDate) <= now
    ).length;

    const conversionRate = total > 0 ? parseFloat(((accepted / total) * 100).toFixed(1)) : 0;

    return {
      total,
      sent,
      accepted,
      rejected,
      expired,
      revised,
      followUpsDue,
      conversionRate
    };
  }
}

module.exports = new QuotationService();

