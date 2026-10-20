const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    app: 'Android MDM & Device Financing Management API',
    version: '2.4.0',
    endpoints: {
      health: '/api/health',
      devices: '/api/devices',
      deviceDetail: '/api/devices/:imei',
      mdmCommand: '/api/devices/:imei/command',
      actions: [
        'POST /api/devices/:imei/sync',
        'POST /api/devices/:imei/ping',
        'POST /api/devices/:imei/lock',
        'POST /api/devices/:imei/unlock',
        'POST /api/devices/:imei/release'
      ],
      payment: '/api/devices/:imei/payment',
      logs: '/api/logs',
      simulatorEvents: '/api/simulator/events'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[UNCAUGHT-ERROR]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 MDM & Device Financing Server running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`🔒 Security: Firebase Admin Auth Protected`);
  console.log(`====================================================`);
});
