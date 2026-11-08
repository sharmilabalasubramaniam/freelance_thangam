const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
require('dotenv').config({ path: 'server/.env' });
const fs = require('fs');

async function runQuickCheck() {
  const backendBase = 'http://localhost:5000/api';
  const report = {};

  // 1. Submit a clearly marked test enquiry
  const testPayload = {
    fullName: 'Quick Health Check Auditor',
    businessName: 'HEALTHCHECK-TEMP-RESTAURANT',
    phone: '9843112233',
    email: 'auditor.temp@thangamfarms.in',
    productInterest: 'Fresh Whole Chicken',
    quantity: '50 kg daily',
    deliveryLocation: 'Kannampalayam, Coimbatore',
    message: 'Temporary test record for quick health check'
  };

  console.log('--- 1. Submitting Test Enquiry ---');
  const submitRes = await fetch(`${backendBase}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  });
  const submitData = await submitRes.json();
  const testId = submitData.data?.id;
  console.log('Submission status:', submitRes.status, 'ID:', testId);
  report.submission = submitRes.status === 201 && testId;

  // 2. Verifying in MongoDB Atlas ---
  console.log('--- 2. Verifying in MongoDB Atlas ---');
  const path = require('path');
  const { MongoClient } = require(path.resolve(__dirname, '../node_modules/mongodb'));
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db(process.env.MONGO_DB_NAME || 'thangam_farms');

  const mongoDoc = await db.collection('enquiries').findOne({ id: testId });
  console.log('Found in MongoDB Atlas:', !!mongoDoc, 'Business Name:', mongoDoc?.businessName);
  report.savedInMongo = !!mongoDoc && mongoDoc.businessName === 'HEALTHCHECK-TEMP-RESTAURANT';

  // 3. Admin Authentication & Session Verification
  console.log('--- 3. Testing Admin Login & Session ---');
  const sourceAdmin = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/admins.json'), 'utf8'))[0];
  const jwt = require(path.resolve(__dirname, '../node_modules/jsonwebtoken'));
  const token = jwt.sign(
    { id: sourceAdmin.id, email: sourceAdmin.email, role: sourceAdmin.role, name: sourceAdmin.name },
    process.env.JWT_SECRET || 'fallback_development_secret_only',
    { expiresIn: '24h' }
  );

  const meRes = await fetch(`${backendBase}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('Admin session status:', meRes.status, 'Email match:', meData.data?.user?.email === sourceAdmin.email);
  report.adminSession = meRes.status === 200 && meData.data?.user?.email === sourceAdmin.email;

  // 4. Admin Search & Query
  console.log('--- 4. Testing Admin Enquiry Listing & Search ---');
  const listRes = await fetch(`${backendBase}/enquiries?search=HEALTHCHECK-TEMP`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData = await listRes.json();
  const matchFound = listData.data?.enquiries?.some(e => e.id === testId);
  console.log('Admin list search match:', matchFound);
  report.adminSearch = listRes.status === 200 && matchFound;

  // 5. Admin Update Status
  console.log('--- 5. Testing Enquiry Status Update ---');
  const patchRes = await fetch(`${backendBase}/enquiries/${testId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'In Progress',
      adminNotes: 'Quick health check status update verified'
    })
  });
  const patchData = await patchRes.json();
  console.log('Updated status:', patchData.data?.status);
  report.statusUpdate = patchRes.status === 200 && patchData.data?.status === 'In Progress';

  // 6. Admin Logout
  console.log('--- 6. Testing Admin Logout ---');
  const logoutRes = await fetch(`${backendBase}/admin/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Logout status:', logoutRes.status);
  report.adminLogout = logoutRes.status === 200;

  // 7. Clean up exact test record
  console.log('--- 7. Cleaning up test record ---');
  const deleteRes = await fetch(`${backendBase}/enquiries/${testId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const deleteData = await deleteRes.json();
  console.log('Delete status:', deleteRes.status, 'Success:', deleteData.success);
  report.cleanup = deleteRes.status === 200 && deleteData.success === true;

  // Confirm final Atlas enquiry count is 0
  const finalEnquiryCount = await db.collection('enquiries').countDocuments();
  const finalAdminCount = await db.collection('admins').countDocuments();
  console.log('Final Atlas counts - Enquiries:', finalEnquiryCount, 'Admins:', finalAdminCount);
  report.cleanFinalState = finalEnquiryCount === 0 && finalAdminCount === 1;

  await client.close();
  console.log('\n--- HEALTH CHECK RESULTS ---');
  console.log(JSON.stringify(report, null, 2));
}

runQuickCheck().catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});
