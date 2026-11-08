const mongoose = require('mongoose');

const ALLOWED_QUOTATION_STATUSES = [
  'Draft',
  'Sent',
  'Accepted',
  'Rejected',
  'Expired',
  'Revised'
];

const quotationItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    cutSpecification: {
      type: String,
      default: 'Standard Butchery Trim',
      trim: true
    },
    quantityKg: {
      type: Number,
      required: true,
      min: [50, 'Minimum order quantity is 50 kg']
    },
    unitPricePerKg: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    }
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    version: {
      type: Number,
      default: 1
    },
    parentQuotationId: {
      type: String,
      default: null,
      trim: true
    },
    sourceType: {
      type: String,
      enum: ['enquiry', 'repeat_order', 'direct'],
      default: 'enquiry'
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      businessName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true, index: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      deliveryLocation: { type: String, required: true, trim: true }
    },
    items: [quotationItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    logisticsFee: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },
    validUntil: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ALLOWED_QUOTATION_STATUSES,
      default: 'Draft',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    },
    customerFeedback: {
      action: { type: String, enum: ['Accepted', 'Rejected', 'Requested Discussion', null], default: null },
      feedbackNotes: { type: String, default: '' },
      actionTimestamp: { type: Date, default: null }
    },
    followUpDate: {
      type: Date,
      default: null
    },
    convertedToOrder: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
    bufferCommands: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      }
    }
  }
);

quotationSchema.index({ 'customer.phone': 1, status: 1 });
quotationSchema.index({ validUntil: 1, status: 1 });

const Quotation = mongoose.model('Quotation', quotationSchema, 'quotations');

module.exports = {
  Quotation,
  ALLOWED_QUOTATION_STATUSES
};

