const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { getEnquiryService } = require('../src/services/storageFactory');
const { Enquiry } = require('../src/models/enquiry.model');
const { Admin } = require('../src/models/admin.model');

async function runE2E() {
  await connectDatabase();
  const enquiryService = getEnquiryService();

  console.log('--- Step 1: Pre-test Count Verification ---');
  await Enquiry.deleteMany({ businessName: 'TEST-RESTAURANT-VERIFY' });
  const initialAdminCount = await Admin.countDocuments();
  const initialEnquiryCount = await Enquiry.countDocuments();
  console.log('Admin count in Atlas:', initialAdminCount);
  console.log('Enquiry count in Atlas:', initialEnquiryCount);

  if (initialAdminCount !== 1 || initialEnquiryCount !== 0) {
    throw new Error(`Unexpected initial counts: admin=${initialAdminCount}, enquiry=${initialEnquiryCount}`);
  }

  console.log('\n--- Step 2: Customer Enquiry Creation ---');
  const testPayload = {
    fullName: 'Test Auditor Chef',
    businessName: 'TEST-RESTAURANT-VERIFY',
    phone: '9843000000',
    email: 'test.verify@stpchickens.com',
    productInterest: 'Fresh Whole Chicken',
    quantity: '100 kg daily',
    deliveryLocation: 'Kannampalayam, Coimbatore',
    message: 'Temporary verification enquiry for Phase 5'
  };

  const created = await enquiryService.createEnquiry(testPayload);
  console.log('Created enquiry successfully. ID:', created.id, 'Status:', created.status);

  const countAfterCreate = await Enquiry.countDocuments();
  console.log('Enquiry count after insertion:', countAfterCreate);

  console.log('\n--- Step 3: Admin Enquiry Retrieval & Filtering ---');
  const fetched = await enquiryService.getEnquiryById(created.id);
  console.log('Fetched single enquiry by ID:', fetched.id === created.id ? 'PASS' : 'FAIL');

  const filtered = await enquiryService.queryEnquiries({ search: 'TEST-RESTAURANT-VERIFY' });
  console.log('Search query filtered correctly:', filtered.enquiries.length === 1 ? 'PASS' : 'FAIL');

  console.log('\n--- Step 4: Admin Status Update & Notes ---');
  const updated = await enquiryService.updateEnquiry(created.id, {
    status: 'In Progress',
    adminNotes: 'Verified phone line and scheduled morning delivery'
  });
  console.log('Updated status:', updated.status);
  console.log('Updated notes:', updated.adminNotes);

  console.log('\n--- Step 5: Test Record Cleanup ---');
  const deleteResult = await enquiryService.deleteEnquiry(created.id);
  console.log('Delete operation returned:', deleteResult);

  const finalEnquiryCount = await Enquiry.countDocuments();
  const finalAdminCount = await Admin.countDocuments();
  console.log('Final Enquiry count in Atlas:', finalEnquiryCount);
  console.log('Final Admin count in Atlas:', finalAdminCount);

  if (finalEnquiryCount !== 0 || finalAdminCount !== 1) {
    throw new Error(`Cleanup failed! Counts do not match expected clean state: admin=${finalAdminCount}, enquiry=${finalEnquiryCount}`);
  }

  await disconnectDatabase();
  console.log('\n=== E2E CRUD & STORAGE VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runE2E().catch(async (err) => {
  console.error('E2E Verification Error:', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
