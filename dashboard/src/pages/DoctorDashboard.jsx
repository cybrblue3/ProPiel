import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  FolderShared as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Parse date as local time to avoid timezone shift
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [patientDialog, setPatientDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [tabValue, appointments]);

  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/appointments/doctor/today`, {
        headers: getAuthHeader()
      });

      setAppointments(response.data.data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    const todayStr = new Date().toISOString().split('T')[0];

    switch (tabValue) {
      case 0: // Todas
        break;
      case 1: // Confirmadas
        filtered = filtered.filter(apt => apt.status === 'confirmed');
        break;
      case 2: // Citas de Hoy
        filtered = filtered.filter(apt =>
          apt.appointmentDate === todayStr &&
          (apt.status === 'confirmed' || apt.status === 'en_consulta' || apt.status === 'completada')
        );
        break;
      case 3: // Completadas
        filtered = filtered.filter(apt => apt.status === 'completada');
        break;
      default:
        break;
    }

    setFilteredAppointments(filtered);
  };

  const handleViewPatient = async (appointment) => {
    try {
      // Load full patient details including history
      const response = await axios.get(`${API_URL}/patients/${appointment.patientId}`, {
        headers: getAuthHeader()
      });

      setSelectedAppointment({
        ...appointment,
        Patient: response.data.data
      });
      setPatientDialog(true);
    } catch (err) {
      console.error('Error loading patient details:', err);
      setError('Error al cargar datos del paciente');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'completada':
        return 'info';
      case 'en_consulta':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'completada':
        return 'Completada';
      case 'en_consulta':
        return 'En Consulta';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'no_show':
        return 'No Asistió';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Mi Agenda - {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, Dr. {user?.fullName}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs for filtering */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Todas (${appointments.length})`} />
          <Tab label={`Confirmadas (${appointments.filter(a => a.status === 'confirmed').length})`} />
          <Tab label={`Citas de Hoy (${(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            return appointments.filter(a =>
              a.appointmentDate === todayStr &&
              (a.status === 'confirmed' || a.status === 'en_consulta' || a.status === 'completada')
            ).length;
          })()})`} />
          <Tab label={`Completadas (${appointments.filter(a => a.status === 'completada').length})`} />
        </Tabs>
      </Card>

      {/* Appointments List */}
      {loading ? (
        <Card>
          <CardContent>
            <Typography align="center">Cargando citas...</Typography>
          </CardContent>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              No hay citas para hoy
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredAppointments.map((appointment) => (
            <Grid item xs={12} key={appointment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                          label={getStatusLabel(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon fontSize="small" />
                          {appointment.appointmentTime}
                        </Typography>
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        {appointment.Patient?.fullName || 'Paciente'}
                      </Typography>

                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Servicio:</strong> {appointment.Service?.name || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Teléfono:</strong> {appointment.Patient?.phone || 'N/A'}
                          </Typography>
                        </Grid>
                        {appointment.notes && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Motivo:</strong> {appointment.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewPatient(appointment)}
                        title="Ver paciente"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => navigate(`/patients/${appointment.patientId}/medical-history`)}
                        title="Ver historial médico"
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={patientDialog} onClose={() => setPatientDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Información del Paciente
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedAppointment && selectedAppointment.Patient && (
            <Box>
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Datos Personales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2"><strong>Nombre:</strong> {selectedAppointment.Patient.fullName}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2"><strong>Fecha de Nacimiento:</strong> {selectedAppointment.Patient.birthDate || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2"><strong>Teléfono:</strong> {selectedAppointment.Patient.phone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2"><strong>Email:</strong> {selectedAppointment.Patient.email || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Tipo de Sangre:</strong> {selectedAppointment.Patient.bloodType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Sexo:</strong> {selectedAppointment.Patient.gender === 'female' ? 'Femenino' : 'Masculino'}</Typography>
                  </Grid>
                  {selectedAppointment.Patient.allergies && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="error.main"><strong>⚠️ Alergias:</strong> {selectedAppointment.Patient.allergies}</Typography>
                    </Grid>
                  )}
                  {selectedAppointment.Patient.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Notas:</strong> {selectedAppointment.Patient.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Cita Actual
                </Typography>
                <Typography variant="body2"><strong>Servicio:</strong> {selectedAppointment.Service?.name}</Typography>
                <Typography variant="body2"><strong>Fecha:</strong> {formatDate(selectedAppointment.appointmentDate)}</Typography>
                <Typography variant="body2"><strong>Hora:</strong> {selectedAppointment.appointmentTime}</Typography>
                {selectedAppointment.notes && (
                  <Typography variant="body2"><strong>Motivo:</strong> {selectedAppointment.notes}</Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setPatientDialog(false)} variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashboard;
