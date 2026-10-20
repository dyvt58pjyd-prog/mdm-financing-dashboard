import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  CircularProgress,
  TextField,
  Alert
} from '@mui/material';
import {
  X,
  Lock,
  Unlock,
  RefreshCw,
  Radio,
  Trash2,
  Smartphone,
  User,
  CreditCard,
  History,
  ShieldCheck,
  ShieldAlert,
  Battery,
  Cpu,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Send,
  DollarSign
} from 'lucide-react';

export default function DeviceDetailModal({
  open,
  onClose,
  device,
  onAction,
  onRecordPayment,
  actionLoadingImei,
  actionLoadingType
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // Release confirmation dialog state
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);

  // Quick Payment form dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('Online Installment Payment');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  if (!device) return null;

  const isCurrentActionLoading = actionLoadingImei === device.imei;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenPayment = () => {
    setPaymentAmount(device.nextDueAmount > 0 ? String(device.nextDueAmount) : '45.00');
    setIsPaymentDialogOpen(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount) return;
    setPaymentSubmitting(true);
    try {
      await onRecordPayment(device.imei, parseFloat(paymentAmount), paymentNote);
      setIsPaymentDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const financing = device.financing || {};
  const totalAmount = financing.totalAmount || 0;
  const totalPaid = financing.totalPaid || 0;
  const progressPercent = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#090d16',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.08), transparent 70%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {device.hardware?.brand} {device.hardware?.model}
                </h3>
                {device.status === 'LOCKED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                    LOCKED
                  </span>
                )}
                {device.status === 'UNLOCKED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    UNLOCKED
                  </span>
                )}
                {device.status === 'RELEASED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    RELEASED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                IMEI: <span className="text-slate-200 font-semibold">{device.imei}</span> • Contract: {device.customer?.contractId || 'N/A'}
              </p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            size="small"
            className="text-slate-400 hover:text-white"
            sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)' }}
          >
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* MDM ACTIONS COMMAND BAR */}
        <div className="bg-slate-950/80 p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              MDM Remote Actions (FCM High-Priority Data Messages)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Target FCM: {(device.fcmToken || '').slice(0, 14)}...
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* 1. Force Sync */}
            <Button
              variant="outlined"
              size="small"
              disabled={isCurrentActionLoading}
              onClick={() => onAction(device.imei, 'SYNC')}
              startIcon={
                isCurrentActionLoading && actionLoadingType === 'SYNC' ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                )
              }
              sx={{
                bgcolor: 'rgba(6, 182, 212, 0.08)',
                borderColor: 'rgba(6, 182, 212, 0.3)',
                color: '#e0f2fe',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: 'rgba(6, 182, 212, 0.2)',
                  borderColor: 'rgba(6, 182, 212, 0.6)'
                }
              }}
            >
              Force Sync
            </Button>

            {/* 2. Ping Device */}
            <Button
              variant="outlined"
              size="small"
              disabled={isCurrentActionLoading}
              onClick={() => onAction(device.imei, 'PING')}
              startIcon={
                isCurrentActionLoading && actionLoadingType === 'PING' ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Radio className="w-4 h-4 text-indigo-400" />
                )
              }
              sx={{
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                color: '#e0e7ff',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(99, 102, 241, 0.6)'
                }
              }}
            >
              Ping Device
            </Button>

            {/* 3. Lock Device */}
            <Button
              variant="contained"
              size="small"
              disabled={isCurrentActionLoading || device.status === 'LOCKED' || device.status === 'RELEASED'}
              onClick={() => onAction(device.imei, 'LOCK')}
              startIcon={
                isCurrentActionLoading && actionLoadingType === 'LOCK' ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Lock className="w-4 h-4" />
                )
              }
              sx={{
                bgcolor: '#e11d48',
                color: '#fff',
                fontSize: '0.75rem',
                '&:hover': { bgcolor: '#be123c' },
                '&.Mui-disabled': { bgcolor: 'rgba(225, 29, 72, 0.2)', color: '#fda4af' }
              }}
            >
              Lock Device
            </Button>

            {/* 4. Unlock Device */}
            <Button
              variant="contained"
              size="small"
              disabled={isCurrentActionLoading || device.status === 'UNLOCKED' || device.status === 'RELEASED'}
              onClick={() => onAction(device.imei, 'UNLOCK')}
              startIcon={
                isCurrentActionLoading && actionLoadingType === 'UNLOCK' ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )
              }
              sx={{
                bgcolor: '#059669',
                color: '#fff',
                fontSize: '0.75rem',
                '&:hover': { bgcolor: '#047857' },
                '&.Mui-disabled': { bgcolor: 'rgba(5, 150, 105, 0.2)', color: '#6ee7b7' }
              }}
            >
              Unlock Device
            </Button>

            {/* 5. Release Device */}
            <Button
              variant="outlined"
              size="small"
              disabled={isCurrentActionLoading || device.status === 'RELEASED'}
              onClick={() => setIsReleaseDialogOpen(true)}
              startIcon={<Trash2 className="w-4 h-4 text-rose-400" />}
              sx={{
                borderColor: 'rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                fontSize: '0.75rem',
                bgcolor: 'rgba(244, 63, 94, 0.05)',
                '&:hover': {
                  borderColor: 'rgba(244, 63, 94, 0.7)',
                  bgcolor: 'rgba(244, 63, 94, 0.15)'
                }
              }}
            >
              Release Device
            </Button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-slate-800 px-6">
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                color: '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 600,
                minHeight: '48px',
                '&.Mui-selected': { color: '#38bdf8' }
              }
            }}
          >
            <Tab label="Financing & Payments" icon={<CreditCard className="w-4 h-4 mr-1.5" />} iconPosition="start" />
            <Tab label="Hardware & Telemetry" icon={<Cpu className="w-4 h-4 mr-1.5" />} iconPosition="start" />
            <Tab label="Borrower Profile" icon={<User className="w-4 h-4 mr-1.5" />} iconPosition="start" />
          </Tabs>
        </div>

        {/* Modal Body Content */}
        <DialogContent sx={{ p: 3 }}>
          {/* TAB 0: Financing & Payments */}
          {activeTab === 0 && (
            <div className="space-y-6">
              {/* Financial Progress Banner */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Loan Recovery Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      ${totalPaid.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      of ${totalAmount.toFixed(2)} ({progressPercent}%)
                    </span>
                  </div>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(30, 41, 59, 0.8)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #06b6d4, #10b981)'
                    }
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Monthly Due:</span>
                    <p className="font-mono font-bold text-white mt-0.5">${financing.monthlyPayment || device.nextDueAmount}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Due Date:</span>
                    <p className="font-mono font-bold text-amber-300 mt-0.5">{device.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tenure:</span>
                    <p className="font-mono text-slate-200 mt-0.5">{financing.paidInstallments || 0} / {financing.totalTenureMonths || 12} Mos</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Interest:</span>
                    <p className="font-mono text-slate-200 mt-0.5">{financing.interestRate || '8.5%'}</p>
                  </div>
                </div>
              </div>

              {/* Action: Record Payment */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-900/40">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Borrower Settle Installment
                  </h4>
                  <p className="text-xs text-slate-400">
                    Recording a payment will auto-update RTDB and dispatch an UNLOCK payload if device is locked.
                  </p>
                </div>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleOpenPayment}
                  sx={{
                    bgcolor: '#059669',
                    '&:hover': { bgcolor: '#047857' }
                  }}
                >
                  Record Payment
                </Button>
              </div>

              {/* Installment History Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Installment Payment History
                </h4>
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(device.history || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            No payment history recorded yet
                          </td>
                        </tr>
                      ) : (
                        device.history.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-mono text-slate-300">{item.date}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{item.txId}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-white">${Number(item.amount).toFixed(2)}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  item.status?.toLowerCase().includes('paid')
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Hardware & Telemetry */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hardware Spec */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Handset Diagnostics
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Brand & Model:</span>
                      <span className="font-semibold text-white">{device.hardware?.brand} {device.hardware?.model}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Android OS:</span>
                      <span className="font-mono text-slate-200">{device.hardware?.androidVersion}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Battery Level:</span>
                      <span className="font-mono text-emerald-400 font-bold">{device.hardware?.batteryLevel || 85}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">SIM IMSI:</span>
                      <span className="font-mono text-slate-300">{device.hardware?.simImsi || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* MDM Security & Kiosk Profile */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    MDM Security & Policy
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">DLC Lock Controller:</span>
                      <span className="font-mono text-cyan-400">{device.hardware?.lockAppVersion || 'v3.4.2-dlc'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Tamper Status:</span>
                      <span className="font-semibold text-emerald-400">{device.hardware?.tamperStatus || 'Secure'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Kiosk Kiosk Owner:</span>
                      <span className="font-mono text-slate-300">ApexFinancingAdminReceiver</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Last Telemetry Sync:</span>
                      <span className="font-mono text-slate-300">{device.lastSyncTime || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FCM Backend Routing Token */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    FCM Device Registration Token (Routing Endpoint)
                  </span>
                  <Tooltip title={copiedKey === 'fcm' ? 'Copied!' : 'Copy FCM Token'}>
                    <button
                      onClick={() => copyToClipboard(device.fcmToken, 'fcm')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'fcm' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Token
                    </button>
                  </Tooltip>
                </div>
                <div className="font-mono text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 break-all select-all">
                  {device.fcmToken}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Borrower Profile */}
          {activeTab === 2 && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                Borrower Identification & Contract
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Customer Full Name:</span>
                  <p className="font-bold text-white text-sm mt-0.5">{device.customer?.name}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Registered Phone Number:</span>
                  <p className="font-mono font-bold text-white text-sm mt-0.5">{device.customer?.phone}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Email Address:</span>
                  <p className="font-mono text-slate-200 mt-0.5">{device.customer?.email}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Financing Agreement ID:</span>
                  <p className="font-mono font-bold text-cyan-400 mt-0.5">{device.customer?.contractId}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button onClick={onClose} sx={{ color: '#94a3b8' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* RELEASE DEVICE PERMANENT CONFIRMATION MODAL */}
      <Dialog
        open={isReleaseDialogOpen}
        onClose={() => setIsReleaseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fda4af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Release Device Permanently?
        </DialogTitle>
        <DialogContent>
          <p className="text-xs text-slate-300 leading-relaxed">
            This action sends a Firebase Data Message with <code className="text-rose-400 font-mono">{"{ \"dlcCommand\": \"RELEASE\" }"}</code>.
          </p>
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200">
            <strong>Warning:</strong> This permanently revokes and uninstalls the Device Lock Controller (DLC) kiosk application from device <strong className="font-mono">{device.imei}</strong>. Financing lock cannot be re-applied remotely.
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsReleaseDialogOpen(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsReleaseDialogOpen(false);
              onAction(device.imei, 'RELEASE');
            }}
            sx={{
              bgcolor: '#e11d48',
              '&:hover': { bgcolor: '#be123c' }
            }}
          >
            Confirm Release
          </Button>
        </DialogActions>
      </Dialog>

      {/* QUICK PAYMENT DIALOG */}
      <Dialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px'
          }
        }}
      >
        <form onSubmit={handleSubmitPayment}>
          <DialogTitle sx={{ color: '#6ee7b7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Record Installment Payment
          </DialogTitle>
          <DialogContent className="space-y-4">
            <p className="text-xs text-slate-300">
              Apply a customer payment to device <strong className="font-mono text-white">{device.imei}</strong>.
            </p>

            <TextField
              label="Payment Amount ($)"
              type="number"
              fullWidth
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              size="small"
              inputProps={{ min: "1", step: "0.01" }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                }
              }}
            />

            <TextField
              label="Payment Memo / Reference"
              fullWidth
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsPaymentDialogOpen(false)} sx={{ color: '#94a3b8' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={paymentSubmitting}
              sx={{
                bgcolor: '#059669',
                '&:hover': { bgcolor: '#047857' }
              }}
            >
              {paymentSubmitting ? 'Recording...' : 'Submit Payment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
