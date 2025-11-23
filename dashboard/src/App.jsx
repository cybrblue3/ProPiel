import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LogoShowcase from './pages/LogoShowcase';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import MedicalRecords from './pages/MedicalRecords';
import PatientMedicalHistory from './pages/PatientMedicalHistory';
import DoctorPatients from './pages/DoctorPatients';

// Smart redirect based on user role
function DashboardRedirect() {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'doctor' ? '/doctor-dashboard' : '/dashboard';
  return <Navigate to={dashboardPath} replace />;
}

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      lighter: '#e3f2fd'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    },
    success: {
      main: '#2e7d32',
      lighter: '#e8f5e9'
    },
    warning: {
      main: '#ed6c02',
      lighter: '#fff3e0'
    },
    info: {
      main: '#0288d1',
      lighter: '#e1f5fe'
    },
    error: {
      main: '#d32f2f',
      lighter: '#ffebee'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardRedirect />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor-patients"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorPatients />
                  </ProtectedRoute>
                }
              />
              <Route path="logos" element={<LogoShowcase />} />

              {/* Appointments Routes */}
              <Route
                path="appointments"
                element={<Appointments />}
              />
              <Route
                path="book-appointment"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patients"
                element={<Patients />}
              />
              <Route
                path="patients/:patientId/medical-history"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                    <PatientMedicalHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctors"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Doctors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="medical-records"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                    <MedicalRecords />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Route - Use smart redirect */}
            <Route path="*" element={<DashboardRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
