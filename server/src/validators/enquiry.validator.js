const { body } = require('express-validator');

const ALLOWED_PRODUCTS = [
  'Fresh Whole Chicken',
  'Skinless Chicken',
  'Chicken Cuts',
  'Bulk Chicken Supply',
  'Multiple Product Lines'
];

/**
 * Validation rules for POST /api/enquiries
 */
const enquiryValidationRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
    .escape(),

  body('businessName')
    .trim()
    .notEmpty().withMessage('Business / establishment name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Business name must be between 2 and 150 characters')
    .escape(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .custom((val) => {
      // Clean string: remove spaces, hyphens, and leading +91 or 91
      const cleaned = val.replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91)/, '');
      // Validate 10-digit Indian mobile / contact number standard (typically starts with 6-9)
      if (!/^[6-9]\d{9}$/.test(cleaned) && !/^\d{10,12}$/.test(cleaned)) {
        throw new Error('Please enter a valid 10-digit contact phone number');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email address must not exceed 150 characters'),

  body('productInterest')
    .trim()
    .notEmpty().withMessage('Product interest selection is required')
    .isIn(ALLOWED_PRODUCTS).withMessage(`Product must be one of: ${ALLOWED_PRODUCTS.join(', ')}`),

  body('quantity')
    .trim()
    .notEmpty().withMessage('Quantity required is required')
    .isLength({ min: 2, max: 100 }).withMessage('Quantity must be between 2 and 100 characters')
    .escape(),

  body('deliveryLocation')
    .trim()
    .notEmpty().withMessage('Receiving / delivery location is required')
    .isLength({ min: 3, max: 200 }).withMessage('Delivery location must be between 3 and 200 characters')
    .escape(),

  body('message')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Message must not exceed 1000 characters')
    .escape()
];

module.exports = {
  ALLOWED_PRODUCTS,
  enquiryValidationRules
};

