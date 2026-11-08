const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://localhost:5000,http://localhost:5500,http://127.0.0.1:5500,http://127.0.0.1:3000')
    .split(',')
    .map(origin => origin.trim()),
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_development_secret_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    cookieName: process.env.COOKIE_NAME || 'thangam_admin_token'
  },
  mongodb: {
    uri: process.env.MONGO_URI || '',
    dbName: process.env.MONGO_DB_NAME || 'thangam_farms',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000
    }
  },
  storageMode: process.env.STORAGE_MODE || (process.env.MONGO_URI ? 'mongodb' : 'json'),
  adminSeed: {
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@thangamfarms.in',
    password: process.env.INITIAL_ADMIN_PASSWORD,
    name: process.env.INITIAL_ADMIN_NAME || 'Operations Manager'
  },
  storage: {
    dataDir: path.resolve(__dirname, '../../', process.env.DATA_DIR || './data')
  }
};

module.exports = config;
