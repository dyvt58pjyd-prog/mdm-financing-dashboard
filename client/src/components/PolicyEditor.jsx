import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Lock,
  Smartphone,
  Save,
  Trash2,
  Copy,
  Check,
  Plus,
  ExternalLink,
  Code2,
  Wifi,
  Camera,
  HardDrive,
  Eye,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import {
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

export default function PolicyEditor({ api, onShowToast }) {
  const [policies, setPolicies] = useState([]);
  const [apps, setApps] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Active policy being edited
  const [activePolicy, setActivePolicy] = useState(null);
  const [newPackageInput, setNewPackageInput] = useState('');

  // Fetch policies and apps
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesList, appsList] = await Promise.all([
        api.getPolicies(),
        api.getApps()
      ]);
      setPolicies(policiesList);
      setApps(appsList);

      if (policiesList.length > 0) {
        const initial = policiesList[0];
        setSelectedPolicyId(initial.id);
        setActivePolicy(JSON.parse(JSON.stringify(initial)));
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPolicy = (pol) => {
    setSelectedPolicyId(pol.id);
    setActivePolicy(JSON.parse(JSON.stringify(pol)));
  };

  const handleCreateNewPolicy = () => {
    const newPol = {
      id: `policy_${Date.now()}`,
      name: "New Custom Enterprise Policy",
      description: "Custom Android Device Owner policy profile.",
      version: 1,
      published: false,
      updatedAt: new Date().toISOString(),
      kioskMode: "OFF", // OFF, SINGLE_APP, MULTI_APP
      primaryKioskPackage: "com.android.chrome",
      allowlistedPackages: ["com.android.chrome", "com.apex.mdm.agent"],
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
      appRepositoryRules: [],
      systemUpdatePolicy: { type: "AUTOMATIC" }
    };

    setPolicies(prev => [newPol, ...prev]);
    setSelectedPolicyId(newPol.id);
    setActivePolicy(newPol);
  };

  const handleFieldChange = (field, value) => {
    setActivePolicy(prev => ({ ...prev, [field]: value }));
  };

  const handleRestrictionToggle = (key, val) => {
    setActivePolicy(prev => ({
      ...prev,
      restrictions: {
        ...(prev.restrictions || {}),
        [key]: val
      }
    }));
  };

  const handleLockTaskToggle = (key, val) => {
    setActivePolicy(prev => ({
      ...prev,
      lockTaskFeatures: {
        ...(prev.lockTaskFeatures || {}),
        [key]: val
      }
    }));
  };

  // Add allowlisted package
  const handleAddPackage = (e) => {
    if (e) e.preventDefault();
    const pkg = newPackageInput.trim();
    if (!pkg) return;
    if (activePolicy.allowlistedPackages.includes(pkg)) return;

    setActivePolicy(prev => ({
      ...prev,
      allowlistedPackages: [...(prev.allowlistedPackages || []), pkg]
    }));
    setNewPackageInput('');
  };

  const handleRemovePackage = (pkgToRemove) => {
    setActivePolicy(prev => ({
      ...prev,
      allowlistedPackages: (prev.allowlistedPackages || []).filter(p => p !== pkgToRemove)
    }));
  };

  // Toggle App in Repository rule
  const handleToggleAppRule = (appId) => {
    const rules = [...(activePolicy.appRepositoryRules || [])];
    const index = rules.findIndex(r => r.packageId === appId);
    if (index >= 0) {
      rules.splice(index, 1);
    } else {
      rules.push({ packageId: appId, autoInstall: true, blockUninstall: true });
    }
    setActivePolicy(prev => ({ ...prev, appRepositoryRules: rules }));
  };

  // Publish Policy to Cloud
  const handlePublishPolicy = async () => {
    if (!activePolicy.name) {
      onShowToast('Policy name is required', 'error');
      return;
    }
    setPublishing(true);
    try {
      const saved = await api.savePolicy({
        ...activePolicy,
        published: true
      });

      // Update list
      setPolicies(prev => prev.map(p => p.id === saved.id ? saved : p));
      setActivePolicy(saved);
      onShowToast(`Policy "${saved.name}" published to Cloud Database! Version incremented to v${saved.version}`, 'success');
    } catch (err) {
      onShowToast('Publish failed: ' + err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Generate public config.json URL
  const publicConfigUrl = activePolicy ? `http://localhost:5001/api/policies/${activePolicy.id}/config.json` : '';

  const handleCopyConfigUrl = () => {
    navigator.clipboard.writeText(publicConfigUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    onShowToast('Public config.json endpoint URL copied to clipboard!', 'info');
  };

  // Generate live Android Enterprise schema JSON
  const generatedConfigJson = activePolicy ? {
    schemaVersion: "2.4.0",
    policyId: activePolicy.id,
    policyName: activePolicy.name,
    policyVersion: (activePolicy.version || 1),
    publishedAt: activePolicy.updatedAt,
    kioskMode: {
      enabled: activePolicy.kioskMode !== 'OFF',
      mode: activePolicy.kioskMode,
      primaryApp: activePolicy.primaryKioskPackage,
      allowlistedPackages: activePolicy.allowlistedPackages || [],
      lockTaskFeatures: activePolicy.lockTaskFeatures || {}
    },
    userRestrictions: activePolicy.restrictions || {},
    applicationRepository: (activePolicy.appRepositoryRules || []).map(r => {
      const found = apps.find(a => a.id === r.packageId);
      return {
        packageName: found ? found.packageName : r.packageId,
        appName: found ? found.name : 'Enterprise APK',
        downloadUrl: found ? found.downloadUrl : '',
        autoInstall: r.autoInstall,
        blockUninstall: r.blockUninstall
      };
    }),
    systemUpdatePolicy: activePolicy.systemUpdatePolicy || { type: "AUTOMATIC" }
  } : {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 border border-indigo-800/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Advanced Policy Profile Editor (`config.json` Generator)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Construct graphical device management policies, Kiosk Mode allowlists, and Android <code>UserManager</code> security restrictions. Published policies generate live <code>config.json</code> endpoints consumed by Android DPCs over the internet.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outlined"
            onClick={handleCreateNewPolicy}
            startIcon={<Plus className="w-4 h-4 text-cyan-400" />}
            sx={{
              borderColor: 'rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              '&:hover': { borderColor: 'rgba(6, 182, 212, 0.8)', bgcolor: 'rgba(6, 182, 212, 0.1)' }
            }}
          >
            Create New Policy
          </Button>

          <Button
            variant="contained"
            onClick={handlePublishPolicy}
            disabled={publishing || !activePolicy}
            startIcon={publishing ? <CircularProgress size={16} color="inherit" /> : <Save className="w-4 h-4" />}
            sx={{
              bgcolor: '#6366f1',
              color: '#fff',
              fontWeight: 700,
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            {publishing ? 'Publishing...' : 'Publish Policy to Cloud'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Profiles List Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Configured Profiles ({policies.length})
            </span>

            <div className="space-y-2">
              {policies.map(pol => {
                const isSelected = selectedPolicyId === pol.id;
                return (
                  <div
                    key={pol.id}
                    onClick={() => handleSelectPolicy(pol)}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{pol.name}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        v{pol.version || 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          pol.kioskMode === 'SINGLE_APP'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                            : pol.kioskMode === 'MULTI_APP'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {pol.kioskMode === 'OFF' ? 'Standard Launcher' : pol.kioskMode === 'SINGLE_APP' ? 'Single Kiosk' : 'Multi Kiosk'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Col: Graphical Policy Builder Form (5 cols) */}
        {activePolicy && (
          <div className="lg:col-span-5 space-y-6">
            {/* Identity Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Policy Identification
              </h3>

              <div className="space-y-3">
                <TextField
                  label="Policy Profile Name"
                  fullWidth
                  size="small"
                  value={activePolicy.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontWeight: 600,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                    }
                  }}
                />

                <TextField
                  label="Policy Description & Usage Intent"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={activePolicy.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontSize: '0.85rem',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                    }
                  }}
                />
              </div>
            </div>

            {/* KIOSK MODE & ALLOWLISTING BUILDER */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Kiosk Mode & App Allowlisting
              </h3>

              {/* Mode Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Operating Mode (`LockTaskMode`)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'OFF', label: 'Off / Corporate', desc: 'Standard Android Home' },
                    { mode: 'SINGLE_APP', label: 'Single App Kiosk', desc: 'Pinned to 1 App' },
                    { mode: 'MULTI_APP', label: 'Multi-App Kiosk', desc: 'Allowlisted Icons Only' }
                  ].map(item => {
                    const active = activePolicy.kioskMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => handleFieldChange('kioskMode', item.mode)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="block text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* If Single App Kiosk: Primary Package */}
              {activePolicy.kioskMode === 'SINGLE_APP' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Primary Kiosk Application Package
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    value={activePolicy.primaryKioskPackage}
                    onChange={(e) => handleFieldChange('primaryKioskPackage', e.target.value)}
                    placeholder="com.retail.pos or com.android.chrome"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        fontFamily: 'monospace',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                      }
                    }}
                  />
                </div>
              )}

              {/* Allowlisted Packages Tags */}
              {activePolicy.kioskMode !== 'OFF' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Allowlisted Packages (`dpm.setLockTaskPackages`)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 min-h-[46px] mb-2">
                    {(activePolicy.allowlistedPackages || []).map(pkg => (
                      <Chip
                        key={pkg}
                        label={pkg}
                        onDelete={() => handleRemovePackage(pkg)}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(30, 41, 59, 0.9)',
                          color: '#38bdf8',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}
                      />
                    ))}
                  </div>

                  <form onSubmit={handleAddPackage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. com.google.android.apps.maps"
                      value={newPackageInput}
                      onChange={(e) => setNewPackageInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        fontSize: '0.75rem'
                      }}
                    >
                      Add Package
                    </Button>
                  </form>
                </div>
              )}

              {/* Lock Task UI Features Toggles */}
              {activePolicy.kioskMode !== 'OFF' && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    System UI Controls in LockTaskMode
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={activePolicy.lockTaskFeatures?.home ?? false}
                          onChange={(e) => handleLockTaskToggle('home', e.target.checked)}
                        />
                      }
                      label={<span className="text-xs text-slate-300">Show Home Button</span>}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={activePolicy.lockTaskFeatures?.overview ?? false}
                          onChange={(e) => handleLockTaskToggle('overview', e.target.checked)}
                        />
                      }
                      label={<span className="text-xs text-slate-300">Show Overview (Recents)</span>}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={activePolicy.lockTaskFeatures?.systemInfo ?? true}
                          onChange={(e) => handleLockTaskToggle('systemInfo', e.target.checked)}
                        />
                      }
                      label={<span className="text-xs text-slate-300">Show Battery / Clock Bar</span>}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={activePolicy.lockTaskFeatures?.notifications ?? false}
                          onChange={(e) => handleLockTaskToggle('notifications', e.target.checked)}
                        />
                      }
                      label={<span className="text-xs text-slate-300">Show Notification Shade</span>}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECURITY RESTRICTIONS (UserManager Policies) */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Policies & User Restrictions (`UserManager`)
              </h3>

              <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                {[
                  { key: 'disallowFactoryReset', label: 'Disable Factory Reset', desc: 'Prevents device wipe via Settings or recovery menu (DISALLOW_FACTORY_RESET)' },
                  { key: 'disallowSafeBoot', label: 'Disable Safe Boot', desc: 'Prevents bypassing kiosk mode via hardware key safe mode (DISALLOW_SAFE_BOOT)' },
                  { key: 'disallowCamera', label: 'Disable Hardware Camera', desc: 'Blocks camera hardware access completely for privacy & compliance' },
                  { key: 'disallowScreenCapture', label: 'Disable Screen Capture', desc: 'Prevents screenshots and screen recording apps (DLP)' },
                  { key: 'disallowUsbFileTransfer', label: 'Block USB File Transfer', desc: 'Prevents connecting phone to PC as MTP file storage' },
                  { key: 'disallowBluetooth', label: 'Disable Bluetooth', desc: 'Toggles off and locks Bluetooth adapter from user control' },
                  { key: 'disallowConfigWifi', label: 'Disallow Wi-Fi Reconfiguration', desc: 'Prevents user modifying or disconnecting from enrolled corporate Wi-Fi' },
                  { key: 'disallowAdjustVolume', label: 'Disallow Adjusting Volume', desc: 'Locks master sound and notification volume level' },
                  { key: 'disallowUnknownSources', label: 'Block Unknown Source APKs', desc: 'Prevents sideloading unapproved APKs outside of MDM repo' },
                  { key: 'disallowAddUser', label: 'Block Adding Multiple Users', desc: 'Disallows guest mode and secondary Android accounts' }
                ].map(restr => (
                  <div key={restr.key} className="flex items-center justify-between pt-2">
                    <div>
                      <span className="font-semibold text-white block">{restr.label}</span>
                      <span className="text-[11px] text-slate-400">{restr.desc}</span>
                    </div>
                    <Switch
                      size="small"
                      checked={activePolicy.restrictions?.[restr.key] ?? false}
                      onChange={(e) => handleRestrictionToggle(restr.key, e.target.checked)}
                      color="warning"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* MANDATORY APPS DISTRIBUTION */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Mandatory App Silent Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Check APKs to be pushed automatically via background <code>PackageInstaller</code> sessions:
              </p>

              <div className="space-y-2">
                {apps.map(app => {
                  const rule = (activePolicy.appRepositoryRules || []).find(r => r.packageId === app.id);
                  const isChecked = !!rule;
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleToggleAppRule(app.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block text-white">{app.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{app.packageName} • v{app.version}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isChecked && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900 text-emerald-300">
                            Auto-Install & Block Delete
                          </span>
                        )}
                        <Switch
                          size="small"
                          checked={isChecked}
                          color="success"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Right Col: Live Generated config.json Preview (4 cols) */}
        {activePolicy && (
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  Live `config.json` Schema
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Version {activePolicy.version || 1}
                </span>
              </div>

              {/* Public URL Box */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Public Client Ingestion Endpoint:</span>
                  <a
                    href={publicConfigUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 text-[10px]"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-300 break-all">
                  <span className="truncate mr-2">{publicConfigUrl}</span>
                  <Tooltip title={copiedUrl ? 'Copied!' : 'Copy URL'}>
                    <IconButton size="small" onClick={handleCopyConfigUrl} className="text-slate-400 hover:text-white">
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>

              {/* Formatted Code Block */}
              <div className="rounded-2xl bg-black/80 p-3.5 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[480px]">
                <pre>{JSON.stringify(generatedConfigJson, null, 2)}</pre>
              </div>

              <Button
                variant="contained"
                fullWidth
                onClick={handlePublishPolicy}
                disabled={publishing}
                startIcon={<Save className="w-4 h-4" />}
                sx={{
                  bgcolor: '#06b6d4',
                  color: '#080c14',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  '&:hover': { bgcolor: '#22d3ee' }
                }}
              >
                {publishing ? 'Publishing...' : 'Publish Policy to Cloud'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
