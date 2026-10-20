import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Smartphone, PlusCircle, DollarSign, User } from 'lucide-react';

export default function EnrollDeviceModal({
  open,
  onClose,
  onEnroll
}) {
  const [formData, setFormData] = useState({
    imei: '',
    brand: 'Samsung',
    model: 'Galaxy A35 5G',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    totalAmount: '420.00',
    nextDueAmount: '35.00',
    tenureMonths: '12',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateImei = () => {
    // Generate a valid-looking 15-digit TAC + Serial IMEI
    const prefix = '358' + Math.floor(10000 + Math.random() * 90000);
    const suffix = String(Math.floor(1000000 + Math.random() * 9000000));
    setFormData(prev => ({ ...prev, imei: prefix + suffix }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imei) {
      setError('IMEI is required.');
      return;
    }
    if (!formData.customerName) {
      setError('Borrower Name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onEnroll(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to enroll device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span>Enroll Financed Android Handset</span>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Registers device in Firebase RTDB and provisions FCM lock policies
            </p>
          </div>
        </DialogTitle>

        <DialogContent className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Device IMEI */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Handset IMEI (15 Digits)</label>
              <button
                type="button"
                onClick={handleGenerateImei}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
              >
                Auto-Generate Demo IMEI
              </button>
            </div>
            <TextField
              fullWidth
              name="imei"
              value={formData.imei}
              onChange={handleChange}
              placeholder="e.g. 358291094821045"
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  fontFamily: 'monospace',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                }
              }}
            />
          </div>

          {/* Model & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Brand</label>
              <TextField
                select
                fullWidth
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              >
                <MenuItem value="Samsung">Samsung</MenuItem>
                <MenuItem value="Xiaomi">Xiaomi</MenuItem>
                <MenuItem value="Motorola">Motorola</MenuItem>
                <MenuItem value="Google">Google Pixel</MenuItem>
                <MenuItem value="Tecno">Tecno</MenuItem>
                <MenuItem value="Infinix">Infinix</MenuItem>
              </TextField>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Model Name</label>
              <TextField
                fullWidth
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Galaxy A35 5G"
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />
            </div>
          </div>

          {/* Customer / Borrower Profile */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Borrower Agreement
            </span>

            <div className="space-y-3">
              <TextField
                label="Borrower Full Name"
                fullWidth
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Phone Number"
                  fullWidth
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2831"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                    }
                  }}
                />

                <TextField
                  label="Email Address"
                  fullWidth
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="sarah.j@example.com"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Financing Terms */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Financing & Schedule
            </span>

            <div className="grid grid-cols-3 gap-3">
              <TextField
                label="Total Loan ($)"
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />

              <TextField
                label="Monthly Due ($)"
                type="number"
                name="nextDueAmount"
                value={formData.nextDueAmount}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />

              <TextField
                label="Tenure (Months)"
                type="number"
                name="tenureMonths"
                value={formData.tenureMonths}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button onClick={onClose} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#059669',
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Enroll Handset'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
