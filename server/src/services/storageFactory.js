const mongoose = require('mongoose');
const config = require('../config/env');
const { checkDatabaseHealth } = require('../config/database');
const JsonStorage = require('../storage/jsonStorage');

// JSON services
const JsonEnquiryService = require('./enquiry.service');
const JsonAuthService = require('./auth.service');

// Mongo services
const MongoEnquiryService = require('./mongoEnquiry.service');
const MongoAuthService = require('./mongoAuth.service');

// Singleton service instances
let mongoEnquiryService = null;
let jsonEnquiryService = null;
let mongoAuthService = null;
let jsonAuthService = null;

function isMongoReady() {
  return config.storageMode === 'mongodb' &&
         Boolean(config.mongodb.uri) &&
         mongoose.connection.readyState === 1;
}

function getEnquiryService() {
  if (isMongoReady()) {
    if (!mongoEnquiryService) mongoEnquiryService = new MongoEnquiryService();
    return mongoEnquiryService;
  }
  // Seamless fallback to persistent local JSON storage if MongoDB connection is pending or disconnected
  if (!jsonEnquiryService) jsonEnquiryService = new JsonEnquiryService();
  return jsonEnquiryService;
}

function getAuthService() {
  if (isMongoReady()) {
    if (!mongoAuthService) mongoAuthService = new MongoAuthService();
    return mongoAuthService;
  }
  // Seamless fallback to persistent local JSON storage
  if (!jsonAuthService) jsonAuthService = new JsonAuthService();
  return jsonAuthService;
}

function getStorageHealth() {
  if (config.storageMode === 'mongodb' && config.mongodb.uri) {
    const mongoHealth = checkDatabaseHealth();
    const activeEngine = mongoHealth.healthy ? 'mongodb-atlas' : 'local-json-fallback';
    return {
      type: 'mongodb-atlas',
      activeEngine,
      ...mongoHealth
    };
  } else {
    const jsonStorage = new JsonStorage('_health');
    return {
      type: 'local-json',
      activeEngine: 'local-json',
      healthy: true,
      dataDir: config.storage.dataDir
    };
  }
}

module.exports = {
  getEnquiryService,
  getAuthService,
  getStorageHealth
};
