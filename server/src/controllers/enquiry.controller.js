const { getEnquiryService } = require('../services/storageFactory');
const { successResponse, errorResponse } = require('../utils/response');

const createEnquiryHandler = async (req, res, next) => {
  try {
    const {
      fullName,
      businessName,
      phone,
      email,
      productInterest,
      quantity,
      deliveryLocation,
      message
    } = req.body;

    const enquiryService = getEnquiryService();
    const result = await enquiryService.createEnquiry({
      fullName,
      businessName,
      phone,
      email,
      productInterest,
      quantity,
      deliveryLocation,
      message
    });

    const isDuplicate = result.isDuplicate;
    const responseMessage = isDuplicate
      ? 'Enquiry previously received and currently on file'
      : 'Commercial enquiry registered successfully';

    return successResponse(res, result, responseMessage, 201);
  } catch (err) {
    next(err);
  }
};

const getEnquiriesHandler = async (req, res, next) => {
  try {
    const { search, status, startDate, endDate, page, limit } = req.query;
    const enquiryService = getEnquiryService();
    const result = await enquiryService.queryEnquiries({
      search,
      status,
      startDate,
      endDate,
      page,
      limit
    });

    return successResponse(res, result, 'Enquiries retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getEnquiryByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiryService = getEnquiryService();
    const enquiry = await enquiryService.getEnquiryById(id);

    if (!enquiry) {
      return errorResponse(res, `Enquiry with ID ${id} not found`, 404);
    }

    return successResponse(res, enquiry, 'Enquiry retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateEnquiryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (status === undefined && adminNotes === undefined) {
      return errorResponse(res, 'At least one field (status or adminNotes) must be provided for update', 400);
    }

    const enquiryService = getEnquiryService();
    const updated = await enquiryService.updateEnquiry(id, { status, adminNotes });

    if (!updated) {
      return errorResponse(res, `Enquiry with ID ${id} not found`, 404);
    }

    return successResponse(res, updated, 'Enquiry updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};

const deleteEnquiryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiryService = getEnquiryService();
    const deleted = await enquiryService.deleteEnquiry(id);

    if (!deleted) {
      return errorResponse(res, `Enquiry with ID ${id} not found`, 404);
    }

    return successResponse(res, { id }, 'Enquiry deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getOverviewHandler = async (req, res, next) => {
  try {
    const enquiryService = getEnquiryService();
    const overview = await enquiryService.getOverviewMetrics();
    return successResponse(res, overview, 'Admin overview statistics calculated');
  } catch (err) {
    next(err);
  }
};

/**
 * Secure Admin CSV Export Endpoint
 */
const exportEnquiriesCsvHandler = async (req, res, next) => {
  try {
    const enquiryService = getEnquiryService();
    const { enquiries } = await enquiryService.queryEnquiries({ limit: 1000 });

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headers = [
      'Enquiry ID',
      'Buyer Full Name',
      'Business Name',
      'Phone Number',
      'Email Address',
      'Product Interest',
      'Quantity Requested',
      'Delivery Location',
      'Status',
      'Admin Notes',
      'Created Date'
    ];

    const rows = (enquiries || []).map(e => [
      escapeCsv(e.id),
      escapeCsv(e.fullName),
      escapeCsv(e.businessName),
      escapeCsv(e.phone),
      escapeCsv(e.email),
      escapeCsv(e.productInterest),
      escapeCsv(e.quantity),
      escapeCsv(e.deliveryLocation),
      escapeCsv(e.status),
      escapeCsv(e.adminNotes),
      escapeCsv(e.createdAt)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="stp_chickens_enquiries_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEnquiryHandler,
  getEnquiriesHandler,
  getEnquiryByIdHandler,
  updateEnquiryHandler,
  deleteEnquiryHandler,
  getOverviewHandler,
  exportEnquiriesCsvHandler
};
