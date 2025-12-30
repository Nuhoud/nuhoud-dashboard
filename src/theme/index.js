import { alpha, createTheme } from '@mui/material/styles';

// Core brand palette
const primary = '#6758cf';
const secondary = '#9c8beb';
const accent = '#ded2f6';

const shadows = [
  'none',
  '0 1px 2px rgba(31, 26, 46, 0.06)',
  '0 2px 6px rgba(31, 26, 46, 0.08)',
  '0 4px 10px rgba(31, 26, 46, 0.10)',
  '0 6px 14px rgba(31, 26, 46, 0.12)',
  '0 8px 20px rgba(31, 26, 46, 0.14)',
  ...Array(19).fill('0 12px 32px rgba(31, 26, 46, 0.16)'),
];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondary,
      contrastText: '#1f1a2e',
    },
    info: {
      main: accent,
      light: '#f2ecff',
      dark: '#c9b9f1',
      contrastText: '#1f1a2e',
    },
    accent: {
      main: accent,
      light: '#f2ecff',
      dark: '#c9b9f1',
      contrastText: '#1f1a2e',
    },
    background: {
      default: '#f6f4fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f1a2e',
      secondary: '#5e5872',
    },
    divider: alpha('#1f1a2e', 0.08),
    action: {
      hover: alpha(primary, 0.06),
      selected: alpha(primary, 0.12),
      focus: alpha(primary, 0.2),
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "IBM Plex Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2.1rem', fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: '1rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f6f4fb',
          color: '#1f1a2e',
          fontFamily: '"IBM Plex Sans", "IBM Plex Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        '::selection': {
          backgroundColor: alpha(primary, 0.2),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          fontWeight: 600,
        }),
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        containedSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
        }),
        outlinedPrimary: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.4),
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
        textPrimary: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          fontWeight: 600,
          backgroundColor: theme.palette.info.light,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.15),
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }),
      },
    },
  },
});

export default theme;
