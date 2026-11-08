const { v4: uuidv4 } = require('uuid');
const JsonStorage = require('../storage/jsonStorage');

const ALLOWED_STATUSES = ['New', 'Contacted', 'In Progress', 'Completed', 'Cancelled'];

class EnquiryService {
  constructor(storageInstance = null) {
    this.storage = storageInstance || new JsonStorage('enquiries');
  }

  /**
   * Create a new commercial poultry enquiry
   */
  async createEnquiry(enquiryInput) {
    const shortHex = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    const id = `ENQ-${shortHex}`;

    const normalizedPhone = enquiryInput.phone.trim();

    const newDoc = {
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
    };

    // Deduplicate within 10 minutes
    const recentTenMinutes = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const duplicates = await this.storage.find(item => {
      return item.phone === newDoc.phone &&
             item.productInterest === newDoc.productInterest &&
             item.createdAt >= recentTenMinutes;
    });

    if (duplicates.length > 0) {
      return {
        ...duplicates[0],
        isDuplicate: true
      };
    }

    const savedDoc = await this.storage.insert(newDoc);
    return savedDoc;
  }

  /**
   * Query enquiries with search, status filtering, date range, pagination and sorting
   */
  async queryEnquiries(options = {}) {
    const {
      search = '',
      status = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 20
    } = options;

    const allItems = await this.storage.find();

    // 1. Filter
    let filtered = allItems.filter(item => {
      // Status filter
      if (status && status !== 'all' && item.status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }

      // Date range filter
      if (startDate && new Date(item.createdAt) < new Date(startDate)) {
        return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(item.createdAt) > end) {
          return false;
        }
      }

      // Search query (fullName, businessName, phone, email, id, deliveryLocation)
      if (search) {
        const term = search.toLowerCase().trim();
        const matches =
          (item.fullName && item.fullName.toLowerCase().includes(term)) ||
          (item.businessName && item.businessName.toLowerCase().includes(term)) ||
          (item.phone && item.phone.toLowerCase().includes(term)) ||
          (item.email && item.email.toLowerCase().includes(term)) ||
          (item.id && item.id.toLowerCase().includes(term)) ||
          (item.deliveryLocation && item.deliveryLocation.toLowerCase().includes(term));
        if (!matches) return false;
      }

      return true;
    });

    // 2. Sort: newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 3. Pagination
    const totalRecords = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = filtered.slice(startIndex, startIndex + limitNum);

    return {
      enquiries: paginatedItems,
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

  /**
   * Get single enquiry by ID
   */
  async getEnquiryById(id) {
    return this.storage.findById(id);
  }

  /**
   * Update enquiry status or admin notes (Preserves customer fields and original timestamps)
   */
  async updateEnquiry(id, updates = {}) {
    const existing = await this.storage.findById(id);
    if (!existing) {
      return null;
    }

    const allowedUpdates = {};

    if (updates.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }
      allowedUpdates.status = updates.status;
    }

    if (updates.adminNotes !== undefined) {
      allowedUpdates.adminNotes = String(updates.adminNotes).trim();
    }

    return this.storage.updateById(id, allowedUpdates);
  }

  /**
   * Delete enquiry
   */
  async deleteEnquiry(id) {
    return this.storage.deleteById(id);
  }

  /**
   * Compute actual overview statistics from stored enquiries
   */
  async getOverviewMetrics() {
    const items = await this.storage.find();

    const metrics = {
      total: items.length,
      new: items.filter(i => i.status === 'New').length,
      contacted: items.filter(i => i.status === 'Contacted').length,
      inProgress: items.filter(i => i.status === 'In Progress').length,
      completed: items.filter(i => i.status === 'Completed').length,
      cancelled: items.filter(i => i.status === 'Cancelled').length,
      recent: items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };

    return metrics;
  }
}

module.exports = EnquiryService;
