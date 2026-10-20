const mdmService = require('../services/mdmService');
const persistence = require('../services/persistenceService');
const { simulatorListeners } = require('../config/firebase');

class DeviceController {
  // --- Devices & Telemetry ---
  async getDevices(req, res) {
    try {
      const devices = await mdmService.getAllDevices();
      res.json({ success: true, count: devices.length, devices });
    } catch (error) {
      console.error('[CONTROLLER] getDevices error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDeviceByImei(req, res) {
    try {
      const { imei } = req.params;
      const device = await mdmService.getDevice(imei);
      if (!device) return res.status(404).json({ success: false, error: `Device ${imei} not found` });
      res.json({ success: true, device });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateTelemetry(req, res) {
    try {
      const { imei } = req.params;
      const telemetry = req.body;
      const device = await mdmService.getDevice(imei);
      if (!device) return res.status(404).json({ success: false, error: 'Device not found' });

      if (telemetry.hardware) device.hardware = { ...device.hardware, ...telemetry.hardware };
      if (telemetry.network) device.network = { ...device.network, ...telemetry.network };
      if (telemetry.installedApps) device.installedApps = telemetry.installedApps;
      device.lastSyncTime = new Date().toISOString();

      persistence.saveDevice(device);
      res.json({ success: true, device });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- MDM Remote Actions ---
  async executeCommand(req, res) {
    try {
      const { imei } = req.params;
      const { command, reason, daysExtension, newPassword, packageId } = req.body;
      const user = req.user;

      if (!command) return res.status(400).json({ success: false, error: 'Command is required' });

      const normalized = command.toUpperCase().trim();
      let result;

      switch (normalized) {
        case 'SYNC':
          result = await mdmService.forceSync(imei, user);
          break;
        case 'PING':
          result = await mdmService.pingDevice(imei, user);
          break;
        case 'LOCK':
          result = await mdmService.lockDevice(imei, reason || 'Administrative Policy Lockdown', user);
          break;
        case 'UNLOCK':
          result = await mdmService.unlockDevice(imei, Number(daysExtension) || 30, user);
          break;
        case 'RESET_PASSWORD':
          result = await mdmService.resetLockPassword(imei, newPassword || '123456', user);
          break;
        case 'INSTALL_APP':
          result = await mdmService.silentInstallApp(imei, packageId, user);
          break;
        case 'WIPE':
          result = await mdmService.wipeDevice(imei, user);
          break;
        case 'REBOOT':
          result = await mdmService.rebootDevice(imei, user);
          break;
        case 'RELEASE':
          result = await mdmService.unlockDevice(imei, 3650, user);
          const dev = await mdmService.getDevice(imei);
          dev.status = 'RELEASED';
          persistence.saveDevice(dev);
          break;
        default:
          return res.status(400).json({ success: false, error: `Unsupported command: ${command}` });
      }

      const updatedDevice = await mdmService.getDevice(imei);
      res.json({ success: true, command: normalized, imei, result, updatedDevice });
    } catch (error) {
      console.error('[CONTROLLER] executeCommand error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Convenience routes
  async forceSync(req, res) { req.body = req.body || {}; req.body.command = 'SYNC'; return this.executeCommand(req, res); }
  async ping(req, res) { req.body = req.body || {}; req.body.command = 'PING'; return this.executeCommand(req, res); }
  async lock(req, res) { req.body = req.body || {}; req.body.command = 'LOCK'; return this.executeCommand(req, res); }
  async unlock(req, res) { req.body = req.body || {}; req.body.command = 'UNLOCK'; return this.executeCommand(req, res); }
  async release(req, res) { req.body = req.body || {}; req.body.command = 'RELEASE'; return this.executeCommand(req, res); }

  async resetPassword(req, res) {
    req.body = req.body || {};
    req.body.command = 'RESET_PASSWORD';
    return this.executeCommand(req, res);
  }

  async silentInstall(req, res) {
    req.body = req.body || {};
    req.body.command = 'INSTALL_APP';
    return this.executeCommand(req, res);
  }

  async wipeDevice(req, res) {
    req.body = req.body || {};
    req.body.command = 'WIPE';
    return this.executeCommand(req, res);
  }

  async bulkAssignPolicy(req, res) {
    try {
      const { deviceIds, policyId } = req.body;
      if (!Array.isArray(deviceIds) || !policyId) {
        return res.status(400).json({ success: false, error: 'deviceIds array and policyId are required' });
      }
      const updated = await mdmService.bulkAssignPolicy(deviceIds, policyId, req.user);
      res.json({ success: true, count: updated.length, devices: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async recordPayment(req, res) {
    try {
      const { imei } = req.params;
      const { amount, note } = req.body;
      const result = await mdmService.processPayment(imei, amount, note, req.user);
      const updatedDevice = await mdmService.getDevice(imei);
      res.json({ success: true, result, updatedDevice });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async registerDevice(req, res) {
    try {
      const data = req.body;
      if (!data.imei) return res.status(400).json({ success: false, error: 'IMEI is required' });
      const device = {
        id: data.id || `DEV-${Math.floor(100000 + Math.random() * 900000)}`,
        serialNumber: data.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
        imei: data.imei,
        fcmToken: data.fcmToken || `fcm-token-${data.imei}-${Math.random().toString(36).slice(2, 8)}`,
        name: data.name || `${data.brand || 'Android'} ${data.model || 'Handset'}`,
        hardware: {
          brand: data.brand || 'Samsung',
          model: data.model || 'Galaxy Handset',
          androidVersion: data.androidVersion || 'Android 14',
          batteryLevel: 95,
          isCharging: false,
          storageUsedGb: 20.0,
          storageTotalGb: 128.0,
          tamperStatus: 'Secure',
          simImsi: '310260' + Math.floor(100000000 + Math.random() * 900000000),
          lockAppVersion: 'v3.4.2-dlc'
        },
        network: {
          wifiSsid: data.wifiSsid || 'Enterprise_Fleet_WiFi',
          ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 200),
          macAddress: '00:1A:2B:3C:4D:' + Math.floor(10 + Math.random() * 89),
          signalDbm: -55
        },
        status: 'UNLOCKED',
        policyId: data.policyId || 'policy_kiosk_retail',
        lockScreenPasswordSet: true,
        lastSyncTime: new Date().toISOString(),
        customer: {
          name: data.customerName || 'Corporate Fleet',
          phone: data.customerPhone || '+1 (555) 000-0000',
          email: data.customerEmail || 'fleet@enterprise.internal',
          contractId: `ENT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        },
        installedApps: [
          { packageName: 'com.apex.mdm.agent', name: 'Apex DPC Controller', version: '3.4.2', installDate: new Date().toISOString().split('T')[0] }
        ]
      };

      const saved = persistence.saveDevice(device);
      res.status(201).json({ success: true, device: saved });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Policy Profiles & config.json Generator ---
  async getPolicies(req, res) {
    try {
      const policies = persistence.getAllPolicies();
      res.json({ success: true, count: policies.length, policies });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPolicyById(req, res) {
    try {
      const { id } = req.params;
      const policy = persistence.getPolicy(id);
      if (!policy) return res.status(404).json({ success: false, error: 'Policy not found' });
      res.json({ success: true, policy });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUBLIC endpoint: Generates the formal config.json parsed by mobile Android DPC agents
  async getPolicyConfigJson(req, res) {
    try {
      const { id } = req.params;
      const policy = persistence.getPolicy(id);
      if (!policy) return res.status(404).json({ error: 'Policy not found' });

      // Transform into standard Android Enterprise DPC JSON schema
      const apps = persistence.getAllApps();
      const appInstallList = (policy.appRepositoryRules || []).map(rule => {
        const found = apps.find(a => a.id === rule.packageId);
        return {
          packageName: found ? found.packageName : rule.packageId,
          appName: found ? found.name : 'Enterprise App',
          downloadUrl: found ? found.downloadUrl : '',
          checksum: found ? found.checksum : '',
          autoInstall: rule.autoInstall,
          blockUninstall: rule.blockUninstall
        };
      });

      const configJson = {
        schemaVersion: "2.4.0",
        policyId: policy.id,
        policyName: policy.name,
        policyVersion: policy.version,
        publishedAt: policy.updatedAt,
        kioskMode: {
          enabled: policy.kioskMode !== 'OFF',
          mode: policy.kioskMode, // SINGLE_APP, MULTI_APP, OFF
          primaryApp: policy.primaryKioskPackage,
          allowlistedPackages: policy.allowlistedPackages || [],
          lockTaskFeatures: policy.lockTaskFeatures || {}
        },
        userRestrictions: {
          disallowFactoryReset: policy.restrictions?.disallowFactoryReset ?? true,
          disallowSafeBoot: policy.restrictions?.disallowSafeBoot ?? true,
          disallowCamera: policy.restrictions?.disallowCamera ?? false,
          disallowScreenCapture: policy.restrictions?.disallowScreenCapture ?? true,
          disallowUsbFileTransfer: policy.restrictions?.disallowUsbFileTransfer ?? true,
          disallowBluetooth: policy.restrictions?.disallowBluetooth ?? false,
          disallowConfigWifi: policy.restrictions?.disallowConfigWifi ?? false,
          disallowAdjustVolume: policy.restrictions?.disallowAdjustVolume ?? false,
          disallowUnknownSources: policy.restrictions?.disallowUnknownSources ?? true,
          disallowAddUser: policy.restrictions?.disallowAddUser ?? true
        },
        applicationRepository: appInstallList,
        systemUpdatePolicy: policy.systemUpdatePolicy || { type: "AUTOMATIC" },
        telemetry: {
          heartbeatIntervalSeconds: 300,
          reportBattery: true,
          reportStorage: true,
          reportNetwork: true
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.json(configJson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async savePolicy(req, res) {
    try {
      const policyData = req.body;
      if (!policyData.name) return res.status(400).json({ success: false, error: 'Policy name is required' });
      const saved = persistence.savePolicy(policyData);

      persistence.addAuditLog({
        command: 'POLICY_SAVED',
        payload: { policyId: saved.id, name: saved.name, version: saved.version },
        dispatchedBy: req.user?.email || 'Apex MDM Admin'
      });

      res.json({ success: true, policy: saved });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePolicy(req, res) {
    try {
      const { id } = req.params;
      persistence.deletePolicy(id);
      res.json({ success: true, message: `Policy ${id} deleted` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- App Repository ---
  async getApps(req, res) {
    try {
      const apps = persistence.getAllApps();
      res.json({ success: true, count: apps.length, apps });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async saveApp(req, res) {
    try {
      const appData = req.body;
      if (!appData.name || !appData.packageName) {
        return res.status(400).json({ success: false, error: 'App name and package name are required' });
      }
      const saved = persistence.saveApp(appData);
      res.json({ success: true, app: saved });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteApp(req, res) {
    try {
      const { id } = req.params;
      persistence.deleteApp(id);
      res.json({ success: true, message: `App ${id} deleted` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Enrollment Profiles & Provisioning QR Payload ---
  async getEnrollmentProfile(req, res) {
    try {
      const profile = persistence.getEnrollmentProfile();
      // Generate standard Android Enterprise 6-Tap QR payload
      const qrPayload = {
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": profile.adminComponent || "com.example.myapplication/.MDMDeviceAdminReceiver",
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": profile.apkUrl,
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": profile.checksum,
        "android.app.extra.PROVISIONING_WIFI_SSID": profile.wifiSsid,
        "android.app.extra.PROVISIONING_WIFI_PASSWORD": profile.wifiPassword,
        "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE": profile.wifiSecurity || "WPA",
        "android.app.extra.PROVISIONING_WIFI_HIDDEN": profile.wifiHidden || false,
        "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": profile.leaveSystemAppsEnabled ?? true,
        "android.app.extra.PROVISIONING_LOCALE": profile.locale || "en_US",
        "android.app.extra.PROVISIONING_TIME_ZONE": profile.timeZone || "America/New_York",
        "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
          "server_url": profile.serverUrl || "http://localhost:5001/api",
          "enrollment_token": profile.enrollmentToken || "APEX-ENTERPRISE-TOKEN-8819",
          "default_policy_id": profile.defaultPolicyId || "policy_kiosk_retail"
        }
      };

      res.json({ success: true, profile, qrPayload, qrJsonString: JSON.stringify(qrPayload) });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async saveEnrollmentProfile(req, res) {
    try {
      const saved = persistence.saveEnrollmentProfile(req.body);
      res.json({ success: true, profile: saved });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- System Backup & Restore ---
  exportBackup(req, res) {
    try {
      const backup = persistence.exportDatabase();
      res.setHeader('Content-Disposition', `attachment; filename=apex_mdm_backup_${Date.now()}.json`);
      res.json(backup);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  importBackup(req, res) {
    try {
      const result = persistence.importDatabase(req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Audit Logs ---
  async getAuditLogs(req, res) {
    try {
      const logs = persistence.getAuditLogs();
      res.json({ success: true, count: logs.length, logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Simulator SSE ---
  streamSimulatorEvents(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const listenerId = 'sub_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const onMessage = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    simulatorListeners.set(listenerId, onMessage);
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', listenerId, time: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      simulatorListeners.delete(listenerId);
      res.end();
    });
  }
}

const controller = new DeviceController();
module.exports = controller;
