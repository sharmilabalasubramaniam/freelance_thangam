const express = require('express');
const { getStorageHealth } = require('../services/storageFactory');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const storageHealth = getStorageHealth();

    const healthData = {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'Thangam Farms 2.0 API',
      brand: 'STP Chickens',
      facility: 'Kannampalayam, Coimbatore',
      storage: storageHealth
    };

    return successResponse(res, healthData, 'System operational and healthy');
  } catch (err) {
    return errorResponse(res, `Health check failed: ${err.message}`, 503);
  }
});

module.exports = router;
