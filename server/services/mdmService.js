const persistence = require('./persistenceService');
const { messaging } = require('../config/firebase');

/**
 * Enterprise MDM Service:
 * Handles device state mutation, remote commands, policy deployments, and FCM messaging
 */
class MdmService {
  async getAllDevices() {
    return persistence.getAllDevices();
  }

  async getDevice(idOrImei) {
    return persistence.getDevice(idOrImei);
  }

  async dispatchFcmDataMessage(fcmToken, dataPayload) {
    const sanitizedData = {};
    for (const [key, value] of Object.entries(dataPayload)) {
      sanitizedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }

    const message = {
      token: fcmToken,
      data: sanitizedData,
      android: {
        priority: 'high',
        ttl: 86400
      }
    };

    try {
      const messageId = await messaging.send(message);
      return { success: true, messageId };
    } catch (error) {
      console.error(`[FCM-ERROR] Failed to send message to ${fcmToken}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async logAction({ imei, command, payload, result, user = 'admin' }) {
    return persistence.addAuditLog({
      imei,
      command,
      payload,
      fcmMessageId: result?.messageId || null,
      status: result?.success ? 'DELIVERED' : 'FAILED',
      errorMessage: result?.error || null,
      dispatchedBy: user?.email || user?.uid || 'Apex MDM Admin'
    });
  }

  // --- Remote MDM Commands ---

  async forceSync(imei, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const nowIso = new Date().toISOString();
    const payload = {
      dlcCommand: 'SYNC',
      imei: String(device.imei),
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);
    device.lastSyncTime = nowIso;
    persistence.saveDevice(device);

    const audit = await this.logAction({ imei: device.imei, command: 'SYNC', payload, result: fcmResult, user });
    return { success: fcmResult.success, command: 'SYNC', imei: device.imei, fcmResult, audit };
  }

  async pingDevice(imei, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const nowIso = new Date().toISOString();
    const payload = {
      dlcCommand: 'PING',
      imei: String(device.imei),
      timestamp: nowIso,
      pingNonce: Math.random().toString(36).substring(2, 9)
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);
    const audit = await this.logAction({ imei: device.imei, command: 'PING', payload, result: fcmResult, user });
    return { success: fcmResult.success, command: 'PING', imei: device.imei, fcmResult, audit };
  }

  async lockDevice(imei, reason = 'Administrative Policy Lockdown', user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const now = new Date();
    const pastDueDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nowIso = now.toISOString();

    device.status = 'LOCKED';
    if (device.financing) {
      device.financing.dueDate = pastDueDate;
    }
    device.lastSyncTime = nowIso;
    persistence.saveDevice(device);

    const payload = {
      dlcCommand: 'LOCK',
      imei: String(device.imei),
      dueDate: String(pastDueDate),
      status: 'LOCKED',
      reason: String(reason),
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);
    const audit = await this.logAction({ imei: device.imei, command: 'LOCK', payload, result: fcmResult, user });
    return { success: fcmResult.success, command: 'LOCK', imei: device.imei, status: 'LOCKED', fcmResult, audit };
  }

  async unlockDevice(imei, daysExtension = 30, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const now = new Date();
    const futureDueDate = new Date(now.getTime() + daysExtension * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nowIso = now.toISOString();

    device.status = 'UNLOCKED';
    if (device.financing) {
      device.financing.dueDate = futureDueDate;
    }
    device.lastSyncTime = nowIso;
    persistence.saveDevice(device);

    const payload = {
      dlcCommand: 'UNLOCK',
      imei: String(device.imei),
      dueDate: String(futureDueDate),
      status: 'UNLOCKED',
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);
    const audit = await this.logAction({ imei: device.imei, command: 'UNLOCK', payload, result: fcmResult, user });
    return { success: fcmResult.success, command: 'UNLOCK', imei: device.imei, status: 'UNLOCKED', fcmResult, audit };
  }

  async resetLockPassword(imei, newPassword, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const nowIso = new Date().toISOString();
    const payload = {
      dlcCommand: 'RESET_PASSWORD',
      imei: String(device.imei),
      newPassword: String(newPassword),
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);
    device.lockScreenPasswordSet = true;
    device.lastSyncTime = nowIso;
    persistence.saveDevice(device);

    const audit = await this.logAction({
      imei: device.imei,
      command: 'RESET_PASSWORD',
      payload: { ...payload, newPassword: '***[PROTECTED]***' },
      result: fcmResult,
      user
    });

    return { success: fcmResult.success, command: 'RESET_PASSWORD', imei: device.imei, fcmResult, audit };
  }

  async silentInstallApp(imei, appOrPackageId, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    let app = persistence.getAllApps().find(a => a.id === appOrPackageId || a.packageName === appOrPackageId);
    if (!app && typeof appOrPackageId === 'object') {
      app = appOrPackageId;
    }
    if (!app) throw new Error(`Application ${appOrPackageId} not found in enterprise repository`);

    const nowIso = new Date().toISOString();
    const payload = {
      dlcCommand: 'INSTALL_APP',
      imei: String(device.imei),
      packageName: app.packageName,
      apkUrl: app.downloadUrl,
      checksum: app.checksum,
      version: app.version,
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);

    // Update device installed apps list
    if (!device.installedApps) device.installedApps = [];
    const exists = device.installedApps.find(a => a.packageName === app.packageName);
    if (exists) {
      exists.version = app.version;
      exists.installDate = nowIso.split('T')[0];
    } else {
      device.installedApps.push({
        packageName: app.packageName,
        name: app.name,
        version: app.version,
        installDate: nowIso.split('T')[0]
      });
    }
    device.lastSyncTime = nowIso;
    persistence.saveDevice(device);

    const audit = await this.logAction({
      imei: device.imei,
      command: 'INSTALL_APP',
      payload,
      result: fcmResult,
      user
    });

    return { success: fcmResult.success, command: 'INSTALL_APP', app: app.name, imei: device.imei, fcmResult, audit };
  }

  async wipeDevice(imei, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const nowIso = new Date().toISOString();
    const payload = {
      dlcCommand: 'WIPE',
      imei: String(device.imei),
      action: 'FACTORY_RESET_ALL',
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);

    device.status = 'WIPED';
    device.lastSyncTime = nowIso;
    persistence.saveDevice(device);

    const audit = await this.logAction({
      imei: device.imei,
      command: 'WIPE',
      payload,
      result: fcmResult,
      user
    });

    return { success: fcmResult.success, command: 'WIPE', imei: device.imei, status: 'WIPED', fcmResult, audit };
  }

  async rebootDevice(imei, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const nowIso = new Date().toISOString();
    const payload = {
      dlcCommand: 'REBOOT',
      imei: String(device.imei),
      timestamp: nowIso
    };

    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, payload);
    const audit = await this.logAction({ imei: device.imei, command: 'REBOOT', payload, result: fcmResult, user });
    return { success: fcmResult.success, command: 'REBOOT', imei: device.imei, fcmResult, audit };
  }

  async bulkAssignPolicy(deviceIds, policyId, user) {
    const updatedDevices = persistence.bulkAssignPolicy(deviceIds, policyId);
    const policy = persistence.getPolicy(policyId);

    // Push policy update to all affected devices
    for (const dev of updatedDevices) {
      if (dev.fcmToken) {
        const payload = {
          dlcCommand: 'APPLY_POLICY',
          policyId,
          policyVersion: String(policy.version),
          policyConfigUrl: `http://localhost:5001/api/policies/${policyId}/config.json`,
          timestamp: new Date().toISOString()
        };
        await this.dispatchFcmDataMessage(dev.fcmToken, payload);
      }
    }

