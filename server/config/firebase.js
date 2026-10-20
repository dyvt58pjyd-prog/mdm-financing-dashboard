const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let isUsingMock = false;
let db = null;
let messaging = null;
let auth = null;

// Initial mock seed data for Financed Devices
const initialDevices = {
  "358291094821045": {
    imei: "358291094821045",
    fcmToken: "dF19z8LpQ2W:APA91bF7XkU3xQ8rL2a0y9M7N6P1o5t3V8w9Y0z-mock-fcm-token-01",
    status: "UNLOCKED",
    nextDueAmount: 48.50,
    currency: "USD",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ahead
    lastSyncTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    customer: {
      name: "Marcus Vance",
      phone: "+1 (555) 234-8901",
      email: "marcus.vance@example.com",
      contractId: "FIN-2025-0891"
    },
    hardware: {
      brand: "Samsung",
      model: "Galaxy A54 5G",
      androidVersion: "Android 14 (OneUI 6.1)",
      batteryLevel: 88,
      tamperStatus: "Secure",
      simImsi: "310260123456789",
      lockAppVersion: "v3.4.2-dlc"
    },
    financing: {
      totalAmount: 450.00,
      totalTenureMonths: 12,
      paidInstallments: 5,
      remainingInstallments: 7,
      totalPaid: 187.50,
      monthlyPayment: 48.50,
      interestRate: "8.5%",
      loanStartDate: "2025-05-15"
    },
    history: [
      { date: "2025-09-15", amount: 48.50, status: "Paid", txId: "TX-990145" },
      { date: "2025-08-15", amount: 48.50, status: "Paid", txId: "TX-870321" },
      { date: "2025-07-15", amount: 48.50, status: "Paid", txId: "TX-760129" },
      { date: "2025-06-15", amount: 48.50, status: "Paid", txId: "TX-650893" },
      { date: "2025-05-15", amount: 48.50, status: "Paid (Down Payment)", txId: "TX-540112" }
    ]
  },
  "864209048312954": {
    imei: "864209048312954",
    fcmToken: "eK92m4VxR8Q:APA91bH4xU8kL1p2A5w9B0c3D7e8F9g0H1i-mock-fcm-token-02",
    status: "LOCKED",
    nextDueAmount: 62.00,
    currency: "USD",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days OVERDUE
    lastSyncTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    customer: {
      name: "Sophia Rodriguez",
      phone: "+1 (555) 782-4419",
      email: "sophia.rodriguez@example.com",
      contractId: "FIN-2025-0412"
    },
    hardware: {
      brand: "Xiaomi",
      model: "Redmi Note 13 Pro",
      androidVersion: "Android 13 (HyperOS)",
      batteryLevel: 42,
      tamperStatus: "Secure",
      simImsi: "310410987654321",
      lockAppVersion: "v3.4.2-dlc"
    },
    financing: {
      totalAmount: 380.00,
      totalTenureMonths: 8,
      paidInstallments: 3,
      remainingInstallments: 5,
      totalPaid: 142.50,
      monthlyPayment: 62.00,
      interestRate: "9.0%",
      loanStartDate: "2025-07-01"
    },
    history: [
      { date: "2025-09-01", amount: 62.00, status: "Failed / Overdue", txId: "TX-FAIL-01" },
      { date: "2025-08-01", amount: 62.00, status: "Paid", txId: "TX-810934" },
      { date: "2025-07-01", amount: 62.00, status: "Paid", txId: "TX-720188" }
    ]
  },
  "359102049182736": {
    imei: "359102049182736",
    fcmToken: "cL73w9PzT1M:APA91bG3rP6kX4m9Z2y8A1b7C4d0E2f8G9h-mock-fcm-token-03",
    status: "UNLOCKED",
    nextDueAmount: 35.00,
    currency: "USD",
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastSyncTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    customer: {
      name: "Tariq Al-Mansoor",
      phone: "+1 (555) 901-3321",
      email: "tariq.mansoor@example.com",
      contractId: "FIN-2025-1104"
    },
    hardware: {
      brand: "Motorola",
      model: "Moto G Stylus 5G",
      androidVersion: "Android 14",
      batteryLevel: 94,
      tamperStatus: "Secure",
      simImsi: "310260456123789",
      lockAppVersion: "v3.4.2-dlc"
    },
    financing: {
      totalAmount: 320.00,
      totalTenureMonths: 10,
      paidInstallments: 2,
      remainingInstallments: 8,
      totalPaid: 70.00,
      monthlyPayment: 35.00,
      interestRate: "7.0%",
      loanStartDate: "2025-08-10"
    },
    history: [
      { date: "2025-09-10", amount: 35.00, status: "Paid", txId: "TX-901844" },
      { date: "2025-08-10", amount: 35.00, status: "Paid (Down Payment)", txId: "TX-841920" }
    ]
  },
  "990001827364510": {
    imei: "990001827364510",
    fcmToken: "jP51v8MnQ3L:APA91bQ9wE2rT4y6U8i0O1p3A5s7D9f1G3h-mock-fcm-token-04",
    status: "RELEASED",
    nextDueAmount: 0.00,
    currency: "USD",
    dueDate: "Loan Fully Paid",
    lastSyncTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    customer: {
      name: "Elena Rostova",
      phone: "+1 (555) 438-9920",
      email: "elena.rostova@example.com",
      contractId: "FIN-2024-0019"
    },
    hardware: {
      brand: "Google",
      model: "Pixel 7a",
      androidVersion: "Android 14",
      batteryLevel: 75,
      tamperStatus: "Released / Unenrolled",
      simImsi: "310260789123456",
      lockAppVersion: "Unenrolled"
    },
    financing: {
      totalAmount: 499.00,
      totalTenureMonths: 12,
      paidInstallments: 12,
      remainingInstallments: 0,
      totalPaid: 499.00,
      monthlyPayment: 0.00,
      interestRate: "0.0%",
      loanStartDate: "2024-09-01"
    },
    history: [
      { date: "2025-08-01", amount: 41.58, status: "Final Payment Complete", txId: "TX-FINAL-99" }
    ]
  },
  "862901048293817": {
    imei: "862901048293817",
    fcmToken: "tY83b2KpL9X:APA91bZ1xQ4rT7u0I3o6P9s2D5f8G1h4J7k-mock-fcm-token-05",
    status: "LOCKED",
    nextDueAmount: 55.00,
    currency: "USD",
    dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days overdue
    lastSyncTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    customer: {
      name: "David K. Ochieng",
      phone: "+1 (555) 312-7788",
      email: "david.ochieng@example.com",
      contractId: "FIN-2025-0723"
    },
    hardware: {
      brand: "Tecno",
      model: "Camon 20 Premier",
      androidVersion: "Android 13 (HiOS)",
      batteryLevel: 61,
      tamperStatus: "Secure",
      simImsi: "310410112233445",
      lockAppVersion: "v3.4.2-dlc"
    },
    financing: {
      totalAmount: 330.00,
      totalTenureMonths: 6,
      paidInstallments: 2,
      remainingInstallments: 4,
      totalPaid: 110.00,
      monthlyPayment: 55.00,
      interestRate: "6.0%",
      loanStartDate: "2025-06-20"
    },
    history: [
      { date: "2025-09-20", amount: 55.00, status: "Overdue", txId: "TX-FAIL-20" },
      { date: "2025-08-20", amount: 55.00, status: "Paid", txId: "TX-882011" },
      { date: "2025-07-20", amount: 55.00, status: "Paid", txId: "TX-771900" }
    ]
  }
};

