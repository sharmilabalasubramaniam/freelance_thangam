#!/usr/bin/env node

/**
 * Migration Script: JSON Local Storage to MongoDB Atlas
 * Usage:
 *   Dry-Run: node scripts/migrateToJson.js --dry-run
 *   Live Import: npm run migrate:mongodb
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../src/config/env');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { Enquiry } = require('../src/models/enquiry.model');
const { Admin } = require('../src/models/admin.model');

const isDryRun = process.argv.includes('--dry-run');

// Configure reliable DNS resolvers before initiating Atlas connection
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

async function runMigration() {
  console.log('====================================================');
  console.log(' THANGAM FARMS 2.0 — JSON TO MONGODB ATLAS MIGRATOR ');
  console.log(' Mode:', isDryRun ? 'DRY-RUN (No database writes)' : 'LIVE MIGRATION');
  console.log(' Target DB:', config.mongodb.dbName);
  console.log('====================================================\n');

  // 1. Inspect & Backup Local Data
  const dataDir = path.resolve(__dirname, '../data');
  const backupDir = path.resolve(__dirname, '../../backups/json_' + new Date().toISOString().replace(/[:.]/g, '-'));

  console.log('[Step 1] Creating safe JSON backup outside public directories...');
  fs.mkdirSync(backupDir, { recursive: true });

  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  for (const file of jsonFiles) {
    fs.copyFileSync(path.join(dataDir, file), path.join(backupDir, file));
  }
  console.log(`[Step 1] Backup successfully created at: ${backupDir}\n`);

  // 2. Read Source Records
  const adminsPath = path.join(dataDir, 'admins.json');
  const enquiriesPath = path.join(dataDir, 'enquiries.json');

  const rawAdmins = fs.existsSync(adminsPath) ? JSON.parse(fs.readFileSync(adminsPath, 'utf8')) : [];
  const rawEnquiries = fs.existsSync(enquiriesPath) ? JSON.parse(fs.readFileSync(enquiriesPath, 'utf8')) : [];

  console.log(`[Step 2] Source JSON Records Found:`);
  console.log(`  - Admins: ${rawAdmins.length}`);
  console.log(`  - Enquiries: ${rawEnquiries.length}\n`);

  if (isDryRun) {
    console.log('[Dry-Run Verification]');
    console.log(`  - Admins to migrate: ${rawAdmins.map(a => a.email).join(', ') || 'None'}`);
    console.log(`  - Enquiries to migrate: ${rawEnquiries.map(e => e.id).join(', ') || 'None'}`);
    console.log('\nDry-run complete. When MONGO_URI is configured, run "npm run migrate:mongodb" to execute live import.');
    return;
  }

  if (!config.mongodb.uri) {
    console.error('[Migration Error] MONGO_URI is missing in server/.env.');
    console.error('Please configure your MongoDB Atlas connection string before running migration.');
    process.exit(1);
  }

  // 3. Connect to MongoDB Atlas
  console.log('[Step 3] Connecting to MongoDB Atlas...');
  await connectDatabase();

  // 4. Migrate Admins Idempotently
  console.log('[Step 4] Migrating Admins...');
  let adminsImported = 0;
  let adminsSkipped = 0;

  for (const adminData of rawAdmins) {
    const existing = await Admin.findOne({ email: adminData.email.toLowerCase() });
    if (existing) {
      adminsSkipped++;
    } else {
      await Admin.create({
        id: adminData.id,
        email: adminData.email.toLowerCase(),
        name: adminData.name || 'Operations Staff',
        passwordHash: adminData.passwordHash,
        role: adminData.role || 'admin',
        createdAt: adminData.createdAt ? new Date(adminData.createdAt) : new Date(),
        updatedAt: adminData.updatedAt ? new Date(adminData.updatedAt) : new Date()
      });
      adminsImported++;
    }
  }
  console.log(`  - Imported: ${adminsImported}, Skipped (already exists): ${adminsSkipped}`);

  // 5. Migrate Enquiries Idempotently
  console.log('[Step 5] Migrating Enquiries...');
  let enquiriesImported = 0;
  let enquiriesSkipped = 0;

  for (const enq of rawEnquiries) {
    const existing = await Enquiry.findOne({ id: enq.id });
    if (existing) {
      enquiriesSkipped++;
    } else {
      await Enquiry.create({
        id: enq.id,
        fullName: enq.fullName,
        businessName: enq.businessName,
        phone: enq.phone,
        email: enq.email,
        productInterest: enq.productInterest,
        quantity: enq.quantity,
        deliveryLocation: enq.deliveryLocation,
        message: enq.message || '',
        status: enq.status || 'New',
        adminNotes: enq.adminNotes || '',
        createdAt: enq.createdAt ? new Date(enq.createdAt) : new Date(),
        updatedAt: enq.updatedAt ? new Date(enq.updatedAt) : new Date()
      });
      enquiriesImported++;
    }
  }
  console.log(`  - Imported: ${enquiriesImported}, Skipped (already exists): ${enquiriesSkipped}`);

  // 6. Reconciliation & Count Verification
  const totalDbAdmins = await Admin.countDocuments();
  const totalDbEnquiries = await Enquiry.countDocuments();

  console.log('\n====================================================');
  console.log(' MIGRATION RECONCILIATION REPORT:');
  console.log(` - Source Admins: ${rawAdmins.length} | MongoDB Admins: ${totalDbAdmins}`);
  console.log(` - Source Enquiries: ${rawEnquiries.length} | MongoDB Enquiries: ${totalDbEnquiries}`);
  console.log(' Status: MIGRATION COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');

  await disconnectDatabase();
}

runMigration().catch(async (err) => {
  console.error('[Migration Aborted]', err.message);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