    await persistence.addAuditLog({
      command: 'BULK_APPLY_POLICY',
      payload: { policyId, policyName: policy.name, affectedDeviceCount: deviceIds.length },
      dispatchedBy: user?.email || 'Apex MDM Admin'
    });

    return updatedDevices;
  }

  async processPayment(imei, amount, note, user) {
    const device = await this.getDevice(imei);
    if (!device) throw new Error(`Device ${imei} not found`);

    const paidAmount = parseFloat(amount) || 45.00;
    if (!device.financing) device.financing = { totalAmount: 400, totalPaid: 0, monthlyPayment: 45 };

    device.financing.totalPaid = (device.financing.totalPaid || 0) + paidAmount;
    const now = new Date();
    const newDueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    device.financing.dueDate = newDueDate;
    device.status = 'UNLOCKED';
    device.lastSyncTime = now.toISOString();

    if (!device.history) device.history = [];
    device.history.unshift({
      date: now.toISOString().split('T')[0],
      amount: paidAmount,
      status: 'Paid',
      txId: `TX-${Date.now().toString().slice(-6)}`,
      note: note || 'Installment Payment'
    });

    persistence.saveDevice(device);

    // Send UNLOCK FCM command
    const fcmResult = await this.dispatchFcmDataMessage(device.fcmToken, {
      dlcCommand: 'UNLOCK',
      imei: String(device.imei),
      dueDate: String(newDueDate),
      status: 'UNLOCKED'
    });

    return { success: true, imei: device.imei, newDueDate, fcmResult };
  }
}

module.exports = new MdmService();
