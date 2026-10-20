import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';
import { darkTheme } from './theme/muiTheme';
import { api } from './services/api';

import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import DeviceTable from './components/DeviceTable';
import DeviceDetailModal from './components/DeviceDetailModal';
import VirtualDeviceSimulator from './components/VirtualDeviceSimulator';
import AuditLogDrawer from './components/AuditLogDrawer';
import EnrollDeviceModal from './components/EnrollDeviceModal';
import LoginScreen from './components/LoginScreen';
import EnrollmentCenter from './components/EnrollmentCenter';
import PolicyEditor from './components/PolicyEditor';
import AppRepositoryView from './components/AppRepositoryView';
import BackupPersistenceCenter from './components/BackupPersistenceCenter';

export default function App() {
  const [auth, setAuth] = useState(() => api.getAuth());
  const [serverStatus, setServerStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('FLEET'); // FLEET, POLICIES, ENROLLMENT, APPS, BACKUP

  // Data State
  const [devices, setDevices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [apps, setApps] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loadingDevices, setLoadingDevices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selected device for Detail Modal
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);
  const [simulatedImei, setSimulatedImei] = useState(null);

  // Modals & Drawers
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Action Loading
  const [actionLoadingImei, setActionLoadingImei] = useState(null);
  const [actionLoadingType, setActionLoadingType] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Fetch Fleet Devices & Policies from Backend
  const fetchAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingDevices(true);
    setRefreshing(true);
    try {
      const [devList, polList, appList] = await Promise.all([
        api.getDevices(),
        api.getPolicies(),
        api.getApps()
      ]);
      setDevices(devList);
      setPolicies(polList);
      setApps(appList);

      // Default simulator device
      if (devList.length > 0 && !simulatedImei) {
        setSimulatedImei(devList[0].imei);
      }
      if (selectedDevice) {
        const updated = devList.find(d => d.imei === selectedDevice.imei);
        if (updated) setSelectedDevice(updated);
      }
    } catch (err) {
      console.error('Failed to sync data:', err);
      showToast('Error syncing fleet data: ' + err.message, 'error');
    } finally {
      setLoadingDevices(false);
      setRefreshing(false);
    }
  }, [simulatedImei, selectedDevice]);

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Initial load
  useEffect(() => {
    api.getHealth()
      .then(res => setServerStatus(res))
      .catch(e => console.warn('Server health:', e));
  }, []);

  useEffect(() => {
    if (auth.token) {
      fetchAllData();
      fetchAuditLogs();
    }
  }, [auth.token]);

  const handleLoginSuccess = (token, user) => {
    api.setAuth(token, user);
    setAuth({ token, user });
    showToast(`Authenticated as ${user.displayName || user.email}`, 'success');
  };

  const handleLogout = () => {
    api.logout();
    setAuth({ token: null, user: null });
    showToast('Signed out of MDM console', 'info');
  };

  // MDM Remote Action Handler
  const handleMdmAction = async (imei, command, extra = {}) => {
    setActionLoadingImei(imei);
    setActionLoadingType(command);

    try {
      let toastMsg = '';

      switch (command) {
        case 'SYNC':
          await api.forceSync(imei);
          toastMsg = `Force Telemetry Sync dispatched to ${imei}`;
          break;
        case 'PING':
          await api.pingDevice(imei);
          toastMsg = `Ping heartbeat acknowledged for ${imei}`;
          break;
        case 'LOCK':
          await api.lockDevice(imei, extra.reason || 'Administrative Lockdown');
          toastMsg = `Device ${imei} LOCKED. FCM lockdown message sent.`;
          break;
        case 'UNLOCK':
          await api.unlockDevice(imei, extra.daysExtension || 30);
          toastMsg = `Device ${imei} UNLOCKED. Policy extended.`;
          break;
        case 'RESET_PASSWORD':
          await api.resetPassword(imei, extra.newPassword);
          toastMsg = `New screen lock passcode enforced on ${imei}!`;
          break;
        case 'INSTALL_APP':
          await api.silentInstall(imei, extra.packageId);
          toastMsg = `Silent app install session started on ${imei}!`;
          break;
        case 'WIPE':
          await api.wipeDevice(imei);
          toastMsg = `FACTORY RESET (WIPE) payload sent to ${imei}!`;
          break;
        case 'REBOOT':
          await api.rebootDevice(imei);
          toastMsg = `Remote reboot initiated on ${imei}`;
          break;
        case 'RELEASE':
          await api.releaseDevice(imei);
          toastMsg = `Device ${imei} permanently released from kiosk control!`;
          break;
        default:
          throw new Error('Unknown command ' + command);
      }

      showToast(toastMsg, 'success');
      await fetchAllData(true);
      await fetchAuditLogs();
    } catch (err) {
      console.error(err);
      showToast(`Action ${command} failed: ${err.message}`, 'error');
    } finally {
      setActionLoadingImei(null);
      setActionLoadingType(null);
    }
  };

  // Bulk Policy Deployment
  const handleBulkPolicyDeploy = async (deviceIds, policyId) => {
    try {
      await api.bulkAssignPolicy(deviceIds, policyId);
      showToast(`Policy successfully assigned to ${deviceIds.length} handsets!`, 'success');
      await fetchAllData(true);
      await fetchAuditLogs();
    } catch (err) {
      showToast('Bulk policy deployment failed: ' + err.message, 'error');
    }
  };

  // Payment Recording
  const handleRecordPayment = async (imei, amount, note) => {
    try {
      await api.recordPayment(imei, amount, note);
      showToast(`Payment of $${amount} recorded for device ${imei}!`, 'success');
      await fetchAllData(true);
      await fetchAuditLogs();
    } catch (err) {
      showToast('Payment processing error: ' + err.message, 'error');
      throw err;
    }
  };

  // Device Enrollment
  const handleEnrollDevice = async (formData) => {
    try {
      await api.registerDevice(formData);
      showToast(`Device ${formData.imei} enrolled successfully in persistent cloud storage!`, 'success');
      await fetchAllData(true);
    } catch (err) {
      showToast('Enrollment failed: ' + err.message, 'error');
      throw err;
    }
  };

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setIsDetailOpen(true);
  };

  const handleSimulateDevice = (device) => {
    setSimulatedImei(device.imei);
    setIsSimulatorOpen(true);
  };

  if (!auth.token) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
        {/* Navigation Bar */}
        <Navbar
          serverStatus={serverStatus}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={() => fetchAllData(false)}
          isRefreshing={refreshing}
          onOpenEnroll={() => setIsEnrollOpen(true)}
          onOpenLogs={() => {
            fetchAuditLogs();
            setIsLogsOpen(true);
          }}
          isSimulatorOpen={isSimulatorOpen}
          onToggleSimulator={() => setIsSimulatorOpen(prev => !prev)}
          user={auth.user}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* TAB 1: FLEET TELEMETRY DASHBOARD */}
          {activeTab === 'FLEET' && (
            <div className="space-y-6">
              <StatsCards devices={devices} />

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className={`w-full ${isSimulatorOpen ? 'lg:w-[calc(100%-360px)]' : 'lg:w-full'} transition-all duration-300`}>
                  <DeviceTable
                    devices={devices}
                    policies={policies}
                    apps={apps}
                    onSelectDevice={handleSelectDevice}
                    onAction={handleMdmAction}
                    onSimulateDevice={handleSimulateDevice}
                    onBulkPolicy={handleBulkPolicyDeploy}
                    actionLoadingImei={actionLoadingImei}
                    actionLoadingType={actionLoadingType}
                  />
                </div>

                {isSimulatorOpen && (
                  <div className="w-full lg:w-[340px] flex-shrink-0 sticky top-24">
                    <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl">
                      <VirtualDeviceSimulator
                        devices={devices}
                        selectedImei={simulatedImei}
                        onSelectImei={(imei) => setSimulatedImei(imei)}
                        onClose={() => setIsSimulatorOpen(false)}
                        onAction={handleMdmAction}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADVANCED POLICY PROFILE BUILDER */}
          {activeTab === 'POLICIES' && (
            <PolicyEditor api={api} onShowToast={showToast} />
          )}

          {/* TAB 3: ANDROID ENTERPRISE ENROLLMENT & QR CODE CENTER */}
          {activeTab === 'ENROLLMENT' && (
            <EnrollmentCenter api={api} onShowToast={showToast} />
          )}

          {/* TAB 4: ENTERPRISE APP REPOSITORY */}
          {activeTab === 'APPS' && (
            <AppRepositoryView api={api} onShowToast={showToast} />
          )}

          {/* TAB 5: PERSISTENCE & CLOUD BACKUP CENTER */}
          {activeTab === 'BACKUP' && (
            <BackupPersistenceCenter
              api={api}
              devices={devices}
              onShowToast={showToast}
              onRefreshData={() => fetchAllData(false)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              ApexMDM Enterprise Control Platform • Multi-Tier Storage (Disk + Firebase Firestore/RTDB + LocalStorage)
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-[11px] text-cyan-400">Node.js Express API :5001</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-emerald-400">React + Vite + MUI :5173</span>
            </div>
          </div>
        </footer>

        {/* Modals & Drawers */}
        <DeviceDetailModal
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          device={selectedDevice}
          onAction={handleMdmAction}
          onRecordPayment={handleRecordPayment}
          actionLoadingImei={actionLoadingImei}
          actionLoadingType={actionLoadingType}
        />

        <AuditLogDrawer
          open={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          logs={auditLogs}
          onRefresh={fetchAuditLogs}
          loading={loadingLogs}
        />

        <EnrollDeviceModal
          open={isEnrollOpen}
          onClose={() => setIsEnrollOpen(false)}
          onEnroll={handleEnrollDevice}
        />

        {/* Notification Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            variant="filled"
            sx={{
              width: '100%',
              bgcolor: toast.severity === 'error' ? '#be123c' : toast.severity === 'info' ? '#0369a1' : '#059669',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}
