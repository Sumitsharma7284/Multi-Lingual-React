require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const GovernmentOrder = require('../models/GovernmentOrder');
const { ensureSamplePDF } = require('./generatePdf');
const sampleOrders = require('./sampleOrders');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govt_order_portal';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // 1. Seed or Verify Administrator
    const initialEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@rajpatra.gov.in').toLowerCase().trim();
    let admin = await Admin.findOne({ email: initialEmail });

    if (!admin) {
      console.log(`[Seed] Creating initial administrator: ${initialEmail}`);
      admin = await Admin.create({
        name: process.env.ADMIN_INITIAL_NAME || 'System Administrator',
        email: initialEmail,
        password: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@12345',
        role: 'superadmin',
      });
      console.log(`[Seed] Administrator created successfully with default password.`);
    } else {
      console.log(`[Seed] Administrator already exists: ${admin.email}`);
    }

    // 2. Clear old orders and re-seed clean realistic government orders
    console.log('[Seed] Clearing previous orders for clean state...');
    await GovernmentOrder.deleteMany({});

    console.log('[Seed] Generating official PDF documents and populating multilingual orders...');
    for (const item of sampleOrders) {
      const pdfMeta = ensureSamplePDF(item.orderNumber, item.title.en, item.department);

      await GovernmentOrder.create({
        ...item,
        pdfUrl: pdfMeta.url,
        pdfPublicId: pdfMeta.filename,
        pdfOriginalName: pdfMeta.filename,
        pdfSize: pdfMeta.size,
        createdBy: admin._id,
      });
    }

    const total = await GovernmentOrder.countDocuments();
    const published = await GovernmentOrder.countDocuments({ status: 'published' });
    const draft = await GovernmentOrder.countDocuments({ status: 'draft' });

    console.log(`[Seed] Database successfully seeded with:`);
    console.log(`   - Total Orders: ${total}`);
    console.log(`   - Published Orders: ${published}`);
    console.log(`   - Draft Orders: ${draft}`);
    console.log(`   - Admin Account: ${admin.email} (Password: Admin@12345)`);

    await mongoose.disconnect();
    console.log('[Seed] Completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seedDatabase();
