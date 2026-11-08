const mongoose = require('mongoose');

const ALLOWED_PRODUCTS = [
  'Fresh Whole Chicken',
  'Skinless Chicken',
  'Chicken Cuts',
  'Bulk Chicken Supply',
  'Multiple Product Lines'
];

const ALLOWED_STATUSES = [
  'New',
  'Contacted',
  'In Progress',
  'Completed',
  'Cancelled'
];

const enquirySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 150,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      maxlength: 150,
      index: true
    },
    productInterest: {
      type: String,
      required: [true, 'Product interest is required'],
      enum: ALLOWED_PRODUCTS,
      trim: true
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
      maxlength: 100
    },
    deliveryLocation: {
      type: String,
      required: [true, 'Delivery location is required'],
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ALLOWED_STATUSES,
      default: 'New',
      index: true
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
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

// Compound index for duplicate detection within time windows
enquirySchema.index({ phone: 1, productInterest: 1, createdAt: -1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema, 'enquiries');

module.exports = {
  Enquiry,
  ALLOWED_PRODUCTS,
  ALLOWED_STATUSES
};
