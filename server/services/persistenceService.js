const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'mdm_database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Seed Database
const defaultSeedData = {
  devices: {
    "DEV-882910": {
      id: "DEV-882910",
      serialNumber: "R52M90K11QA",
      imei: "358291094821045",
      fcmToken: "dF19z8LpQ2W:APA91bF7XkU3xQ8rL2a0y9M7N6P1o5t3V8w9Y0z-mock-fcm-token-01",
      name: "Retail Terminal #04 (POS)",
      hardware: {
        brand: "Samsung",
        model: "Galaxy Tab Active4 Pro",
        androidVersion: "Android 14 (OneUI 6.1)",
        batteryLevel: 88,
        isCharging: true,
        storageUsedGb: 48.2,
        storageTotalGb: 128.0,
        tamperStatus: "Secure",
        simImsi: "310260123456789",
        lockAppVersion: "v3.4.2-dlc"
      },
      network: {
        wifiSsid: "Enterprise_Secure_5G",
        ipAddress: "192.168.1.142",
        macAddress: "5C:62:8F:A1:09:44",
        signalDbm: -54
      },
      status: "UNLOCKED",
      policyId: "policy_kiosk_retail",
      lockScreenPasswordSet: true,
      lastSyncTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      customer: {
        name: "Marcus Vance",
        phone: "+1 (555) 234-8901",
        email: "marcus.vance@example.com",
        contractId: "FIN-2025-0891"
      },
      financing: {
        totalAmount: 450.00,
        totalPaid: 187.50,
        monthlyPayment: 48.50,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      installedApps: [
        { packageName: "com.retail.pos", name: "Apex Retail POS", version: "2.4.1", installDate: "2025-05-15" },
        { packageName: "com.android.chrome", name: "Google Chrome Enterprise", version: "128.0.6613", installDate: "2025-05-15" },
        { packageName: "com.apex.mdm.agent", name: "Apex DPC Controller", version: "3.4.2", installDate: "2025-05-15" }
      ]
    },
    "DEV-910283": {
      id: "DEV-910283",
      serialNumber: "ZBR-991048-X",
      imei: "864209048312954",
      fcmToken: "eK92m4VxR8Q:APA91bH4xU8kL1p2A5w9B0c3D7e8F9g0H1i-mock-fcm-token-02",
      name: "Warehouse Barcode Scanner #12",
      hardware: {
        brand: "Zebra",
        model: "TC58 Enterprise Touch Computer",
        androidVersion: "Android 13 Enterprise",
        batteryLevel: 24,
        isCharging: false,
        storageUsedGb: 18.5,
        storageTotalGb: 64.0,
        tamperStatus: "Secure",
        simImsi: "310410987654321",
        lockAppVersion: "v3.4.2-dlc"
      },
      network: {
        wifiSsid: "Warehouse_Mesh_B",
        ipAddress: "10.20.4.88",
        macAddress: "74:DA:38:C2:55:1A",
        signalDbm: -68
      },
      status: "LOCKED",
      policyId: "policy_warehouse_scanner",
      lockScreenPasswordSet: true,
      lastSyncTime: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      customer: {
        name: "Sophia Rodriguez",
        phone: "+1 (555) 782-4419",
        email: "sophia.rodriguez@example.com",
        contractId: "FIN-2025-0412"
      },
      financing: {
        totalAmount: 380.00,
        totalPaid: 142.50,
        monthlyPayment: 62.00,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      installedApps: [
        { packageName: "com.warehouse.scan", name: "OmniScanner Logistics", version: "3.1.0", installDate: "2025-07-01" },
        { packageName: "com.apex.mdm.agent", name: "Apex DPC Controller", version: "3.4.2", installDate: "2025-07-01" }
      ]
    },
    "DEV-334918": {
      id: "DEV-334918",
      serialNumber: "99A03881KF",
      imei: "359102049182736",
      fcmToken: "cL73w9PzT1M:APA91bG3rP6kX4m9Z2y8A1b7C4d0E2f8G9h-mock-fcm-token-03",
      name: "Field Inspection Handset #07",
      hardware: {
        brand: "Google",
        model: "Pixel 8 Pro",
        androidVersion: "Android 14 Enterprise",
        batteryLevel: 94,
        isCharging: false,
        storageUsedGb: 62.1,
        storageTotalGb: 256.0,
        tamperStatus: "Secure",
        simImsi: "310260456123789",
        lockAppVersion: "v3.4.2-dlc"
      },
      network: {
        wifiSsid: "Apex_HQ_Enterprise",
        ipAddress: "192.168.10.15",
        macAddress: "90:B6:86:E0:41:7B",
        signalDbm: -48
      },
      status: "UNLOCKED",
      policyId: "policy_field_logistics",
      lockScreenPasswordSet: true,
      lastSyncTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      customer: {
        name: "Tariq Al-Mansoor",
        phone: "+1 (555) 901-3321",
        email: "tariq.mansoor@example.com",
        contractId: "FIN-2025-1104"
      },
      financing: {
        totalAmount: 320.00,
        totalPaid: 70.00,
        monthlyPayment: 35.00,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      installedApps: [
        { packageName: "com.apex.fieldops", name: "Field Logistics Agent Pro", version: "1.9.4", installDate: "2025-08-10" },
        { packageName: "com.google.android.apps.maps", name: "Google Maps", version: "11.120", installDate: "2025-08-10" },
        { packageName: "com.apex.mdm.agent", name: "Apex DPC Controller", version: "3.4.2", installDate: "2025-08-10" }
      ]
    },
    "DEV-110482": {
      id: "DEV-110482",
      serialNumber: "XM-881923-01",
      imei: "990001827364510",
      fcmToken: "jP51v8MnQ3L:APA91bQ9wE2rT4y6U8i0O1p3A5s7D9f1G3h-mock-fcm-token-04",
      name: "Digital Storefront Signage #02",
      hardware: {
        brand: "Xiaomi",
        model: "Pad 6 Max 14",
        androidVersion: "Android 13 (HyperOS)",
        batteryLevel: 100,
        isCharging: true,
        storageUsedGb: 12.4,
        storageTotalGb: 128.0,
        tamperStatus: "Secure",
        simImsi: "310260789123456",
        lockAppVersion: "v3.4.2-dlc"
      },
      network: {
        wifiSsid: "Retail_Store_Guest",
        ipAddress: "172.16.0.45",
        macAddress: "40:8D:5C:1B:90:33",
        signalDbm: -62
      },
      status: "RELEASED",
      policyId: "policy_kiosk_retail",
      lockScreenPasswordSet: false,
      lastSyncTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      customer: {
        name: "Elena Rostova",
        phone: "+1 (555) 438-9920",
        email: "elena.rostova@example.com",
        contractId: "FIN-2024-0019"
      },
      financing: {
        totalAmount: 499.00,
        totalPaid: 499.00,
        monthlyPayment: 0.00,
        dueDate: "Loan Fully Paid"
      },
      installedApps: [
        { packageName: "com.signage.player", name: "Signage Stream Player", version: "4.0.2", installDate: "2024-09-01" }
      ]
    },
    "DEV-772910": {
      id: "DEV-772910",
      serialNumber: "MOT-771920-THK",
      imei: "862901048293817",
      fcmToken: "tY83b2KpL9X:APA91bZ1xQ4rT7u0I3o6P9s2D5f8G1h4J7k-mock-fcm-token-05",
      name: "Executive Mobile ThinkPhone #01",
      hardware: {
        brand: "Motorola",
        model: "Lenovo ThinkPhone",
        androidVersion: "Android 14 Enterprise",
        batteryLevel: 62,
        isCharging: false,
        storageUsedGb: 92.0,
        storageTotalGb: 256.0,
        tamperStatus: "Secure",
        simImsi: "310410112233445",
        lockAppVersion: "v3.4.2-dlc"
      },
      network: {
        wifiSsid: "Executive_VPN_WiFi",
        ipAddress: "10.50.1.201",
        macAddress: "02:1A:C5:77:88:99",
        signalDbm: -51
      },
      status: "LOCKED",
      policyId: "policy_executive_secure",
      lockScreenPasswordSet: true,
      lastSyncTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      customer: {
        name: "David K. Ochieng",
        phone: "+1 (555) 312-7788",
        email: "david.ochieng@example.com",
        contractId: "FIN-2025-0723"
      },
      financing: {
        totalAmount: 330.00,
        totalPaid: 110.00,
        monthlyPayment: 55.00,
        dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      installedApps: [
        { packageName: "com.apex.vault", name: "Corporate Secure Vault", version: "5.1.0", installDate: "2025-06-20" },
        { packageName: "com.android.chrome", name: "Google Chrome", version: "128.0", installDate: "2025-06-20" },
        { packageName: "com.apex.mdm.agent", name: "Apex DPC Controller", version: "3.4.2", installDate: "2025-06-20" }
      ]
    }
  },
  policies: {
    "policy_kiosk_retail": {
      id: "policy_kiosk_retail",
      name: "Kiosk Mode - Retail POS & Signage",
      description: "Strict single-app or dual-app lockdown for in-store point of sale terminals and digital displays.",
      version: 4,
      updatedAt: new Date().toISOString(),
      published: true,
      kioskMode: "SINGLE_APP",
      primaryKioskPackage: "com.retail.pos",
      allowlistedPackages: ["com.retail.pos", "com.android.chrome", "com.apex.mdm.agent"],
      lockTaskFeatures: {
        home: false,
        overview: false,
        notifications: false,
        systemInfo: true,
        globalActions: false
      },
      restrictions: {
        disallowFactoryReset: true,
        disallowSafeBoot: true,
        disallowCamera: true,
        disallowScreenCapture: true,
        disallowUsbFileTransfer: true,
        disallowBluetooth: true,
        disallowConfigWifi: true,
        disallowAdjustVolume: false,
        disallowUnknownSources: true,
        disallowAddUser: true
      },
      appRepositoryRules: [
        { packageId: "app_pos", autoInstall: true, blockUninstall: true }
      ],
      systemUpdatePolicy: {
        type: "WINDOWED",
        startHour: 2,
        endHour: 5
      }
    },
    "policy_field_logistics": {
      id: "policy_field_logistics",
      name: "Field Logistics - Dedicated Multi-App",
      description: "Multi-app allowlisted environment for warehouse staff, delivery drivers, and field technicians.",
      version: 3,
      updatedAt: new Date().toISOString(),
      published: true,
      kioskMode: "MULTI_APP",
      primaryKioskPackage: "com.apex.fieldops",
      allowlistedPackages: [
        "com.apex.fieldops",
        "com.google.android.apps.maps",
        "com.android.dialer",
        "com.apex.mdm.agent"
      ],
      lockTaskFeatures: {
        home: true,
        overview: false,
        notifications: true,
        systemInfo: true,
        globalActions: true
      },
      restrictions: {
        disallowFactoryReset: true,
        disallowSafeBoot: true,
        disallowCamera: false,
        disallowScreenCapture: true,
        disallowUsbFileTransfer: true,
        disallowBluetooth: false,
        disallowConfigWifi: false,
        disallowAdjustVolume: false,
        disallowUnknownSources: true,
        disallowAddUser: true
      },
      appRepositoryRules: [
        { packageId: "app_field", autoInstall: true, blockUninstall: true }
      ],
      systemUpdatePolicy: {
        type: "AUTOMATIC"
      }
    },
    "policy_executive_secure": {
      id: "policy_executive_secure",
      name: "Corporate Executive - High Security Profile",
      description: "Open home launcher experience with enterprise security restrictions, DLP, and corporate app deployment.",
      version: 2,
      updatedAt: new Date().toISOString(),
      published: true,
      kioskMode: "OFF",
      primaryKioskPackage: "",
      allowlistedPackages: [],
      lockTaskFeatures: {
        home: true,
        overview: true,
        notifications: true,
        systemInfo: true,
        globalActions: true
      },
      restrictions: {
        disallowFactoryReset: true,
        disallowSafeBoot: true,
        disallowCamera: false,
        disallowScreenCapture: true,
        disallowUsbFileTransfer: true,
        disallowBluetooth: false,
        disallowConfigWifi: false,
        disallowAdjustVolume: false,
        disallowUnknownSources: true,
        disallowAddUser: true
      },
      appRepositoryRules: [
        { packageId: "app_vault", autoInstall: true, blockUninstall: true },
        { packageId: "app_chrome", autoInstall: true, blockUninstall: false }
      ],
      systemUpdatePolicy: {
        type: "POSTPONE",
        postponeDays: 14
      }
    }
  },
  appRepository: {
    "app_pos": {
      id: "app_pos",
      name: "Apex Retail POS Terminal",
      packageName: "com.retail.pos",
      version: "2.4.1",
      sizeMb: 28.4,
      downloadUrl: "https://mdm.enterprise.internal/apks/apex-pos-v2.4.1.apk",
      checksum: "7a8f9c1e2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      category: "Finance",
      mandatory: true,
      updatedAt: "2025-05-15"
    },
    "app_field": {
      id: "app_field",
      name: "Field Logistics Agent Pro",
      packageName: "com.apex.fieldops",
      version: "1.9.4",
      sizeMb: 45.2,
      downloadUrl: "https://mdm.enterprise.internal/apks/field-agent-v1.9.4.apk",
      checksum: "9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
      category: "Operations",
      mandatory: true,
      updatedAt: "2025-08-10"
    },
    "app_vault": {
      id: "app_vault",
      name: "Corporate Secure Vault",
      packageName: "com.apex.vault",
      version: "5.1.0",
      sizeMb: 19.8,
      downloadUrl: "https://mdm.enterprise.internal/apks/corp-vault-v5.1.0.apk",
      checksum: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      category: "Security",
      mandatory: false,
      updatedAt: "2025-06-20"
    },
    "app_chrome": {
      id: "app_chrome",
      name: "Google Chrome Enterprise",
      packageName: "com.android.chrome",
      version: "128.0.6613",
      sizeMb: 92.0,
      downloadUrl: "https://dl.google.com/android/chrome/enterprise.apk",
      checksum: "3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
      category: "Browser",
      mandatory: false,
      updatedAt: "2025-07-15"
    }
  },
  enrollmentProfiles: {
    "default": {
      id: "enroll_default",
      name: "Standard Android Enterprise Zero-Touch",
      adminComponent: "com.example.myapplication/.MDMDeviceAdminReceiver",
      apkUrl: "https://mdm.enterprise.internal/downloads/apex-dpc-agent.apk",
      checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      wifiSsid: "Apex_Corporate_Enroll",
      wifiPassword: "EnterpriseWPA3Key#2026",
      wifiSecurity: "WPA",
      wifiHidden: false,
      serverUrl: "http://localhost:5001/api",
      enrollmentToken: "APEX-ENTERPRISE-TOKEN-8819",
      defaultPolicyId: "policy_kiosk_retail",
      leaveSystemAppsEnabled: true,
      locale: "en_US",
      timeZone: "America/New_York",
      updatedAt: new Date().toISOString()
    }
  },
  auditLogs: [
    {
      id: "LOG-" + Date.now(),
      imei: "864209048312954",
      command: "LOCK",
      fcmMessageId: "projects/mdm-financing/messages/mock-fcm-001",
      payload: { dlcCommand: "LOCK", reason: "Automatic Overdue Lock Enforcement" },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "DELIVERED",
      dispatchedBy: "SYSTEM_POLICY_ENGINE"
    }
  ]
};

class PersistenceService {
  constructor() {
    this.data = this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        console.log(`[PERSISTENCE] Loaded database from disk (${Object.keys(parsed.devices || {}).length} devices).`);
        return parsed;
      }
    } catch (err) {
      console.error('[PERSISTENCE] Failed reading database file, using defaults:', err.message);
    }
    // Write defaults
    this.saveToDisk(defaultSeedData);
    return JSON.parse(JSON.stringify(defaultSeedData));
  }

  saveToDisk(dataToSave) {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[PERSISTENCE] Failed writing database file:', err.message);
    }
  }

  // --- Devices ---
  getAllDevices() {
    return Object.values(this.data.devices || {});
  }

  getDevice(idOrImei) {
    if (this.data.devices[idOrImei]) return this.data.devices[idOrImei];
    return Object.values(this.data.devices).find(d => d.imei === idOrImei || d.serialNumber === idOrImei) || null;
  }

  saveDevice(device) {
    const key = device.id || device.imei;
    this.data.devices[key] = {
      ...this.data.devices[key],
      ...device,
      lastSyncTime: new Date().toISOString()
    };
    this.saveToDisk();
    return this.data.devices[key];
  }

  deleteDevice(idOrImei) {
    const dev = this.getDevice(idOrImei);
    if (dev) {
      delete this.data.devices[dev.id || dev.imei];
      delete this.data.devices[dev.imei];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Bulk update policy
  bulkAssignPolicy(deviceIds, policyId) {
    const policy = this.getPolicy(policyId);
    if (!policy) throw new Error(`Policy ${policyId} does not exist`);

    const updated = [];
    for (const id of deviceIds) {
      const dev = this.getDevice(id);
      if (dev) {
        dev.policyId = policyId;
        dev.lastSyncTime = new Date().toISOString();
        updated.push(dev);
      }
    }
    this.saveToDisk();
    return updated;
  }

  // --- Policies ---
  getAllPolicies() {
    return Object.values(this.data.policies || {});
  }

  getPolicy(policyId) {
    return this.data.policies[policyId] || null;
  }

  savePolicy(policy) {
    const id = policy.id || `policy_${Date.now()}`;
    const existing = this.data.policies[id] || {};
    this.data.policies[id] = {
      ...existing,
      ...policy,
      id,
      version: (existing.version || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    this.saveToDisk();
    return this.data.policies[id];
  }

  deletePolicy(policyId) {
    if (this.data.policies[policyId]) {
      delete this.data.policies[policyId];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- App Repository ---
  getAllApps() {
    return Object.values(this.data.appRepository || {});
  }

  saveApp(app) {
    const id = app.id || `app_${Date.now()}`;
    this.data.appRepository[id] = {
      ...app,
      id,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.saveToDisk();
    return this.data.appRepository[id];
  }

  deleteApp(id) {
    if (this.data.appRepository[id]) {
      delete this.data.appRepository[id];
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Enrollment Profiles ---
  getEnrollmentProfile(id = 'default') {
    return this.data.enrollmentProfiles[id] || this.data.enrollmentProfiles['default'];
  }

  saveEnrollmentProfile(profile) {
    const id = profile.id || 'default';
    this.data.enrollmentProfiles[id] = {
      ...this.data.enrollmentProfiles[id],
      ...profile,
      id,
      updatedAt: new Date().toISOString()
    };
    this.saveToDisk();
    return this.data.enrollmentProfiles[id];
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return (this.data.auditLogs || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addAuditLog(logEntry) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const entry = {
      id: logEntry.id || `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...logEntry
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.saveToDisk();
    return entry;
  }

  // --- Backup & Restore ---
  exportDatabase() {
    return {
      exportedAt: new Date().toISOString(),
      version: '2.4.0',
      system: 'ApexMDM Enterprise Control Platform',
      data: JSON.parse(JSON.stringify(this.data))
    };
  }

  importDatabase(backupPayload) {
    if (!backupPayload || !backupPayload.data) {
      throw new Error('Invalid backup file format');
    }
    const incoming = backupPayload.data;
    this.data = {
      devices: incoming.devices || {},
      policies: incoming.policies || {},
      appRepository: incoming.appRepository || {},
      enrollmentProfiles: incoming.enrollmentProfiles || {},
      auditLogs: incoming.auditLogs || []
    };
    this.saveToDisk();
    return {
      success: true,
      devicesCount: Object.keys(this.data.devices).length,
      policiesCount: Object.keys(this.data.policies).length,
      appsCount: Object.keys(this.data.appRepository).length
    };
  }
}

module.exports = new PersistenceService();
