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
  NoteAdd as NotesIcon,
  CheckCircle as CompleteIcon,
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
  const [notesDialog, setNotesDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Medical notes form
  const [medicalNotes, setMedicalNotes] = useState({
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
    markAsCompleted: false
  });

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

    switch (tabValue) {
      case 0: // Todas
        break;
      case 1: // Confirmadas
        filtered = filtered.filter(apt => apt.status === 'confirmed');
        break;
      case 2: // Completadas
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
      case 3: // Pendientes
        filtered = filtered.filter(apt => apt.status === 'pending');
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

  const handleOpenNotes = (appointment) => {
    setSelectedAppointment(appointment);
    setMedicalNotes({
      diagnosis: appointment.diagnosis || '',
      treatment: appointment.treatment || '',
      prescriptions: appointment.prescriptions || '',
      notes: appointment.medicalNotes || '',
      markAsCompleted: false
    });
    setNotesDialog(true);
  };

  const handleSaveNotes = async () => {
    try {
      setError('');
      setSuccess('');

      const updateData = {
        diagnosis: medicalNotes.diagnosis,
        treatment: medicalNotes.treatment,
        prescriptions: medicalNotes.prescriptions,
        medicalNotes: medicalNotes.notes
      };

      // If marking as completed, include status update
      if (medicalNotes.markAsCompleted) {
        updateData.status = 'completed';
      }

      await axios.put(
        `${API_URL}/appointments/${selectedAppointment.id}/medical-notes`,
        updateData,
        { headers: getAuthHeader() }
      );

      setSuccess('Notas médicas guardadas exitosamente');
      setNotesDialog(false);
      loadTodayAppointments();
      resetNotesForm();
    } catch (err) {
      console.error('Error saving medical notes:', err);
      setError(err.response?.data?.message || 'Error al guardar notas médicas');
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setError('');
      setSuccess('');

      await axios.patch(
        `${API_URL}/appointments/${appointmentId}/complete`,
        {},
        { headers: getAuthHeader() }
      );

      setSuccess('Cita marcada como completada');
      loadTodayAppointments();
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Error al completar la cita');
    }
  };

  const resetNotesForm = () => {
    setMedicalNotes({
      diagnosis: '',
      treatment: '',
      prescriptions: '',
      notes: '',
      markAsCompleted: false
    });
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
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
          <Tab label={`Completadas (${appointments.filter(a => a.status === 'completed').length})`} />
          <Tab label={`Pendientes (${appointments.filter(a => a.status === 'pending').length})`} />
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
                      <IconButton
                        color="info"
                        onClick={() => handleOpenNotes(appointment)}
                        title="Notas médicas"
                      >
                        <NotesIcon />
                      </IconButton>
                      {appointment.status !== 'completed' && (
                        <IconButton
                          color="success"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          title="Marcar como completada"
                        >
                          <CompleteIcon />
                        </IconButton>
                      )}
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
        <DialogTitle>Información del Paciente</DialogTitle>
        <DialogContent>
          {selectedAppointment && selectedAppointment.Patient && (
            <Box sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Datos Personales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Nombre:</strong> {selectedAppointment.Patient.fullName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Fecha de Nacimiento:</strong> {selectedAppointment.Patient.birthDate || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Teléfono:</strong> {selectedAppointment.Patient.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Email:</strong> {selectedAppointment.Patient.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Tipo de Sangre:</strong> {selectedAppointment.Patient.bloodType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Sexo:</strong> {selectedAppointment.Patient.gender === 'female' ? 'Femenino' : 'Masculino'}</Typography>
                  </Grid>
                  {selectedAppointment.Patient.allergies && (
                    <Grid item xs={12}>
                      <Typography color="error.main"><strong>Alergias:</strong> {selectedAppointment.Patient.allergies}</Typography>
                    </Grid>
                  )}
                  {selectedAppointment.Patient.notes && (
                    <Grid item xs={12}>
                      <Typography><strong>Notas:</strong> {selectedAppointment.Patient.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Cita Actual
                </Typography>
                <Typography><strong>Servicio:</strong> {selectedAppointment.Service?.name}</Typography>
                <Typography><strong>Fecha:</strong> {formatDate(selectedAppointment.appointmentDate)}</Typography>
                <Typography><strong>Hora:</strong> {selectedAppointment.appointmentTime}</Typography>
                {selectedAppointment.notes && (
                  <Typography><strong>Motivo:</strong> {selectedAppointment.notes}</Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Medical Notes Dialog */}
      <Dialog open={notesDialog} onClose={() => setNotesDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Notas Médicas - {selectedAppointment?.Patient?.fullName}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnóstico"
                multiline
                rows={2}
                value={medicalNotes.diagnosis}
                onChange={(e) => setMedicalNotes({ ...medicalNotes, diagnosis: e.target.value })}
                placeholder="Diagnóstico del paciente..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tratamiento"
                multiline
                rows={2}
                value={medicalNotes.treatment}
                onChange={(e) => setMedicalNotes({ ...medicalNotes, treatment: e.target.value })}
                placeholder="Tratamiento recomendado..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prescripciones / Medicamentos"
                multiline
                rows={3}
                value={medicalNotes.prescriptions}
                onChange={(e) => setMedicalNotes({ ...medicalNotes, prescriptions: e.target.value })}
                placeholder="Medicamentos recetados, dosis, etc..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas Adicionales"
                multiline
                rows={3}
                value={medicalNotes.notes}
                onChange={(e) => setMedicalNotes({ ...medicalNotes, notes: e.target.value })}
                placeholder="Observaciones, indicaciones, próximos pasos..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={medicalNotes.markAsCompleted}
                  onChange={(e) => setMedicalNotes({ ...medicalNotes, markAsCompleted: e.target.checked })}
                  id="markCompleted"
                />
                <label htmlFor="markCompleted">
                  <Typography variant="body2">
                    Marcar cita como completada al guardar
                  </Typography>
                </label>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveNotes} variant="contained">
            Guardar Notas
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashboard;
