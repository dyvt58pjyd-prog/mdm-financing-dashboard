const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceController');
const { requireAuth } = require('../middleware/auth');
const { isUsingMock } = require('../config/firebase');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ApexMDM Advanced Enterprise Control Platform',
    version: '2.4.0',
    mode: isUsingMock ? 'SANDBOX_WITH_DISK_PERSISTENCE' : 'LIVE_CLOUD_FIREBASE',
    persistence: 'Permanent Multi-Tier (Disk + Cloud + Client)',
    timestamp: new Date().toISOString()
  });
});

// Secure Admin Login
const handleAdminLogin = (req, res) => {
  const { username, email, password } = req.body;
  const userIdentifier = (username || email || '').trim();

  if (userIdentifier === 'admin' && password === 'Anurag@268724') {
    const token = 'admin-jwt-mdm-token-' + Buffer.from('admin').toString('base64');
    return res.json({
      success: true,
      token,
      user: {
        uid: 'admin_master_001',
        email: 'admin@apex-mdm.enterprise',
        displayName: 'System Administrator (admin)',
        role: 'SuperAdmin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid username or password'
  });
};

router.post('/auth/demo-login', handleAdminLogin);
router.post('/auth/login', handleAdminLogin);

// PUBLIC: Standard Android DPC config.json fetched by mobile devices
router.get('/policies/:id/config.json', controller.getPolicyConfigJson.bind(controller));

// PUBLIC / Protected Device Telemetry Reporting
router.post('/devices/:imei/telemetry', controller.updateTelemetry.bind(controller));

// --- PROTECTED ROUTES ---
// Device Listings & Detail
router.get('/devices', requireAuth, controller.getDevices.bind(controller));
router.get('/devices/:imei', requireAuth, controller.getDeviceByImei.bind(controller));
router.post('/devices', requireAuth, controller.registerDevice.bind(controller));

// Remote MDM Action Commands
router.post('/devices/:imei/command', requireAuth, controller.executeCommand.bind(controller));
router.post('/devices/:imei/sync', requireAuth, controller.forceSync.bind(controller));
router.post('/devices/:imei/ping', requireAuth, controller.ping.bind(controller));
router.post('/devices/:imei/lock', requireAuth, controller.lock.bind(controller));
router.post('/devices/:imei/unlock', requireAuth, controller.unlock.bind(controller));
router.post('/devices/:imei/reset-password', requireAuth, controller.resetPassword.bind(controller));
router.post('/devices/:imei/silent-install', requireAuth, controller.silentInstall.bind(controller));
router.post('/devices/:imei/wipe', requireAuth, controller.wipeDevice.bind(controller));
router.post('/devices/:imei/release', requireAuth, controller.release.bind(controller));
router.post('/devices/:imei/payment', requireAuth, controller.recordPayment.bind(controller));

// Bulk Operations
router.post('/devices/bulk-policy', requireAuth, controller.bulkAssignPolicy.bind(controller));

// Policy Profile Management
router.get('/policies', requireAuth, controller.getPolicies.bind(controller));
router.get('/policies/:id', requireAuth, controller.getPolicyById.bind(controller));
router.post('/policies', requireAuth, controller.savePolicy.bind(controller));
router.delete('/policies/:id', requireAuth, controller.deletePolicy.bind(controller));

// Enterprise App Repository
router.get('/apps', requireAuth, controller.getApps.bind(controller));
router.post('/apps', requireAuth, controller.saveApp.bind(controller));
router.delete('/apps/:id', requireAuth, controller.deleteApp.bind(controller));

// Enrollment & QR Provisioning Configuration
router.get('/enrollment/profile', requireAuth, controller.getEnrollmentProfile.bind(controller));
router.post('/enrollment/profile', requireAuth, controller.saveEnrollmentProfile.bind(controller));

// Audit Logs
router.get('/logs', requireAuth, controller.getAuditLogs.bind(controller));

// System Data Backup & Restore (Permanent Session Continuity)
router.get('/backup/export', requireAuth, controller.exportBackup.bind(controller));
router.post('/backup/import', requireAuth, controller.importBackup.bind(controller));

// Real-time Event Stream for Virtual Device Simulator
router.get('/simulator/events', controller.streamSimulatorEvents.bind(controller));

module.exports = router;
