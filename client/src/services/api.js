import { defaultSeedData } from './defaultData';

const BASE_URL = '/api';

// Key for client-side persistence (used on static hosts like GitHub Pages)
const STORAGE_KEY = 'apex_mdm_standalone_store';

function getLocalStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const seeded = JSON.parse(JSON.stringify(defaultSeedData));
  saveLocalStore(seeded);
  return seeded;
}

function saveLocalStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

class ApiService {
  constructor() {
    this.token = localStorage.getItem('mdm_auth_token') || null;
    this.user = JSON.parse(localStorage.getItem('mdm_auth_user') || 'null');

    // Invalidate legacy demo sessions so user enters fresh credentials
    if (this.user && this.user.displayName !== 'System Administrator (admin)') {
      this.token = null;
      this.user = null;
      try {
        localStorage.removeItem('mdm_auth_token');
        localStorage.removeItem('mdm_auth_user');
      } catch (e) {}
    }
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    if (token) {
      localStorage.setItem('mdm_auth_token', token);
      localStorage.setItem('mdm_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mdm_auth_token');
      localStorage.removeItem('mdm_auth_user');
    }
  }

  getAuth() {
    return { token: this.token, user: this.user };
  }

  logout() {
    this.setAuth(null, null);
  }

  // Unified Request with Static Hosting Fallback (GitHub Pages resilient)
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.ok) {
        return await response.json();
      }
      // If 401 Unauthorized explicitly from backend, rethrow it
      if (response.status === 401) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid credentials');
      }
    } catch (networkError) {
      // If 401, rethrow
      if (networkError.message.includes('Invalid') || networkError.message.includes('credentials')) {
        throw networkError;
      }
      // Network error or 404 (e.g. running on GitHub Pages static host) -> fallback to client-side engine!
      console.log(`[STANDALONE-ENGINE] Routing ${endpoint} through Client-Side Persistence Engine (GitHub Pages mode)`);
      return this.handleStandaloneFallback(endpoint, options);
    }

    return this.handleStandaloneFallback(endpoint, options);
  }

  // Client-Side Persistence Engine for Static GitHub Pages
  handleStandaloneFallback(endpoint, options = {}) {
    const store = getLocalStore();
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    // Auth Login
    if (endpoint === '/auth/login' || endpoint === '/auth/demo-login') {
      const { username, password } = body;
      if (username === 'admin' && password === 'Anurag@268724') {
        const token = 'admin-jwt-mdm-token-' + btoa('admin');
        const user = {
          uid: 'admin_master_001',
          email: 'admin@apex-mdm.enterprise',
          displayName: 'System Administrator (admin)',
          role: 'SuperAdmin'
        };
        this.setAuth(token, user);
        return { success: true, token, user };
      }
      throw new Error('Invalid username or password');
    }

    // Health
    if (endpoint === '/health') {
      return {
        status: 'ONLINE',
        service: 'ApexMDM Enterprise Control Platform',
        version: '2.4.0',
        mode: 'STANDALONE_GITHUB_PAGES_PERSISTENCE',
        persistence: 'HTML5 Client Storage & JSON Engine'
      };
    }

    // Devices
    if (endpoint === '/devices' && method === 'GET') {
      return { success: true, count: Object.keys(store.devices).length, devices: Object.values(store.devices) };
    }

    if (endpoint.startsWith('/devices/') && method === 'GET') {
      const imei = endpoint.split('/')[2];
      const device = Object.values(store.devices).find(d => d.imei === imei || d.id === imei);
      return { success: true, device };
    }

    // Command execution
    if (endpoint.includes('/command') || endpoint.includes('/sync') || endpoint.includes('/ping') || endpoint.includes('/lock') || endpoint.includes('/unlock') || endpoint.includes('/reset-password') || endpoint.includes('/silent-install') || endpoint.includes('/wipe') || endpoint.includes('/reboot') || endpoint.includes('/release')) {
      const parts = endpoint.split('/');
      const imei = parts[2];
      const cmd = body.command || parts[3]?.toUpperCase() || 'SYNC';

      const dev = Object.values(store.devices).find(d => d.imei === imei || d.id === imei);
      if (dev) {
        dev.lastSyncTime = new Date().toISOString();
        if (cmd === 'LOCK') {
          dev.status = 'LOCKED';
          if (dev.financing) dev.financing.dueDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
        } else if (cmd === 'UNLOCK') {
          dev.status = 'UNLOCKED';
          if (dev.financing) dev.financing.dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        } else if (cmd === 'RELEASE') {
          dev.status = 'RELEASED';
        } else if (cmd === 'WIPE') {
          dev.status = 'WIPED';
        } else if (cmd === 'RESET_PASSWORD') {
          dev.lockScreenPasswordSet = true;
        } else if (cmd === 'INSTALL_APP') {
          const app = Object.values(store.appRepository).find(a => a.id === body.packageId || a.packageName === body.packageId);
          if (app && !dev.installedApps?.find(a => a.packageName === app.packageName)) {
            dev.installedApps = dev.installedApps || [];
            dev.installedApps.push({ packageName: app.packageName, name: app.name, version: app.version });
          }
        }
        saveLocalStore(store);

        // Audit log
        store.auditLogs.unshift({
          id: `LOG-${Date.now()}`,
          imei: dev.imei,
          command: cmd,
          timestamp: new Date().toISOString(),
          status: 'DELIVERED',
          fcmMessageId: `projects/mdm/messages/sim-${Date.now()}`,
          dispatchedBy: this.user?.email || 'admin'
        });
        saveLocalStore(store);

        return { success: true, command: cmd, imei: dev.imei, updatedDevice: dev };
      }
    }

    // Bulk Policy
    if (endpoint === '/devices/bulk-policy') {
      const { deviceIds, policyId } = body;
      const updated = [];
      for (const id of deviceIds) {
        const dev = Object.values(store.devices).find(d => d.imei === id || d.id === id);
        if (dev) {
          dev.policyId = policyId;
          dev.lastSyncTime = new Date().toISOString();
          updated.push(dev);
        }
      }
      saveLocalStore(store);
      return { success: true, count: updated.length, devices: updated };
    }

    // Payment
    if (endpoint.includes('/payment')) {
      const imei = endpoint.split('/')[2];
      const dev = Object.values(store.devices).find(d => d.imei === imei || d.id === imei);
      if (dev) {
        dev.status = 'UNLOCKED';
        if (dev.financing) {
          dev.financing.totalPaid = (dev.financing.totalPaid || 0) + (parseFloat(body.amount) || 45);
          dev.financing.dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        }
        dev.history = dev.history || [];
        dev.history.unshift({
          date: new Date().toISOString().split('T')[0],
          amount: parseFloat(body.amount) || 45,
          status: 'Paid',
          txId: `TX-${Date.now().toString().slice(-6)}`,
          note: body.note || 'Online Payment'
        });
        saveLocalStore(store);
        return { success: true, updatedDevice: dev };
      }
    }

    // Policies
    if (endpoint === '/policies' && method === 'GET') {
      return { success: true, count: Object.keys(store.policies).length, policies: Object.values(store.policies) };
    }
    if (endpoint === '/policies' && method === 'POST') {
      const id = body.id || `policy_${Date.now()}`;
      store.policies[id] = { ...body, id, version: (store.policies[id]?.version || 0) + 1, updatedAt: new Date().toISOString() };
      saveLocalStore(store);
      return { success: true, policy: store.policies[id] };
    }
    if (endpoint.startsWith('/policies/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      delete store.policies[id];
      saveLocalStore(store);
      return { success: true };
    }

    // Apps
    if (endpoint === '/apps' && method === 'GET') {
      return { success: true, count: Object.keys(store.appRepository).length, apps: Object.values(store.appRepository) };
    }
    if (endpoint === '/apps' && method === 'POST') {
      const id = body.id || `app_${Date.now()}`;
      store.appRepository[id] = { ...body, id, updatedAt: new Date().toISOString().split('T')[0] };
      saveLocalStore(store);
      return { success: true, app: store.appRepository[id] };
    }
    if (endpoint.startsWith('/apps/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      delete store.appRepository[id];
      saveLocalStore(store);
      return { success: true };
    }

    // Enrollment Profile
    if (endpoint === '/enrollment/profile' && method === 'GET') {
      const profile = store.enrollmentProfiles['default'];
      const qrPayload = {
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": profile.adminComponent,
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": profile.apkUrl,
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": profile.checksum,
        "android.app.extra.PROVISIONING_WIFI_SSID": profile.wifiSsid,
        "android.app.extra.PROVISIONING_WIFI_PASSWORD": profile.wifiPassword,
        "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
          "server_url": profile.serverUrl,
          "enrollment_token": profile.enrollmentToken,
          "default_policy_id": profile.defaultPolicyId
        }
      };
      return { success: true, profile, qrPayload };
    }
    if (endpoint === '/enrollment/profile' && method === 'POST') {
      store.enrollmentProfiles['default'] = { ...store.enrollmentProfiles['default'], ...body, updatedAt: new Date().toISOString() };
      saveLocalStore(store);
      return { success: true, profile: store.enrollmentProfiles['default'] };
    }

    // Logs
    if (endpoint === '/logs') {
      return { success: true, count: store.auditLogs.length, logs: store.auditLogs };
    }

    // Backup & Restore
    if (endpoint === '/backup/export') {
      return { exportedAt: new Date().toISOString(), version: '2.4.0', data: store };
    }
    if (endpoint === '/backup/import') {
      if (body.data) {
        saveLocalStore(body.data);
        return { success: true, result: { devicesCount: Object.keys(body.data.devices || {}).length, policiesCount: Object.keys(body.data.policies || {}).length } };
      }
    }

    return { success: true };
  }

  // --- Auth ---
  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  async getHealth() {
    return this.request('/health');
  }

  // --- Devices & Telemetry ---
  async getDevices() {
    const res = await this.request('/devices');
    return res.devices || [];
  }

  async getDevice(imei) {
    const res = await this.request(`/devices/${imei}`);
    return res.device;
  }

  async registerDevice(deviceData) {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData)
    });
  }

  // --- Remote MDM Commands ---
  async sendCommand(imei, command, extra = {}) {
    return this.request(`/devices/${imei}/command`, {
      method: 'POST',
      body: JSON.stringify({ command, ...extra })
    });
  }

  async forceSync(imei) {
    return this.sendCommand(imei, 'SYNC');
  }

  async pingDevice(imei) {
    return this.sendCommand(imei, 'PING');
  }

  async lockDevice(imei, reason = 'Administrative Policy Lockdown') {
    return this.sendCommand(imei, 'LOCK', { reason });
  }

  async unlockDevice(imei, daysExtension = 30) {
    return this.sendCommand(imei, 'UNLOCK', { daysExtension });
  }

  async resetPassword(imei, newPassword) {
    return this.sendCommand(imei, 'RESET_PASSWORD', { newPassword });
  }

  async silentInstall(imei, packageId) {
    return this.sendCommand(imei, 'INSTALL_APP', { packageId });
  }

  async wipeDevice(imei) {
    return this.sendCommand(imei, 'WIPE');
  }

  async rebootDevice(imei) {
    return this.sendCommand(imei, 'REBOOT');
  }

  async releaseDevice(imei) {
    return this.sendCommand(imei, 'RELEASE');
  }

  async recordPayment(imei, amount, note) {
    return this.request(`/devices/${imei}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount, note })
    });
  }

  async bulkAssignPolicy(deviceIds, policyId) {
    return this.request('/devices/bulk-policy', {
      method: 'POST',
      body: JSON.stringify({ deviceIds, policyId })
    });
  }

  // --- Policy Profiles ---
  async getPolicies() {
    const res = await this.request('/policies');
    return res.policies || [];
  }

  async getPolicy(id) {
    const res = await this.request(`/policies/${id}`);
    return res.policy;
  }

  async savePolicy(policyData) {
    return this.request('/policies', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async deletePolicy(id) {
    return this.request(`/policies/${id}`, {
      method: 'DELETE'
    });
  }

  async getPolicyConfigJson(id) {
    try {
      const res = await fetch(`${BASE_URL}/policies/${id}/config.json`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalStore();
    const pol = store.policies[id];
    return pol || {};
  }

  // --- App Repository ---
  async getApps() {
    const res = await this.request('/apps');
    return res.apps || [];
  }

  async saveApp(appData) {
    return this.request('/apps', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  }

  async deleteApp(id) {
    return this.request(`/apps/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Enrollment & QR Center ---
  async getEnrollmentProfile() {
    return this.request('/enrollment/profile');
  }

  async saveEnrollmentProfile(profileData) {
    return this.request('/enrollment/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // --- Audit Logs ---
  async getAuditLogs() {
    const res = await this.request('/logs');
    return res.logs || [];
  }

  // --- Permanent Backup & Restore ---
  async exportBackup() {
    return this.request('/backup/export');
  }

  async importBackup(backupPayload) {
    return this.request('/backup/import', {
      method: 'POST',
      body: JSON.stringify(backupPayload)
    });
  }

  // Live SSE stream for virtual device simulator
  createSimulatorEventSource() {
    try {
      return new EventSource(`${BASE_URL}/simulator/events`);
    } catch (e) {
      return null;
    }
  }
}

export const api = new ApiService();
