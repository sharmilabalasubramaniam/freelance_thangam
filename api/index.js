const app = require('../server/src/app');
const config = require('../server/src/config/env');
const { connectDatabase } = require('../server/src/config/database');

let isDbConnecting = false;

// Serverless handler with cached database connection
module.exports = async (req, res) => {
  // Ensure database is initialized in serverless environment if MongoDB mode is enabled
  if (config.storageMode === 'mongodb' && config.mongodb.uri) {
    if (!isDbConnecting) {
      isDbConnecting = true;
      try {
        await connectDatabase();
      } catch (err) {
        console.error('[Vercel Serverless] MongoDB connection warning:', err.message);
      } finally {
        isDbConnecting = false;
      }
    }
  }

  // Delegate request handling directly to Express app
  return app(req, res);
};
