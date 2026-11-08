const { Enquiry, ALLOWED_STATUSES } = require('../models/enquiry.model');
const { v4: uuidv4 } = require('uuid');

class MongoEnquiryService {
  async createEnquiry(enquiryInput) {
    const shortHex = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    const id = `ENQ-${shortHex}`;
    const normalizedPhone = enquiryInput.phone.trim();

    // Prevent duplicate submission within 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await Enquiry.findOne({
      phone: normalizedPhone,
      productInterest: enquiryInput.productInterest.trim(),
      createdAt: { $gte: tenMinutesAgo }
    });

    if (duplicate) {
      const obj = duplicate.toJSON();
      obj.isDuplicate = true;
      return obj;
    }

    const doc = await Enquiry.create({
      id,
      fullName: enquiryInput.fullName.trim(),
      businessName: enquiryInput.businessName.trim(),
      phone: normalizedPhone,
      email: enquiryInput.email.trim().toLowerCase(),
      productInterest: enquiryInput.productInterest.trim(),
      quantity: enquiryInput.quantity.trim(),
      deliveryLocation: enquiryInput.deliveryLocation.trim(),
      message: enquiryInput.message ? enquiryInput.message.trim() : '',
      status: 'New',
      adminNotes: ''
    });

    return doc.toJSON();
  }

  async queryEnquiries(options = {}) {
    const {
      search = '',
      status = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 20
    } = options;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: 'i' } },
        { businessName: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { id: { $regex: term, $options: 'i' } },
        { deliveryLocation: { $regex: term, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [enquiries, totalRecords] = await Promise.all([
      Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Enquiry.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalRecords / limitNum) || 1;

    return {
      enquiries: enquiries.map(e => e.toJSON()),
      pagination: {
        totalRecords,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  async getEnquiryById(id) {
    const doc = await Enquiry.findOne({ id });
    return doc ? doc.toJSON() : null;
  }

  async updateEnquiry(id, updates = {}) {
    const allowed = {};
    if (updates.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }
      allowed.status = updates.status;
    }

    if (updates.adminNotes !== undefined) {
      allowed.adminNotes = String(updates.adminNotes).trim();
    }

    const updated = await Enquiry.findOneAndUpdate({ id }, { $set: allowed }, { new: true, runValidators: true });
    return updated ? updated.toJSON() : null;
  }

  async deleteEnquiry(id) {
    const res = await Enquiry.deleteOne({ id });
    return res.deletedCount > 0;
  }

  async getOverviewMetrics() {
    const [total, newCount, contacted, inProgress, completed, cancelled, recent] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      Enquiry.countDocuments({ status: 'Contacted' }),
      Enquiry.countDocuments({ status: 'In Progress' }),
      Enquiry.countDocuments({ status: 'Completed' }),
      Enquiry.countDocuments({ status: 'Cancelled' }),
      Enquiry.find().sort({ createdAt: -1 }).limit(5)
    ]);

    return {
      total,
      new: newCount,
      contacted,
      inProgress,
      completed,
      cancelled,
      recent: recent.map(r => r.toJSON())
    };
  }
}

module.exports = MongoEnquiryService;

