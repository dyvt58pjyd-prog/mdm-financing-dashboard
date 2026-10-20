import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#06b6d4', // cyan-500
      light: '#38bdf8',
      dark: '#0891b2',
      contrastText: '#0f172a'
    },
    secondary: {
      main: '#6366f1', // indigo-500
      light: '#818cf8',
      dark: '#4f46e5'
    },
    error: {
      main: '#f43f5e', // rose-500
      light: '#fb7185',
      dark: '#e11d48'
    },
    warning: {
      main: '#f59e0b', // amber-500
      light: '#fbbf24',
      dark: '#d97706'
    },
    success: {
      main: '#10b981', // emerald-500
      light: '#34d399',
      dark: '#059669'
    },
    background: {
      default: '#030712',
      paper: '#0b1120'
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#94a3b8'
    },
    divider: 'rgba(255, 255, 255, 0.08)'
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0b1120',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0b1120',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '14px 16px'
        },
        head: {
          backgroundColor: '#070b14',
          color: '#94a3b8',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8
        }
      }
    }
  }
});
