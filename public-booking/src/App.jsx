import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import BookingForm from './BookingForm';

// Same theme as dashboard
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      lighter: '#e3f2fd'
    },
    success: {
      main: '#2e7d32',
      lighter: '#e8f5e9'
    },
    info: {
      main: '#0288d1',
      lighter: '#e1f5fe'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BookingForm />
    </ThemeProvider>
  );
}

export default App;
