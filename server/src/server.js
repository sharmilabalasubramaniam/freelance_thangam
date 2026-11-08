const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const app = require('./app');
const config = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

async function startServer() {
  // If MongoDB mode is selected and URI is configured, establish connection
  if (config.storageMode === 'mongodb' && config.mongodb.uri) {
    try {
      await connectDatabase();
      console.log('[Thangam Farms API] Primary database: MongoDB Atlas');
    } catch (err) {
      console.error('[Thangam Farms API] Failed to connect to MongoDB Atlas:', err.message);
      console.warn('[Thangam Farms API] Storage mode configured as MongoDB but connection could not be established.');
    }
  } else {
    console.log('[Thangam Farms API] Primary database: Persistent Local JSON Storage');
  }

  const server = app.listen(config.port, () => {
    console.log(`[Thangam Farms API] Server running in ${config.env} mode on port ${config.port}`);
    console.log(`[Thangam Farms API] Health endpoint available at: http://localhost:${config.port}/api/health`);
    console.log(`[Thangam Farms API] Storage directory (backups/data): ${config.storage.dataDir}`);
  });

  const handleShutdown = async (signal) => {
    console.log(`[Thangam Farms API] ${signal} received. Gracefully closing server...`);
    server.close(async () => {
      await disconnectDatabase().catch(() => {});
      console.log('[Thangam Farms API] Process terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return server;
}

startServer();
