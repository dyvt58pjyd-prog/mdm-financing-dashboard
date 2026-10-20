import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Lock,
  Unlock,
  Radio,
  RefreshCw,
  Bell,
  Wifi,
  BatteryCharging,
  PhoneCall,
  CreditCard,
  X,
  Volume2,
  Power,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { IconButton, Tooltip, Select, MenuItem, FormControl } from '@mui/material';

export default function VirtualDeviceSimulator({
  devices = [],
  selectedImei,
  onSelectImei,
  onClose,
  onAction
}) {
  const [device, setDevice] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isScreenOn, setIsScreenOn] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // Update device based on selectedImei
  useEffect(() => {
    if (devices.length === 0) return;
    const found = devices.find(d => d.imei === selectedImei) || devices[0];
    setDevice(found);
  }, [selectedImei, devices]);

  // Clock ticker for status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to Server-Sent Events (SSE) from the backend FCM simulator stream
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('/api/simulator/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'CONNECTED') return;

          // Check if payload is for current device or general
          const command = payload.data?.dlcCommand;
          const targetImei = payload.data?.imei;

          if (command) {
            setNotification({
              command,
              imei: targetImei,
              messageId: payload.messageId,
              timestamp: new Date().toLocaleTimeString(),
              details: payload.data
            });

            // Automatically clear notification toast after 6 seconds
            setTimeout(() => {
              setNotification(null);
            }, 6000);
          }
        } catch (e) {
          console.error('Error parsing SSE simulator event:', e);
        }
      };
    } catch (err) {
      console.warn('Simulator SSE connection note:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  if (!device) return null;

  const isLocked = device.status === 'LOCKED';
  const isReleased = device.status === 'RELEASED';

  return (
    <div className="flex flex-col items-center">
      {/* Device Selector Toolbar */}
      <div className="w-full max-w-[340px] mb-3 flex items-center justify-between px-2">
        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">Live Handset Emulator</span>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          Close
        </button>
      </div>

      {/* Select Which Device To Emulate */}
      <div className="w-full max-w-[340px] mb-3">
        <select
          value={device.imei}
          onChange={(e) => onSelectImei(e.target.value)}
          className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          {devices.map(d => (
            <option key={d.imei} value={d.imei}>
              {d.hardware?.brand} {d.hardware?.model} - {d.status} ({d.imei.slice(-6)})
            </option>
          ))}
        </select>
      </div>

      {/* Realistic Android Phone Chassis */}
      <div className="relative w-[320px] h-[640px] rounded-[48px] bg-[#0d1117] p-3.5 shadow-2xl border-[5px] border-slate-700/80 ring-1 ring-white/10 overflow-hidden select-none">
        {/* Hardware Notch / Dynamic Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 w-24 h-4 bg-black rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-900/60"></div>
        </div>

        {/* Outer Phone Bezel Buttons (Visual) */}
        <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-600 rounded-r"></div>
        <div className="absolute -left-1 top-36 w-1 h-8 bg-slate-600 rounded-r"></div>
        <div
          onClick={() => setIsScreenOn(!isScreenOn)}
          className="absolute -right-1 top-28 w-1 h-12 bg-slate-600 rounded-l cursor-pointer hover:bg-cyan-500 transition-colors"
          title="Toggle Screen Power"
        ></div>

        {/* Screen Display Area */}
        <div
          className={`relative w-full h-full rounded-[36px] overflow-hidden transition-all duration-300 ${
            !isScreenOn
              ? 'bg-black'
              : isLocked
              ? 'bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950'
              : isReleased
              ? 'bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950'
              : 'bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950'
          }`}
        >
          {isScreenOn ? (
            <div className="flex flex-col h-full text-white">
              {/* Android Status Bar */}
              <div className="pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-slate-300 z-20">
                <span>{currentTime}</span>
                <div className="flex items-center space-x-1.5">
                  <Wifi className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] font-bold">5G</span>
                  <div className="flex items-center space-x-0.5">
                    <span className="text-[10px]">{device.hardware?.batteryLevel || 88}%</span>
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Incoming FCM Push Notification Toast */}
              {notification && (
                <div className="mx-3 mt-3 p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-xl backdrop-blur-md animate-bounce z-30">
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      FCM Data Payload Received
                    </span>
                    <span className="text-slate-400 font-mono">{notification.timestamp}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-white">
                    dlcCommand: <span className="text-cyan-300 font-extrabold">{notification.command}</span>
                  </p>
                  <p className="text-[10px] text-slate-300 mt-0.5 truncate">
                    Target: {notification.imei || device.imei}
                  </p>
                </div>
              )}

              {/* SCREEN CONTENT: LOCKED KIOSK MODE */}
              {isLocked && (
                <div className="flex-1 flex flex-col items-center justify-between p-6 text-center z-10 animate-fade-in">
                  <div className="mt-8 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-600/30 mb-4 animate-pulse">
                      <Lock className="w-8 h-8" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 mb-1">
                      Kiosk Security Locked
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Device Financing Policy Enforced
                    </h3>
                    <p className="text-xs text-rose-200/80 mt-1 max-w-[220px]">
                      Your monthly installment payment is overdue. Phone functionality has been restricted by your loan provider.
                    </p>
                  </div>

                  {/* Overdue Card */}
                  <div className="w-full p-4 rounded-2xl bg-black/40 border border-rose-500/30 backdrop-blur-md space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Past Due Amount:</span>
                      <span className="font-mono font-extrabold text-rose-400 text-sm">
                        ${Number(device.nextDueAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Due Date:</span>
                      <span className="font-mono text-white text-xs">{device.dueDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Contract ID:</span>
                      <span className="font-mono text-cyan-400 text-xs">{device.customer?.contractId}</span>
                    </div>
                  </div>

                  {/* Locked Emergency Actions */}
                  <div className="w-full space-y-2 mb-4">
                    <button
                      onClick={() => onAction(device.imei, 'UNLOCK')}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Now & Unlock
                    </button>

                    <button className="w-full py-2 px-4 rounded-xl text-[11px] font-semibold text-slate-400 bg-slate-900/60 border border-slate-800 hover:text-white flex items-center justify-center gap-1.5">
                      <PhoneCall className="w-3 h-3 text-rose-400" />
                      Emergency Calls Only (911)
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN CONTENT: UNLOCKED MODE */}
              {!isLocked && !isReleased && (
                <div className="flex-1 flex flex-col justify-between p-5 text-center z-10">
                  <div className="mt-8 flex flex-col items-center">
                    <span className="text-4xl font-light text-white font-mono tracking-tight">
                      {currentTime}
                    </span>
                    <p className="text-xs text-sky-200 mt-1">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>

                    <div className="mt-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Financing Compliant • Unlocked
                    </div>
                  </div>

                  {/* Mock Android App Icons */}
                  <div className="grid grid-cols-4 gap-3 my-auto">
                    {[
                      { name: 'Phone', color: 'bg-emerald-500', icon: '📞' },
                      { name: 'Messages', color: 'bg-blue-500', icon: '💬' },
                      { name: 'Chrome', color: 'bg-amber-500', icon: '🌐' },
                      { name: 'Camera', color: 'bg-rose-500', icon: '📷' },
                      { name: 'PayFin', color: 'bg-cyan-600', icon: '💳' },
                      { name: 'Settings', color: 'bg-slate-600', icon: '⚙️' },
                      { name: 'Play Store', color: 'bg-teal-500', icon: '▶️' },
                      { name: 'MDM Shield', color: 'bg-indigo-600', icon: '🛡️' }
                    ].map((app, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-2xl ${app.color} flex items-center justify-center text-lg shadow-md`}>
                          {app.icon}
                        </div>
                        <span className="text-[9px] text-slate-300 mt-1 truncate max-w-[50px]">{app.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Android Bottom Dock */}
                  <div className="w-full p-2.5 rounded-2xl bg-white/10 backdrop-blur-md flex justify-around mb-2">
                    <span className="text-xl">📞</span>
                    <span className="text-xl">💬</span>
                    <span className="text-xl">🌐</span>
                    <span className="text-xl">📷</span>
                  </div>
                </div>
              )}

              {/* SCREEN CONTENT: RELEASED MODE */}
              {isReleased && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/30 mb-3">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Loan Fully Satisfied
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1 max-w-[220px]">
                    Kiosk profile removed. All financing restrictions have been permanently revoked.
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    Ownership 100% Granted
                  </div>
                </div>
              )}

              {/* Android Home Bar */}
              <div className="pb-2 flex justify-center">
                <div className="w-24 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
              Screen Powered Off
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
