import React from 'react';
import {
  Drawer,
  IconButton,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  X,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Terminal,
  RefreshCw
} from 'lucide-react';

export default function AuditLogDrawer({
  open,
  onClose,
  logs = [],
  onRefresh,
  loading
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          bgcolor: '#080c14',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#f1f5f9'
        }
      }}
    >
      <div className="flex flex-col h-full">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">MDM Command Audit Trail</h3>
              <p className="text-xs text-slate-400">Firebase Cloud Messaging Dispatch Logs</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={loading}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </IconButton>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Terminal className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold">No audit logs recorded yet</p>
              <p className="text-xs">Dispatched MDM commands will appear here in real time.</p>
            </div>
          ) : (
            logs.map((log, idx) => {
              const isDelivered = log.status === 'DELIVERED';
              const cmd = log.command;

              return (
                <div
                  key={log.id || idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        cmd === 'LOCK'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : cmd === 'UNLOCK'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : cmd === 'RELEASE'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {cmd}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target IMEI:</span>
                      <span className="font-mono font-semibold text-white">{log.imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operator:</span>
                      <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
                        {log.dispatchedBy || 'MDM Admin'}
                      </span>
                    </div>
                  </div>

                  {/* FCM Message Payload Preview */}
                  {log.payload && (
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-x-auto">
                      <span className="text-slate-500">// FCM Data Payload:</span>
                      <pre className="mt-0.5">{JSON.stringify(log.payload, null, 2)}</pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                    <span className="text-slate-500 font-mono truncate max-w-[240px]">
                      MsgID: {log.fcmMessageId || 'N/A'}
                    </span>
                    <span className={`font-semibold flex items-center gap-1 ${isDelivered ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Drawer>
  );
}
