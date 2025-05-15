import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { ThemeProviderContext, useThemeContext } from '@/contexts/ThemeContext';
import Footer from '@/components/Footer';
import { Box } from '@mui/material';

// Inner component to access both contexts (ThemeContext and MuiTheme)
function AppContent({ Component, pageProps, ...rest }: AppProps) {
  const { themeSetting } = useThemeContext();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const muiTheme = React.useMemo(() => {
    let mode: 'light' | 'dark';
    if (themeSetting === 'auto') {
      mode = prefersDarkMode ? 'dark' : 'light';
    } else {
      mode = themeSetting;
    }
    return createTheme({
      palette: {
        mode,
      },
    });
  }, [themeSetting, prefersDarkMode]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Component {...pageProps} />
        </Box>
        <Footer />
      </Box>
    </MuiThemeProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProviderContext>
      <AppContent {...props} />
    </ThemeProviderContext>
  );
}
