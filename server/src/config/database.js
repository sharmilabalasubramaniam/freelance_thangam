const mongoose = require('mongoose');
const dns = require('dns');
const config = require('../config/env');

// Disable Mongoose command buffering so queries fail immediately if not connected,
// rather than hanging for 10 seconds and throwing "buffering timed out after 10000ms"
mongoose.set('bufferCommands', false);

// Ensure reliable SRV resolution on Windows environments where ISP/local router blocks UDP 53 SRV queries
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Use system default if setServers fails in restricted environments
}

let isConnected = false;

/**
 * Connect to MongoDB Atlas with connection pooling and timeouts
 */
const connectDatabase = async () => {
  if (!config.mongodb.uri) {
    throw new Error('MONGO_URI is not defined in environment variables. Please configure your MongoDB Atlas connection string.');
  }

  // Prevent redundant connection attempts
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
      ...config.mongodb.options
    });

    isConnected = true;
    const sanitizedHost = conn.connection.host || 'cluster';
    console.log(`[MongoDB Atlas] Connected successfully to host: ${sanitizedHost}, Database: ${config.mongodb.dbName}`);

    // Lifecycle events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB Atlas] Connection disconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Atlas] Connection error:', err.message);
    });

    return conn;
  } catch (err) {
    isConnected = false;
    // Log sanitized error message without exposing credentials
    let cleanMessage = err.message;
    if (cleanMessage.includes('//')) {
      cleanMessage = cleanMessage.replace(/:\/\/([^@]+)@/, '://***:***@');
    }
    console.error(`[MongoDB Atlas] Connection failure: ${cleanMessage}`);
    throw new Error(`MongoDB connection failed: ${cleanMessage}`);
  }
};

/**
 * Check MongoDB connection status for health checks
 */
const checkDatabaseHealth = () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    healthy: readyState === 1,
    state: states[readyState] || 'unknown',
    database: config.mongodb.dbName,
    configured: Boolean(config.mongodb.uri)
  };
};

/**
 * Graceful database disconnect
 */
const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB Atlas] Database disconnected cleanly.');
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth,
  disconnectDatabase
};
