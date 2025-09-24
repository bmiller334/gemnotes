import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: grey[900], // A deep, cool grey
    },
    secondary: {
      main: grey[500],
    },
    background: {
      default: grey[50], // A very light grey for the page background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
        fontWeight: 700,
    },
    h2: {
        fontWeight: 700,
    },
    h3: {
        fontWeight: 600,
    },
    h4: {
        fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: grey[900],
          boxShadow: 'none',
          borderBottom: `1px solid ${grey[200]}`,
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: 12, // More rounded corners
                border: `1px solid ${grey[200]}`,
            }
        }
    },
    MuiButton: {
      styleOverrides: {
        contained: {
            boxShadow: 'none',
            '&:hover': {
                boxShadow: 'none',
            }
        }
      }
    }
  },
});

export default theme;
