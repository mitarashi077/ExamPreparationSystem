import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,  
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
        },
        body: {
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
        },
        '*': {
          writingMode: 'horizontal-tb !important',
          textOrientation: 'mixed !important',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
          direction: 'ltr',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          fontSize: '1rem',
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
          '@media (max-width: 600px)': {
            minHeight: '56px',
            fontSize: '1.1rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
          '@media (max-width: 600px)': {
            margin: '8px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
        },
      },
    },
  },
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)