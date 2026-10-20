import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight
} from 'lucide-react';
import {
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Apex<span className="text-cyan-400">MDM</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Mobile Device Management & Kiosk Policy Controller
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Secured Access Required
          </div>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: 'rgba(244, 63, 94, 0.1)',
                  color: '#fda4af',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontSize: '0.8rem'
                }}
              >
                {error}
              </Alert>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Username
              </label>
              <TextField
                fullWidth
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                size="small"
                placeholder="Enter username"
                InputProps={{
                  startAdornment: <User className="w-4 h-4 text-slate-400 mr-2" />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    bgcolor: 'rgba(3, 7, 18, 0.6)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' }
                  }
                }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Password
              </label>
              <TextField
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                size="small"
                placeholder="••••••••••••"
                InputProps={{
                  startAdornment: <Lock className="w-4 h-4 text-slate-400 mr-2" />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    bgcolor: 'rgba(3, 7, 18, 0.6)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' }
                  }
                }}
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.2,
                mt: 2,
                bgcolor: '#06b6d4',
                color: '#080c14',
                fontWeight: 700,
                fontSize: '0.9rem',
                '&:hover': { bgcolor: '#22d3ee' }
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to MDM Console
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Security Footnote */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>ApexMDM Security Gateway • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
