import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Wifi,
  Shield,
  Layers,
  Settings,
  HelpCircle,
  RefreshCw,
  Save,
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  TextField,
  Button,
  Switch,
  FormControlLabel,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';

export default function EnrollmentCenter({ api, onShowToast }) {
  const [profile, setProfile] = useState({
    adminComponent: "com.example.myapplication/.MDMDeviceAdminReceiver",
    apkUrl: "https://mdm.enterprise.internal/downloads/apex-dpc-agent.apk",
    checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    wifiSsid: "Apex_Corporate_Enroll",
    wifiPassword: "EnterpriseWPA3Key#2026",
    wifiSecurity: "WPA",
    wifiHidden: false,
    serverUrl: "http://localhost:5001/api",
    enrollmentToken: "APEX-ENTERPRISE-TOKEN-8819",
    defaultPolicyId: "policy_kiosk_retail",
    leaveSystemAppsEnabled: true,
    locale: "en_US",
    timeZone: "America/New_York"
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(260);
  const canvasRef = useRef(null);

  // Fetch saved enrollment profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getEnrollmentProfile();
      if (res && res.profile) {
        setProfile(prev => ({ ...prev, ...res.profile }));
      }
    } catch (err) {
      console.warn('Enrollment profile load notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveEnrollmentProfile(profile);
      onShowToast('Enrollment profile & QR code configuration saved to cloud database!', 'success');
    } catch (err) {
      onShowToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Generate standard Android Enterprise 6-Tap QR payload
  const qrPayload = {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": profile.adminComponent || "com.example.myapplication/.MDMDeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": profile.apkUrl,
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": profile.checksum,
    "android.app.extra.PROVISIONING_WIFI_SSID": profile.wifiSsid,
    "android.app.extra.PROVISIONING_WIFI_PASSWORD": profile.wifiPassword,
    "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE": profile.wifiSecurity || "WPA",
    "android.app.extra.PROVISIONING_WIFI_HIDDEN": profile.wifiHidden || false,
    "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": profile.leaveSystemAppsEnabled,
    "android.app.extra.PROVISIONING_LOCALE": profile.locale || "en_US",
    "android.app.extra.PROVISIONING_TIME_ZONE": profile.timeZone || "America/New_York",
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "server_url": profile.serverUrl || "http://localhost:5001/api",
      "enrollment_token": profile.enrollmentToken || "APEX-ENTERPRISE-TOKEN-8819",
      "default_policy_id": profile.defaultPolicyId || "policy_kiosk_retail"
    }
  };

  const qrJsonString = JSON.stringify(qrPayload, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(qrJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Android Enterprise Provisioning JSON copied to clipboard', 'info');
  };

  // Download QR Code as PNG
  const handleDownloadPng = () => {
    const canvas = document.getElementById('enrollment-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `android_enterprise_enrollment_qr_${profile.enrollmentToken || 'apex'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    onShowToast('PNG QR code downloaded for print / scanning', 'success');
  };

  // Download QR Code as SVG
  const handleDownloadSvg = () => {
    const svg = document.getElementById('enrollment-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `android_enterprise_enrollment_qr_${profile.enrollmentToken || 'apex'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    onShowToast('Vector SVG QR code downloaded for packaging / posters', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/40 border border-cyan-800/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Android Enterprise Enrollment & Onboarding Center
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Generate standard <strong>Android Zero-Touch & 6-Tap Setup QR codes</strong>. Tapping any factory-fresh Android welcome screen 6 times launches the camera to scan this code, automatically provisioning your DPC as the permanent <strong>Device Owner</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save className="w-4 h-4" />}
            sx={{
              bgcolor: '#06b6d4',
              color: '#080c14',
              fontWeight: 700,
              '&:hover': { bgcolor: '#22d3ee' }
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configurable Parameters Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: DPC Agent & Component */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              1. Device Policy Controller (DPC) Package & Checksum
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Admin Receiver Component Name (`PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME`)
              </label>
              <TextField
                fullWidth
                size="small"
                value={profile.adminComponent}
                onChange={(e) => handleChange('adminComponent', e.target.value)}
                placeholder="com.example.myapplication/.MDMDeviceAdminReceiver"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    bgcolor: 'rgba(3, 7, 18, 0.6)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Standard receiver registered in your Android client app's `AndroidManifest.xml`.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  APK Download URL
                </label>
                <TextField
                  fullWidth
                  size="small"
                  value={profile.apkUrl}
                  onChange={(e) => handleChange('apkUrl', e.target.value)}
                  placeholder="https://mdm.domain.com/apex-agent.apk"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      bgcolor: 'rgba(3, 7, 18, 0.6)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  SHA-256 Checksum (Integrity Verification)
                </label>
                <TextField
                  fullWidth
                  size="small"
                  value={profile.checksum}
                  onChange={(e) => handleChange('checksum', e.target.value)}
                  placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      bgcolor: 'rgba(3, 7, 18, 0.6)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Auto-Connect Wi-Fi Credentials */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              2. Out-of-the-Box Wi-Fi Auto-Provisioning
            </h3>
            <p className="text-xs text-slate-400">
              When scanning this QR code, Android connects automatically to your staging Wi-Fi network before downloading the APK.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextField
                label="Wi-Fi SSID (Network Name)"
                fullWidth
                size="small"
                value={profile.wifiSsid}
                onChange={(e) => handleChange('wifiSsid', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />

              <TextField
                label="Wi-Fi Password / Pre-shared Key"
                type="text"
                fullWidth
                size="small"
                value={profile.wifiPassword}
                onChange={(e) => handleChange('wifiPassword', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />

              <TextField
                select
                label="Security Type"
                fullWidth
                size="small"
                value={profile.wifiSecurity}
                onChange={(e) => handleChange('wifiSecurity', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              >
                <MenuItem value="WPA">WPA / WPA2 / WPA3-PSK</MenuItem>
                <MenuItem value="WEP">WEP</MenuItem>
                <MenuItem value="NONE">Open (Unsecured)</MenuItem>
              </TextField>
            </div>

            <div className="flex items-center space-x-4 pt-1">
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.wifiHidden}
                    onChange={(e) => handleChange('wifiHidden', e.target.checked)}
                    color="primary"
                  />
                }
                label={<span className="text-xs text-slate-300">Hidden SSID Broadcast</span>}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={profile.leaveSystemAppsEnabled}
                    onChange={(e) => handleChange('leaveSystemAppsEnabled', e.target.checked)}
                    color="primary"
                  />
                }
                label={<span className="text-xs text-slate-300">Keep Pre-installed System Apps</span>}
              />
            </div>
          </div>

          {/* Card 3: Server Sync URL & Enrollment Token */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              3. Server Sync URL & Extras Bundle
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Server Base Sync API Endpoint"
                fullWidth
                size="small"
                value={profile.serverUrl}
                onChange={(e) => handleChange('serverUrl', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />

              <TextField
                label="Enterprise Enrollment Token / Group ID"
                fullWidth
                size="small"
                value={profile.enrollmentToken}
                onChange={(e) => handleChange('enrollmentToken', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive QR Code Preview & Downloader */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" />
                Live Provisioning QR Code
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Ready to Scan
              </span>
            </div>

            {/* High-Contrast White Background Plate for Flawless Camera Scanning */}
            <div className="p-5 bg-white rounded-2xl shadow-xl border-4 border-slate-800 inline-block relative group">
              {/* Canvas version for PNG generation */}
              <QRCodeCanvas
                id="enrollment-qr-canvas"
                value={JSON.stringify(qrPayload)}
                size={qrSize}
                level="M"
                includeMargin={false}
              />

              {/* Hidden SVG version for vector download */}
              <div className="hidden">
                <QRCodeSVG
                  id="enrollment-qr-svg"
                  value={JSON.stringify(qrPayload)}
                  size={512}
                  level="M"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 max-w-xs">
              Point any factory-reset Android device's 6-tap camera at this screen to begin automated Zero-Touch enrollment.
            </p>

            {/* Export & Download Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full mt-5">
              <Button
                variant="outlined"
                size="small"
                onClick={handleDownloadPng}
                startIcon={<Download className="w-4 h-4" />}
                sx={{
                  borderColor: 'rgba(6, 182, 212, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  '&:hover': {
                    borderColor: 'rgba(6, 182, 212, 0.8)',
                    bgcolor: 'rgba(6, 182, 212, 0.1)'
                  }
                }}
              >
                Download PNG
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={handleDownloadSvg}
                startIcon={<Download className="w-4 h-4" />}
                sx={{
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.8)',
                    bgcolor: 'rgba(99, 102, 241, 0.1)'
                  }
                }}
              >
                Download SVG
              </Button>
            </div>

            <Button
              variant="contained"
              fullWidth
              size="small"
              onClick={handleCopyJson}
              startIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              sx={{
                mt: 2,
                bgcolor: '#1e293b',
                color: '#fff',
                fontSize: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: '#334155' }
              }}
            >
              {copied ? 'Payload JSON Copied!' : 'Copy Raw Provisioning JSON'}
            </Button>
          </div>

          {/* 6-Tap Quick Guide Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              How to Provision Android Hardware (6-Tap Method):
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>Power on a factory-reset Android device to the <strong>"Hi There / Welcome"</strong> language screen.</li>
              <li>Tap the blank space on the screen <strong>6 times consecutively</strong> in the exact same spot.</li>
              <li>Android will launch its embedded <strong>Enterprise QR Code Reader</strong>.</li>
              <li>Scan the QR code displayed above. The device will automatically connect to Wi-Fi, download your DPC agent, and establish <strong>Device Owner</strong> status.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
