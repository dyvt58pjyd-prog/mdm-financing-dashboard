import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip
} from '@mui/material';

export default function AppRepositoryView({ api, onShowToast }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    packageName: '',
    version: '1.0.0',
    sizeMb: '25.0',
    downloadUrl: '',
    checksum: '',
    category: 'Productivity',
    mandatory: false
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const list = await api.getApps();
      setApps(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await api.saveApp(formData);
      setApps(prev => [...prev, saved]);
      setIsAddOpen(false);
      onShowToast(`Application "${saved.name}" registered in enterprise repository!`, 'success');
      setFormData({
        name: '',
        packageName: '',
        version: '1.0.0',
        sizeMb: '25.0',
        downloadUrl: '',
        checksum: '',
        category: 'Productivity',
        mandatory: false
      });
    } catch (err) {
      onShowToast('Failed to save app: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteApp(id);
      setApps(prev => prev.filter(a => a.id !== id));
      onShowToast('App removed from repository', 'info');
    } catch (err) {
      onShowToast('Failed to delete app: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-800/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Enterprise Application Repository & Silent Installer
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Manage corporate APK distribution packages. Dispatched via Android's background <code>PackageInstaller</code> sessions directly to enrolled Device Owner devices without user approval dialogs.
          </p>
        </div>

        <Button
          variant="contained"
          onClick={() => setIsAddOpen(true)}
          startIcon={<Plus className="w-4 h-4" />}
          sx={{
            bgcolor: '#059669',
            color: '#fff',
            fontWeight: 700,
            '&:hover': { bgcolor: '#047857' }
          }}
        >
          Register New APK
        </Button>
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <div
            key={app.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{app.name}</h3>
                    <span className="text-[11px] font-mono text-cyan-400">v{app.version}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {app.category || 'General'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Package ID:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[180px]">{app.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-mono text-slate-200">{app.sizeMb} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Checksum (SHA-256):</span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <span>{(app.checksum || '').slice(0, 8)}...</span>
                    <Tooltip title="Copy Checksum">
                      <button
                        onClick={() => handleCopy(app.checksum, `chk_${app.id}`)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedId === `chk_${app.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800">
              <a
                href={app.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Download APK
              </a>

              <Button
                size="small"
                color="error"
                onClick={() => handleDelete(app.id)}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <Trash2 className="w-4 h-4 text-slate-500 hover:text-rose-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add App Dialog */}
      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px'
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>
            Register Corporate APK
          </DialogTitle>
          <DialogContent className="space-y-3 pt-2">
            <TextField
              label="Application Display Name"
              fullWidth
              size="small"
              required
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Apex POS Terminal"
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
            />

            <TextField
              label="Android Package Name (`applicationId`)"
              fullWidth
              size="small"
              required
              value={formData.packageName}
              onChange={(e) => setFormData(p => ({ ...p, packageName: e.target.value }))}
              placeholder="e.g. com.retail.pos"
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
            />

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Version String"
                fullWidth
                size="small"
                value={formData.version}
                onChange={(e) => setFormData(p => ({ ...p, version: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
              />

              <TextField
                label="APK Size (MB)"
                type="number"
                fullWidth
                size="small"
                value={formData.sizeMb}
                onChange={(e) => setFormData(p => ({ ...p, sizeMb: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
              />
            </div>

            <TextField
              label="HTTPS Direct APK Download URL"
              fullWidth
              size="small"
              required
              value={formData.downloadUrl}
              onChange={(e) => setFormData(p => ({ ...p, downloadUrl: e.target.value }))}
              placeholder="https://mdm.enterprise.com/apks/app.apk"
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
            />

            <TextField
              label="SHA-256 Checksum"
              fullWidth
              size="small"
              value={formData.checksum}
              onChange={(e) => setFormData(p => ({ ...p, checksum: e.target.value }))}
              placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae..."
              sx={{ '& .MuiOutlinedInput-root': { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsAddOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
              Register APK
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
