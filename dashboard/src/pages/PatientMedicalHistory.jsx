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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar
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
  Print as PrintIcon,
  NoteAdd as NoteIcon
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

  // Dialog states
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Prescription form
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Note form
  const [noteForm, setNoteForm] = useState({
    note: ''
  });

  // Photo dialog
  const [photoDialog, setPhotoDialog] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    file: null,
    description: ''
  });
  const [uploading, setUploading] = useState(false);

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

  // Handle prescription submission
  const handleAddPrescription = async () => {
    try {
      // For now, we'll need a medical case to add a prescription
      // If no cases exist, show an alert
      if (medicalCases.length === 0) {
        setError('Primero debe crear un caso médico para agregar recetas');
        setPrescriptionDialog(false);
        return;
      }

      // Use the first active case or most recent case
      const activeCase = medicalCases.find(c => c.status === 'En Tratamiento') || medicalCases[0];

      await axios.post(`${API_URL}/prescriptions`, {
        medicalCaseId: activeCase.id,
        ...prescriptionForm,
        prescribedDate: new Date().toISOString().split('T')[0]
      }, {
        headers: getAuthHeader()
      });

      setSuccessMessage('Receta agregada exitosamente');
      setPrescriptionDialog(false);
      setPrescriptionForm({
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
      loadMedicalHistory(); // Reload data
    } catch (err) {
      console.error('Error adding prescription:', err);
      setError('Error al agregar la receta');
    }
  };

  // Handle note submission (adds to patient notes)
  const handleAddNote = async () => {
    try {
      const currentNotes = patient.notes || '';
      const timestamp = new Date().toLocaleDateString('es-MX');
      const newNote = `[${timestamp}] ${noteForm.note}`;
      const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote;

      await axios.put(`${API_URL}/patients/${patientId}`, {
        notes: updatedNotes
      }, {
        headers: getAuthHeader()
      });

      setSuccessMessage('Nota agregada exitosamente');
      setNoteDialog(false);
      setNoteForm({ note: '' });
      loadMedicalHistory(); // Reload data
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Error al agregar la nota');
    }
  };

  // Handle appointment receipt PDF download
  const handleDownloadAppointmentReceipt = async (appointmentId) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/${appointmentId}/pdf`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_cita_${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Comprobante descargado exitosamente');
    } catch (err) {
      console.error('Error downloading appointment receipt:', err);
      setError('Error al descargar el comprobante');
    }
  };

  // Handle prescription PDF download
  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      const response = await axios.get(`${API_URL}/prescriptions/${prescriptionId}/pdf`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receta_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage('PDF descargado exitosamente');
    } catch (err) {
      console.error('Error downloading prescription PDF:', err);
      setError('Error al descargar el PDF');
    }
  };

  // Handle photo upload
  const handleAddPhoto = async () => {
    try {
      if (medicalCases.length === 0) {
        setError('Primero debe crear un caso médico para agregar fotos');
        setPhotoDialog(false);
        return;
      }

      if (!photoForm.file) {
        setError('Por favor seleccione una imagen');
        return;
      }

      setUploading(true);

      const activeCase = medicalCases.find(c => c.status === 'En Tratamiento') || medicalCases[0];

      const formData = new FormData();
      formData.append('photo', photoForm.file);
      formData.append('medicalCaseId', activeCase.id);
      formData.append('description', photoForm.description);
      formData.append('dateTaken', new Date().toISOString().split('T')[0]);

      await axios.post(`${API_URL}/photos`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Foto agregada exitosamente');
      setPhotoDialog(false);
      setPhotoForm({ file: null, description: '' });
      loadMedicalHistory();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Error al subir la foto');
    } finally {
      setUploading(false);
    }
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
              <TableCell align="center">Acciones</TableCell>
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
                <TableCell align="center">
                  <Tooltip title="Descargar comprobante">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownloadAppointmentReceipt(apt.id)}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
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
              <TableCell align="center">Acciones</TableCell>
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
                <TableCell align="center">
                  <Tooltip title="Descargar PDF">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownloadPrescription(rx.id)}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
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
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {getInitials(patient.fullName)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {patient.fullName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    ID: #{patient.id} • {calculateAge(patient.birthDate)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Stats */}
            <Grid item xs={12} md={6}>
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

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<MedicationIcon />}
          onClick={() => setPrescriptionDialog(true)}
          size="small"
        >
          Nueva Receta
        </Button>
        <Button
          variant="outlined"
          startIcon={<NoteIcon />}
          onClick={() => setNoteDialog(true)}
          size="small"
        >
          Agregar Nota
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoIcon />}
          onClick={() => setPhotoDialog(true)}
          size="small"
        >
          Agregar Foto
        </Button>
      </Box>

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

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialog} onClose={() => setPrescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Receta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Medicamento"
              value={prescriptionForm.medicationName}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Dosis"
              value={prescriptionForm.dosage}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
              fullWidth
              placeholder="Ej: 500mg"
            />
            <TextField
              label="Frecuencia"
              value={prescriptionForm.frequency}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
              fullWidth
              placeholder="Ej: Cada 8 horas"
            />
            <TextField
              label="Duración"
              value={prescriptionForm.duration}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
              fullWidth
              placeholder="Ej: 7 días"
            />
            <TextField
              label="Instrucciones adicionales"
              value={prescriptionForm.instructions}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Ej: Tomar con alimentos, evitar el sol..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAddPrescription}
            variant="contained"
            disabled={!prescriptionForm.medicationName}
          >
            Guardar Receta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nota al Expediente</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Nota"
              value={noteForm.note}
              onChange={(e) => setNoteForm({ note: e.target.value })}
              fullWidth
              multiline
              rows={4}
              placeholder="Escriba una nota para el expediente del paciente..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAddNote}
            variant="contained"
            disabled={!noteForm.note}
          >
            Guardar Nota
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Foto Médica</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoIcon />}
              sx={{ py: 2 }}
            >
              {photoForm.file ? photoForm.file.name : 'Seleccionar Imagen'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setPhotoForm({ ...photoForm, file: e.target.files[0] })}
              />
            </Button>
            {photoForm.file && (
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src={URL.createObjectURL(photoForm.file)}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                />
              </Box>
            )}
            <TextField
              label="Descripción (opcional)"
              value={photoForm.description}
              onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Ej: Lesión en antebrazo derecho, día 1 de tratamiento..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAddPhoto}
            variant="contained"
            disabled={!photoForm.file || uploading}
          >
            {uploading ? 'Subiendo...' : 'Guardar Foto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default PatientMedicalHistory;