let auditLogs = [
  {
    id: "LOG-" + Date.now(),
    imei: "864209048312954",
    command: "LOCK",
    fcmMessageId: "projects/mdm-financing/messages/mock-fcm-001",
    payload: { dlcCommand: "LOCK", reason: "Automatic Overdue Lock Enforcement" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "DELIVERED",
    dispatchedBy: "SYSTEM_CRON"
  }
];

// Simulator listeners for connected virtual devices
const simulatorListeners = new Map();

/**
 * Creates mock Firebase Realtime Database and FCM messaging implementation
 * ensuring immediate full zero-config execution while strictly supporting
 * live Firebase Admin SDK credentials when provided.
 */
function createMockFirebase() {
  const store = {
    devices: { ...initialDevices },
    auditLogs: [...auditLogs]
  };

  const createRef = (pathStr) => {
    const parts = pathStr.split('/').filter(Boolean);
    return {
      once: async (eventType) => {
        if (eventType !== 'value') return { val: () => null };
        let curr = store;
        for (const p of parts) {
          if (curr === undefined || curr === null) return { val: () => null };
          curr = curr[p];
        }
        return {
          val: () => (curr !== undefined ? JSON.parse(JSON.stringify(curr)) : null),
          exists: () => curr !== undefined && curr !== null
        };
      },
      set: async (val) => {
        if (parts.length === 0) return;
        let curr = store;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = JSON.parse(JSON.stringify(val));
        return Promise.resolve();
      },
      update: async (updates) => {
        let curr = store;
        for (const p of parts) {
          if (!curr[p]) curr[p] = {};
          curr = curr[p];
        }
        Object.assign(curr, JSON.parse(JSON.stringify(updates)));
        return Promise.resolve();
      },
      push: async (val) => {
        let curr = store;
        for (const p of parts) {
          if (!curr[p]) curr[p] = {};
          curr = curr[p];
        }
        const newKey = "key_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        if (Array.isArray(curr)) {
          curr.push({ id: newKey, ...val });
        } else {
          curr[newKey] = val;
        }
        return { key: newKey };
      }
    };
  };

  const mockDb = {
    ref: (pathStr = '') => createRef(pathStr)
  };

  const mockMessaging = {
    send: async (message) => {
      const msgId = "projects/mdm-financing/messages/mock-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
      console.log(`[FCM-SIMULATOR] Dispatched FCM Data Message to token: ${message.token}`);
      console.log(`[FCM-SIMULATOR] Payload:`, JSON.stringify(message.data, null, 2));

      // Broadcast to any connected device simulator clients
      const command = message.data?.dlcCommand;
      for (const [listenerId, callback] of simulatorListeners.entries()) {
        try {
          callback({
            messageId: msgId,
            token: message.token,
            data: message.data,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error(`Error notifying simulator listener ${listenerId}:`, err);
        }
      }

      return msgId;
    }
  };

  const mockAuth = {
    verifyIdToken: async (token) => {
      if (token && (token.startsWith("admin-") || token === "demo-admin-token" || token.length > 20)) {
        return {
          uid: "admin_superuser_01",
          email: "admin@mdm-financing.internal",
          name: "MDM Master Admin",
          role: "admin",
          admin: true
        };
      }
      throw new Error("Invalid or expired Firebase Auth token");
    }
  };

  return { mockDb, mockMessaging, mockAuth, store };
}

// Check for live Firebase configuration
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

let isLive = false;

try {
  let credential = null;
  if (serviceAccountKeyJson) {
    const parsed = JSON.parse(serviceAccountKeyJson);
    credential = admin.credential.cert(parsed);
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    credential = admin.credential.cert(serviceAccountPath);
  }

  if (credential && databaseURL) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential,
        databaseURL
      });
    }
    db = admin.database();
    messaging = admin.messaging();
    auth = admin.auth();
    isLive = true;
    console.log("[FIREBASE] Connected to live Firebase project with Admin SDK & Realtime Database.");
  }
} catch (e) {
  console.warn("[FIREBASE] Live credentials check warning:", e.message);
}

if (!isLive) {
  console.log("[FIREBASE] Running in resilient Sandbox/Demo Mode with simulated Realtime Database and FCM router.");
  isUsingMock = true;
  const mock = createMockFirebase();
  db = mock.mockDb;
  messaging = mock.mockMessaging;
  auth = mock.mockAuth;
}

module.exports = {
  admin,
  db,
  messaging,
  auth,
  isUsingMock,
  simulatorListeners
};
