import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Radio,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Battery,
  BatteryCharging,
  Wifi,
  HardDrive,
  KeyRound,
  Download,
  RotateCw,
  Smartphone,
  Layers,
  ShieldAlert,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export default function DeviceTable({
  devices = [],
  policies = [],
  apps = [],
  onSelectDevice,
  onAction,
  onSimulateDevice,
  onBulkPolicy,
  actionLoadingImei,
  actionLoadingType
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibleFcmImeis, setVisibleFcmImeis] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Multi-Selection State for Bulk Actions
  const [selectedImeis, setSelectedImeis] = useState([]);
  const [bulkPolicyDialogOpen, setBulkPolicyDialogOpen] = useState(false);
  const [selectedBulkPolicyId, setSelectedBulkPolicyId] = useState('');

  // Remote Action Modals State
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [targetPasswordImei, setTargetPasswordImei] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('889922');

  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [targetInstallImei, setTargetInstallImei] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState('');

  const [wipeDialogOpen, setWipeDialogOpen] = useState(false);
  const [targetWipeImei, setTargetWipeImei] = useState(null);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');

  // Installed Apps Viewer Modal
  const [appsViewDialogOpen, setAppsViewDialogOpen] = useState(false);
  const [viewingDeviceApps, setViewingDeviceApps] = useState(null);

  // Filter devices
  const filteredDevices = devices.filter((device) => {
    const matchesFilter = statusFilter === 'ALL' || device.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesFilter;

    const imei = String(device.imei || '').toLowerCase();
    const serial = String(device.serialNumber || '').toLowerCase();
    const name = String(device.name || '').toLowerCase();
    const customer = String(device.customer?.name || '').toLowerCase();
    const model = String(device.hardware?.model || '').toLowerCase();
    const wifi = String(device.network?.wifiSsid || '').toLowerCase();

    return matchesFilter && (
      imei.includes(term) ||
      serial.includes(term) ||
      name.includes(term) ||
      customer.includes(term) ||
      model.includes(term) ||
      wifi.includes(term)
    );
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedImeis(filteredDevices.map(d => d.imei));
    } else {
      setSelectedImeis([]);
    }
  };

  const handleToggleSelectOne = (imei) => {
    setSelectedImeis(prev =>
      prev.includes(imei) ? prev.filter(i => i !== imei) : [...prev, imei]
    );
  };

  const copyToClipboard = (text, key, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleFcmVisibility = (imei, e) => {
    e.stopPropagation();
    setVisibleFcmImeis(prev => ({ ...prev, [imei]: !prev[imei] }));
  };

  // Trigger Bulk Policy
  const handleConfirmBulkPolicy = () => {
    if (!selectedBulkPolicyId || selectedImeis.length === 0) return;
    onBulkPolicy(selectedImeis, selectedBulkPolicyId);
    setBulkPolicyDialogOpen(false);
    setSelectedImeis([]);
  };

  // Password reset action
  const handleOpenPasswordDialog = (imei, e) => {
    e.stopPropagation();
    setTargetPasswordImei(imei);
    setNewPasswordValue('889922');
    setPasswordDialogOpen(true);
  };

  const handleConfirmResetPassword = () => {
    if (!targetPasswordImei || !newPasswordValue) return;
    onAction(targetPasswordImei, 'RESET_PASSWORD', { newPassword: newPasswordValue });
    setPasswordDialogOpen(false);
  };

  // Silent install action
  const handleOpenInstallDialog = (imei, e) => {
    e.stopPropagation();
    setTargetInstallImei(imei);
    if (apps.length > 0) setSelectedAppId(apps[0].id);
    setInstallDialogOpen(true);
  };

  const handleConfirmSilentInstall = () => {
    if (!targetInstallImei || !selectedAppId) return;
    onAction(targetInstallImei, 'INSTALL_APP', { packageId: selectedAppId });
    setInstallDialogOpen(false);
  };

  // Wipe device action
  const handleOpenWipeDialog = (imei, e) => {
    e.stopPropagation();
    setTargetWipeImei(imei);
    setWipeConfirmInput('');
    setWipeDialogOpen(true);
  };

  const handleConfirmWipe = () => {
    if (wipeConfirmInput !== 'WIPE' || !targetWipeImei) return;
    onAction(targetWipeImei, 'WIPE');
    setWipeDialogOpen(false);
  };

  // Installed apps viewer
  const handleOpenAppsViewer = (device, e) => {
    e.stopPropagation();
    setViewingDeviceApps(device);
    setAppsViewDialogOpen(true);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-2xl relative">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Enrolled Fleet & Live Telemetry</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              {filteredDevices.length} of {devices.length} Devices Online
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime battery, storage, Wi-Fi connectivity, and remote Device Owner controls
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            {['ALL', 'UNLOCKED', 'LOCKED', 'RELEASED'].map((filter) => {
              const active = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    active
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'ALL' ? 'All' : filter}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Serial, IMEI, Model, Wi-Fi..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar when items selected */}
      {selectedImeis.length > 0 && (
        <div className="p-3 bg-indigo-950/90 border-b border-indigo-800 flex items-center justify-between px-6 animate-fade-in">
          <div className="flex items-center space-x-2 text-xs font-bold text-white">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white">
              {selectedImeis.length} Selected
            </span>
            <span>Batch Fleet Operations</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                if (policies.length > 0) setSelectedBulkPolicyId(policies[0].id);
                setBulkPolicyDialogOpen(true);
              }}
              startIcon={<Layers className="w-3.5 h-3.5" />}
              sx={{ bgcolor: '#4f46e5', fontSize: '0.75rem', '&:hover': { bgcolor: '#4338ca' } }}
            >
              Assign Policy Profile
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                selectedImeis.forEach(imei => onAction(imei, 'LOCK'));
                setSelectedImeis([]);
              }}
              startIcon={<Lock className="w-3.5 h-3.5" />}
              sx={{ borderColor: '#f43f5e', color: '#fda4af', fontSize: '0.75rem' }}
            >
              Bulk Lock
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                selectedImeis.forEach(imei => onAction(imei, 'SYNC'));
                setSelectedImeis([]);
              }}
              startIcon={<RefreshCw className="w-3.5 h-3.5" />}
              sx={{ borderColor: '#38bdf8', color: '#38bdf8', fontSize: '0.75rem' }}
            >
              Bulk Sync
            </Button>

            <button
              onClick={() => setSelectedImeis([])}
              className="text-xs text-slate-400 hover:text-white underline pl-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#060a12' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={filteredDevices.length > 0 && selectedImeis.length === filteredDevices.length}
                  indeterminate={selectedImeis.length > 0 && selectedImeis.length < filteredDevices.length}
                  onChange={handleSelectAll}
                  sx={{ color: '#64748b', '&.Mui-checked': { color: '#06b6d4' } }}
                />
              </TableCell>
              <TableCell>Handset & Serial (Primary Key)</TableCell>
              <TableCell>Battery & Health</TableCell>
              <TableCell>Storage</TableCell>
              <TableCell>Active Network</TableCell>
              <TableCell>Policy Profile</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Remote MDM Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDevices.map((device) => {
              const isSelected = selectedImeis.includes(device.imei);
              const isFcmShown = visibleFcmImeis[device.imei];
              const hw = device.hardware || {};
              const net = device.network || {};
              const battery = hw.batteryLevel || 85;
              const storageUsed = hw.storageUsedGb || 24;
              const storageTotal = hw.storageTotalGb || 128;
              const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

              const assignedPolicy = policies.find(p => p.id === device.policyId) || { name: 'Kiosk Retail' };

              return (
                <TableRow
                  key={device.imei}
                  hover
                  selected={isSelected}
                  onClick={() => onSelectDevice(device)}
                  className="cursor-pointer transition-colors group"
                  sx={{
                    '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.4) !important' }
                  }}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(device.imei)}
                      sx={{ color: '#475569', '&.Mui-checked': { color: '#06b6d4' } }}
                    />
                  </TableCell>

                  {/* Device Serial & Model */}
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-xs font-bold text-white">
                            {device.serialNumber || device.imei}
                          </span>
                          <Tooltip title={copiedKey === device.imei ? 'Copied!' : 'Copy Serial/IMEI'}>
                            <button
                              onClick={(e) => copyToClipboard(device.imei, device.imei, e)}
                              className="text-slate-500 hover:text-cyan-400"
                            >
                              {copiedKey === device.imei ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </Tooltip>
                        </div>
                        <p className="text-xs text-slate-400">
                          {hw.brand} {hw.model} • <span className="text-slate-300">{hw.androidVersion}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Battery & Health */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {hw.isCharging ? (
                        <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
                      ) : (
                        <Battery className={`w-4 h-4 ${battery < 25 ? 'text-rose-400' : battery < 60 ? 'text-amber-400' : 'text-emerald-400'}`} />
                      )}
                      <span className="font-mono text-xs font-bold text-white">{battery}%</span>
                      {hw.isCharging && (
                        <span className="text-[10px] text-emerald-400 font-semibold">(AC)</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Storage Bar */}
                  <TableCell>
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-300">
                        <span>{storageUsed} GB</span>
                        <span className="text-slate-500">{storageTotal} GB</span>
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={storagePercent}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: 'rgba(30, 41, 59, 0.8)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: storagePercent > 85 ? '#f43f5e' : '#06b6d4'
                          }
                        }}
                      />
                    </div>
                  </TableCell>

                  {/* Network / Active Wi-Fi */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-cyan-400" />
                        {net.wifiSsid || 'Cellular 5G'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {net.ipAddress || '192.168.1.1'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Assigned Policy Profile */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {assignedPolicy.name}
                    </span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    {device.status === 'LOCKED' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>LOCKED</span>
                      </span>
                    )}
                    {device.status === 'UNLOCKED' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>UNLOCKED</span>
                      </span>
                    )}
                    {device.status === 'RELEASED' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                        <span>RELEASED</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Remote Action Controls */}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      {/* Force Sync */}
                      <Tooltip title="Force Telemetry Sync">
                        <IconButton
                          size="small"
                          onClick={() => onAction(device.imei, 'SYNC')}
                          sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' } }}
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        </IconButton>
                      </Tooltip>

                      {/* Ping */}
                      <Tooltip title="Ping Heartbeat">
                        <IconButton
                          size="small"
                          onClick={() => onAction(device.imei, 'PING')}
                          sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' } }}
                        >
                          <Radio className="w-3.5 h-3.5 text-indigo-400" />
                        </IconButton>
                      </Tooltip>

                      {/* Lock / Unlock Toggle */}
                      {device.status === 'LOCKED' ? (
                        <Tooltip title="Unlock Handset">
                          <IconButton
                            size="small"
                            onClick={() => onAction(device.imei, 'UNLOCK')}
                            sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' } }}
                          >
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Lock Device">
                          <IconButton
                            size="small"
                            onClick={() => onAction(device.imei, 'LOCK')}
                            sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' } }}
                          >
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Reset Password */}
                      <Tooltip title="Reset Screen Lock Passcode">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenPasswordDialog(device.imei, e)}
                          sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' } }}
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        </IconButton>
                      </Tooltip>

                      {/* Silent Install App */}
                      <Tooltip title="Push Silent App Install">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenInstallDialog(device.imei, e)}
                          sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' } }}
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                        </IconButton>
                      </Tooltip>

                      {/* Wipe Device */}
                      <Tooltip title="Remote Wipe (Factory Reset)">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenWipeDialog(device.imei, e)}
                          sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.2)', color: '#f43f5e' } }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </IconButton>
                      </Tooltip>

                      {/* View Installed Apps List */}
                      <Tooltip title="Inspect Installed Apps">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenAppsViewer(device, e)}
                          sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', '&:hover': { bgcolor: 'rgba(147, 51, 234, 0.2)', color: '#c084fc' } }}
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG: Bulk Assign Policy */}
      <Dialog
        open={bulkPolicyDialogOpen}
        onClose={() => setBulkPolicyDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>
          Bulk Deploy Policy Profile
        </DialogTitle>
        <DialogContent className="space-y-3 pt-2">
          <p className="text-xs text-slate-300">
            Apply a policy profile to <strong className="text-cyan-400">{selectedImeis.length} selected devices</strong>. The policy will be dispatched over FCM immediately.
          </p>

          <TextField
            select
            fullWidth
            size="small"
            label="Select Policy Profile"
            value={selectedBulkPolicyId}
            onChange={(e) => setSelectedBulkPolicyId(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
          >
            {policies.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} ({p.kioskMode})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkPolicyDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmBulkPolicy} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}>
            Deploy Policy
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: Reset Passcode */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyRound className="w-5 h-5" />
          Reset Screen Lock Passcode
        </DialogTitle>
        <DialogContent className="space-y-3 pt-2">
          <p className="text-xs text-slate-300">
            Set a new device screen PIN/password remotely on <strong className="font-mono text-white">{targetPasswordImei}</strong> via <code>DevicePolicyManager.resetPassword()</code>.
          </p>
          <TextField
            fullWidth
            label="New Passcode / PIN"
            size="small"
            value={newPasswordValue}
            onChange={(e) => setNewPasswordValue(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmResetPassword} sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}>
            Enforce New PIN
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: Silent App Install */}
      <Dialog
        open={installDialogOpen}
        onClose={() => setInstallDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download className="w-5 h-5 text-emerald-400" />
          Silent Background App Install
        </DialogTitle>
        <DialogContent className="space-y-3 pt-2">
          <p className="text-xs text-slate-300">
            Dispatch APK from enterprise repository to target device <strong className="font-mono text-white">{targetInstallImei}</strong>.
          </p>
          <TextField
            select
            fullWidth
            size="small"
            label="Select Corporate APK"
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
          >
            {apps.map(a => (
              <MenuItem key={a.id} value={a.id}>
                {a.name} (v{a.version})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInstallDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmSilentInstall} sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
            Start Silent Install
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: Wipe Device */}
      <Dialog
        open={wipeDialogOpen}
        onClose={() => setWipeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0f172a', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ color: '#fda4af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertOctagon className="w-5 h-5 text-rose-500" />
          Confirm Remote Factory Reset (Wipe)?
        </DialogTitle>
        <DialogContent className="space-y-3">
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-900 text-xs text-rose-200">
            <strong>DANGER:</strong> This command sends <code>{"{ dlcCommand: 'WIPE' }"}</code> which permanently erases all device partitions, accounts, and private data.
          </div>
          <p className="text-xs text-slate-300">
            Type <strong className="text-rose-400 font-mono">WIPE</strong> below to confirm action on <strong className="font-mono">{targetWipeImei}</strong>:
          </p>
          <TextField
            fullWidth
            size="small"
            placeholder="WIPE"
            value={wipeConfirmInput}
            onChange={(e) => setWipeConfirmInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(244, 63, 94, 0.4)' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWipeDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={wipeConfirmInput !== 'WIPE'}
            onClick={handleConfirmWipe}
            sx={{ bgcolor: '#e11d48', '&:hover': { bgcolor: '#be123c' } }}
          >
            Execute Remote Wipe
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: Installed Apps Inspector */}
      {viewingDeviceApps && (
        <Dialog
          open={appsViewDialogOpen}
          onClose={() => setAppsViewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { bgcolor: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px' } }}
        >
          <DialogTitle sx={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpen className="w-5 h-5 text-purple-400" />
            Installed Packages on {viewingDeviceApps.name || viewingDeviceApps.imei}
          </DialogTitle>
          <DialogContent className="space-y-3 pt-2">
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Application Name</th>
                    <th className="p-3">Package Identifier</th>
                    <th className="p-3">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(viewingDeviceApps.installedApps || []).map((app, i) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold text-white">{app.name}</td>
                      <td className="p-3 font-mono text-slate-300">{app.packageName}</td>
                      <td className="p-3 font-mono text-cyan-400">{app.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAppsViewDialogOpen(false)} sx={{ color: '#94a3b8' }}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
