const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/health.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const adminRoutes = require('./routes/admin.routes');
const assistantRoutes = require('./routes/assistant.routes');
const repeatOrderRoutes = require('./routes/repeatOrder.routes');
const quotationRoutes = require('./routes/quotation.routes');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cookie parser for secure HTTP-only cookies
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.clientOrigins.includes(origin) || config.clientOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Global Rate Limiting
app.use('/api', globalRateLimiter);

// Body Parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/repeat-orders', repeatOrderRoutes);
app.use('/api/quotations', quotationRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
