require('dotenv').config();
const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Admin = require('./models/Admin');

// Import routes
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development/college testing
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded documents statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Government Order Publishing Platform API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminRoutes);

// Ensure initial admin exists
const ensureAdminBootstrapped = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const email = (process.env.ADMIN_INITIAL_EMAIL || 'admin@rajpatra.gov.in').toLowerCase().trim();
      const password = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@12345';
      const name = process.env.ADMIN_INITIAL_NAME || 'System Administrator';

      const admin = await Admin.create({
        name,
        email,
        password,
        role: 'superadmin',
      });
      console.log(`[AutoBootstrap] Initial System Administrator automatically created: ${email}`);
      return admin;
    }
    return await Admin.findOne({ role: 'superadmin' });
  } catch (err) {
    console.warn('[AutoBootstrap Warning] Could not verify admin bootstrapping:', err.message);
    return null;
  }
};

// Ensure sample orders exist if database is fresh/empty on new deployment
const ensureOrdersBootstrapped = async () => {
  try {
    const GovernmentOrder = require('./models/GovernmentOrder');
    const orderCount = await GovernmentOrder.countDocuments();
    if (orderCount === 0) {
      console.log('[AutoBootstrap] Fresh database detected. Auto-populating initial government orders...');
      const admin = await Admin.findOne({ role: 'superadmin' });
      if (!admin) return;

      const sampleOrders = require('./utils/sampleOrders');
      const { ensureSamplePDF } = require('./utils/generatePdf');

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
      console.log(`[AutoBootstrap] Successfully populated ${sampleOrders.length} initial government orders into database.`);
    }
  } catch (err) {
    console.warn('[AutoBootstrap Warning] Could not verify orders bootstrapping:', err.message);
  }
};

// Ensure all existing orders have valid PDFs on disk so sample downloads never 404
const ensureAllOrderPDFsExist = async () => {
  try {
    const GovernmentOrder = require('./models/GovernmentOrder');
    const { ensureFileOnDisk } = require('./utils/generatePdf');
    const orders = await GovernmentOrder.find({});
    for (const order of orders) {
      if (order.pdfUrl && order.pdfUrl.startsWith('/uploads/')) {
        const filename = path.basename(order.pdfUrl);
        const title = order.title?.en || 'Official Gazette Document';
        ensureFileOnDisk(filename, order.orderNumber, title, order.department);
      }
    }
  } catch (err) {
    console.warn('[AutoPDF Warning] Could not audit existing PDFs on disk:', err.message);
  }
};

// Single-Service Production Setup: Serve React SPA from frontend/dist
const distPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (process.env.NODE_ENV === 'production' || fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, async () => {
    console.log(`[Server] e-RajPatra API Gateway running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    await ensureAdminBootstrapped();
    await ensureOrdersBootstrapped();
    await ensureAllOrderPDFsExist();
  });
}

module.exports = { app, server };
