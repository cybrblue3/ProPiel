// Patient Medical History - Complete medical timeline and records
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  ArrowBack as BackIcon,
  Event as EventIcon,
  LocalHospital as CaseIcon,
  Medication as MedicationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  PhotoCamera as PhotoIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const PatientMedicalHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalCases, setMedicalCases] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    loadMedicalHistory();
  }, [patientId]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/patients/${patientId}/medical-history`, {
        headers: getAuthHeader()
      });

      const data = response.data.data;
      setPatient(data.patient);
      setAppointments(data.appointments);
      setMedicalCases(data.medicalCases);
      setPrescriptions(data.prescriptions);
      setTimeline(data.timeline);
    } catch (err) {
      console.error('Error loading medical history:', err);
      setError('Error al cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'warning' },
      confirmed: { label: 'Confirmada', color: 'success' },
      cancelled: { label: 'Cancelada', color: 'error' },
      completed: { label: 'Completada', color: 'info' },
      'no-show': { label: 'No asistió', color: 'default' },
      'En Tratamiento': { label: 'En Tratamiento', color: 'primary' },
      'Curado': { label: 'Curado', color: 'success' },
      'Crónico': { label: 'Crónico', color: 'warning' },
      'Inactivo': { label: 'Inactivo', color: 'default' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getSeverityChip = (severity) => {
    const config = {
      'Leve': { color: 'success' },
      'Moderado': { color: 'warning' },
      'Severo': { color: 'error' }
    };
    return <Chip label={severity} color={config[severity]?.color || 'default'} size="small" />;
  };

  // Timeline Tab Content
  const renderTimelineTab = () => {
    if (timeline.length === 0) {
      return (
        <Alert severity="info">
          No hay registros en el historial médico de este paciente
        </Alert>
      );
    }

    return (
      <Timeline position="right">
        {timeline.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent color="text.secondary">
              <Typography variant="body2">
                {formatDate(item.date)}
                {item.time && ` - ${formatTime(item.time)}`}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={item.type === 'appointment' ? 'primary' : 'secondary'}>
                {item.type === 'appointment' ? <EventIcon /> : <CaseIcon />}
              </TimelineDot>
              {index < timeline.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {item.type === 'appointment' && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Cita - {item.data.Service?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dr. {item.data.Doctor?.fullName}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {getStatusChip(item.data.status)}
                    </Box>
                  </CardContent>
                </Card>
              )}
              {item.type === 'case_started' && (
                <Card variant="outlined" sx={{ bgcolor: 'secondary.lighter' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Caso Iniciado: {item.data.conditionName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dr. {item.data.Doctor?.fullName} - {item.data.specialty}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      {getSeverityChip(item.data.severity)}
                      {getStatusChip(item.data.status)}
                    </Box>
                  </CardContent>
                </Card>
              )}
              {item.type === 'case_ended' && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Caso Finalizado: {item.data.conditionName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getStatusChip(item.data.status)}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  // Appointments Tab Content
  const renderAppointmentsTab = () => {
    if (appointments.length === 0) {
      return (
        <Alert severity="info">
          Este paciente no tiene citas registradas
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha/Hora</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((apt) => (
              <TableRow key={apt.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(apt.appointmentDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(apt.appointmentTime)}
                  </Typography>
                </TableCell>
                <TableCell>{apt.Service?.name}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {apt.Doctor?.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {apt.Doctor?.specialty}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(apt.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Medical Cases Tab Content
  const renderMedicalCasesTab = () => {
    if (medicalCases.length === 0) {
      return (
        <Alert severity="info">
          Este paciente no tiene casos médicos registrados
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {medicalCases.map((medCase) => (
          <Grid item xs={12} key={medCase.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {medCase.conditionName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {getSeverityChip(medCase.severity)}
                    {getStatusChip(medCase.status)}
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Doctor:</strong> Dr. {medCase.Doctor?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Especialidad:</strong> {medCase.specialty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Inicio:</strong> {formatDate(medCase.startDate)}
                    </Typography>
                    {medCase.endDate && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Fin:</strong> {formatDate(medCase.endDate)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {medCase.symptoms && (
                      <Typography variant="body2">
                        <strong>Síntomas:</strong> {medCase.symptoms}
                      </Typography>
                    )}
                    {medCase.affectedArea && (
                      <Typography variant="body2">
                        <strong>Área afectada:</strong> {medCase.affectedArea}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {medCase.Prescriptions && medCase.Prescriptions.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Recetas de este caso:
                    </Typography>
                    {medCase.Prescriptions.map((rx) => (
                      <Box key={rx.id} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="body2">
                          💊 {rx.medicationName}
                          {rx.dosage && ` - ${rx.dosage}`}
                          {rx.frequency && ` - ${rx.frequency}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(rx.prescribedDate)}
                        </Typography>
                      </Box>
                    ))}
                  </>
                )}

                {medCase.Photos && medCase.Photos.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Fotos: {medCase.Photos.length}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Prescriptions Tab Content
  const renderPrescriptionsTab = () => {
    if (prescriptions.length === 0) {
      return (
        <Alert severity="info">
          Este paciente no tiene recetas registradas
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medicamento</TableCell>
              <TableCell>Dosis / Frecuencia</TableCell>
              <TableCell>Caso Médico</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((rx) => (
              <TableRow key={rx.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {rx.medicationName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {rx.dosage && <Typography variant="body2">{rx.dosage}</Typography>}
                  {rx.frequency && (
                    <Typography variant="caption" color="text.secondary">
                      {rx.frequency}
                    </Typography>
                  )}
                  {rx.duration && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Duración: {rx.duration}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {rx.MedicalCase?.conditionName}
                  </Typography>
                  <Chip
                    label={rx.MedicalCase?.status}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </TableCell>
                <TableCell>
                  {rx.MedicalCase?.Doctor?.fullName}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(rx.prescribedDate)}
                  </Typography>
                  {rx.Appointment && (
                    <Typography variant="caption" color="text.secondary">
                      Cita: {formatDate(rx.Appointment.appointmentDate)}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Paciente no encontrado</Alert>
      </Box>
    );
  }

  // Calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  // Get patient initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Box>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          size="small"
        >
          Volver
        </Button>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Expediente del Paciente
        </Typography>
      </Box>

      {/* Patient Profile Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
        <CardContent sx={{ color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            {/* Avatar and Name */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {getInitials(patient.fullName)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {patient.fullName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    ID: #{patient.id}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CakeIcon fontSize="small" />
                  <Typography variant="body2">{calculateAge(patient.birthDate)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{patient.phone || 'Sin teléfono'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">{patient.email || 'Sin email'}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Stats */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">{appointments.length}</Typography>
                  <Typography variant="caption">Citas</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">{medicalCases.length}</Typography>
                  <Typography variant="caption">Condiciones</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">{prescriptions.length}</Typography>
                  <Typography variant="caption">Recetas</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Allergies Warning */}
      {patient.allergies && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>⚠️ Alergias:</strong> {patient.allergies}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Historial" icon={<EventIcon />} iconPosition="start" />
          <Tab label={`Condiciones (${medicalCases.length})`} icon={<CaseIcon />} iconPosition="start" />
          <Tab label={`Recetas (${prescriptions.length})`} icon={<MedicationIcon />} iconPosition="start" />
          <Tab label={`Citas (${appointments.length})`} icon={<EventIcon />} iconPosition="start" />
          <Tab label="Datos Personales" icon={<PersonIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && renderTimelineTab()}
        {activeTab === 1 && renderMedicalCasesTab()}
        {activeTab === 2 && renderPrescriptionsTab()}
        {activeTab === 3 && renderAppointmentsTab()}
        {activeTab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Datos de Contacto
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Nombre:</strong> {patient.fullName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Teléfono:</strong> {patient.phone || 'No registrado'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Email:</strong> {patient.email || 'No registrado'}
                        </Typography>
                      </Box>
                      {patient.address && (
                        <Typography variant="body2">
                          <strong>Dirección:</strong> {patient.address}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Información Médica
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CakeIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Fecha de nacimiento:</strong> {patient.birthDate ? formatDate(patient.birthDate) : 'No registrada'}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        <strong>Sexo:</strong> {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'No especificado'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tipo de sangre:</strong> {patient.bloodType || 'No registrado'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {patient.allergies && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        <strong>Alergias:</strong> {patient.allergies}
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                {patient.notes && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Notas
                      </Typography>
                      <Typography variant="body2">{patient.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default PatientMedicalHistory;
