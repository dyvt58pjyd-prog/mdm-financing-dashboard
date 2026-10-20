import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  History,
  PlusCircle,
  RefreshCw,
  LogOut,
  QrCode,
  Layers,
  Package,
  Database,
  Sliders,
  Cloud
} from 'lucide-react';
import {
  Button,
  IconButton,
  Tooltip
} from '@mui/material';

export default function Navbar({
  serverStatus,
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  onOpenEnroll,
  onOpenLogs,
  isSimulatorOpen,
  onToggleSimulator,
  user,
  onLogout
}) {
  const navTabs = [
    { id: 'FLEET', label: 'Fleet Telemetry', icon: Smartphone },
    { id: 'POLICIES', label: 'Policy Profiles', icon: Sliders },
    { id: 'ENROLLMENT', label: 'QR Enrollment', icon: QrCode },
    { id: 'APPS', label: 'App Repository', icon: Package },
    { id: 'BACKUP', label: 'Persistence & Cloud', icon: Database }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('FLEET')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">Apex<span className="text-cyan-400">MDM</span></span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 hidden sm:inline">
                  Enterprise DPC 2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Permanent Multi-Tier Storage • FCM Controller
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Refresh */}
            <Tooltip title="Synchronize Fleet Data">
              <IconButton
                onClick={onRefresh}
                size="small"
                className="text-slate-400 hover:text-white"
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.9)' }
                }}
              >
                <RefreshCw className={`w-4 h-4 text-slate-300 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </IconButton>
            </Tooltip>

            {/* Audit Logs */}
            <Tooltip title="View MDM Dispatched Command Audit Trail">
              <Button
                variant="outlined"
                size="small"
                onClick={onOpenLogs}
                startIcon={<History className="w-4 h-4 text-indigo-400" />}
                sx={{
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  color: '#e0e7ff',
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                Logs
              </Button>
            </Tooltip>

            {/* Device Simulator Toggle */}
            <Button
              variant="contained"
              size="small"
              onClick={onToggleSimulator}
              startIcon={<Smartphone className="w-3.5 h-3.5" />}
              sx={{
                bgcolor: isSimulatorOpen ? '#0891b2' : '#0284c7',
                fontSize: '0.75rem',
                '&:hover': { bgcolor: '#0369a1' }
              }}
            >
              <span className="hidden sm:inline">{isSimulatorOpen ? 'Hide Phone' : 'Virtual Phone'}</span>
              <span className="sm:hidden">Phone</span>
            </Button>

            {/* User Profile & Logout */}
            <div className="flex items-center pl-2 border-l border-slate-800">
              <Tooltip title="Log Out Admin Session">
                <IconButton
                  onClick={onLogout}
                  size="small"
                  className="text-slate-400 hover:text-rose-400"
                  sx={{
                    bgcolor: 'rgba(30, 41, 59, 0.5)',
                    '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-[11px]">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
