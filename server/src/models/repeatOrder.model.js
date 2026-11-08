const mongoose = require('mongoose');

const ALLOWED_REPEAT_STATUSES = [
  'Pending Review',
  'Quoted',
  'Confirmed',
  'Rejected'
];

const repeatOrderRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    originalEnquiryId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    businessName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    productInterest: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      required: true,
      trim: true
    },
    quantityKg: {
      type: Number,
      required: true,
      min: [50, 'Minimum wholesale repeat order is 50 kg per drop']
    },
    deliveryLocation: {
      type: String,
      required: true,
      trim: true
    },
    requestedDispatchTime: {
      type: String,
      default: 'Dawn 04:00 AM - 06:30 AM'
    },
    customerNotes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ALLOWED_REPEAT_STATUSES,
      default: 'Pending Review',
      index: true
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    },
    quotationId: {
      type: String,
      trim: true,
      default: null
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

repeatOrderRequestSchema.index({ customerPhone: 1, createdAt: -1 });

const RepeatOrderRequest = mongoose.model('RepeatOrderRequest', repeatOrderRequestSchema, 'repeat_orders');

module.exports = {
  RepeatOrderRequest,
  ALLOWED_REPEAT_STATUSES
};

