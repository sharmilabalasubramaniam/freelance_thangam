#!/usr/bin/env node

/**
 * One-time setup script to provision initial admin credentials safely.
 * Usage: npm run seed:admin
 */

const AuthService = require('../src/services/auth.service');
const config = require('../src/config/env');

async function runSeed() {
  console.log('[Thangam Farms Seed] Checking admin provisioning...');
  const authService = new AuthService();

  try {
    const result = await authService.seedInitialAdmin();
    if (result.created) {
      console.log(`[Thangam Farms Seed] SUCCESS: Admin account created for ${result.email}`);
      console.log(`[Thangam Farms Seed] Initial credentials set from environment variable.`);
    } else {
      console.log(`[Thangam Farms Seed] INFO: ${result.message}`);
    }
  } catch (err) {
    console.error(`[Thangam Farms Seed] ERROR: ${err.message}`);
    process.exit(1);
  }
}

runSeed();

