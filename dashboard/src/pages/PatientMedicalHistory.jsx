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
// Removed MUI Lab Timeline - using custom horizontal carousel instead
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
  NoteAdd as NoteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Circle as CircleIcon,
  Wc as GenderIcon,
  Bloodtype as BloodtypeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
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

  // Carousel state for horizontal timeline
  const [timelineIndex, setTimelineIndex] = useState(0);
  const itemsPerView = 3; // Number of items visible at once

  // Dialog states
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Prescription form
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicalCaseId: '',
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
    medicalCaseId: '',
    file: null,
    description: ''
  });
  const [uploading, setUploading] = useState(false);

  // Photo gallery dialog
  const [photoGalleryDialog, setPhotoGalleryDialog] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotosCaseName, setSelectedPhotosCaseName] = useState('');

  // Appointment details dialog
  const [appointmentDetailsDialog, setAppointmentDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Handle photo delete
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('¿Está seguro de eliminar esta foto?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/photos/${photoId}`, {
        headers: getAuthHeader()
      });

      // Remove from selectedPhotos state
      setSelectedPhotos(prev => prev.filter(p => p.id !== photoId));
      setSuccessMessage('Foto eliminada exitosamente');
      loadMedicalHistory();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Error al eliminar la foto');
    }
  };

  // Medical Case dialog
  const [caseDialog, setCaseDialog] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [caseForm, setCaseForm] = useState({
    conditionName: '',
    specialty: 'Dermatología',
    severity: 'Moderado',
    symptoms: '',
    affectedArea: '',
    status: 'En Tratamiento'
  });

  // Note editing state
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editNoteValue, setEditNoteValue] = useState('');

  // Personal data editing states
  const [editingPersonalData, setEditingPersonalData] = useState(false);
  const [personalDataForm, setPersonalDataForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    bloodType: '',
    allergies: ''
  });

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

  // Open prescription dialog for new prescription
  const handleOpenPrescriptionDialog = () => {
    if (medicalCases.length === 0) {
      setError('Primero debe crear un diagnóstico médico para agregar recetas');
      return;
    }

    // Auto-select if only one medical case
    const defaultCaseId = medicalCases.length === 1 ? medicalCases[0].id : '';

    setEditingPrescriptionId(null);
    setPrescriptionForm({
      medicalCaseId: defaultCaseId,
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setPrescriptionDialog(true);
  };

  // Open prescription dialog for editing
  const handleEditPrescription = (prescription) => {
    setEditingPrescriptionId(prescription.id);
    setPrescriptionForm({
      medicalCaseId: prescription.medicalCaseId || prescription.MedicalCase?.id || '',
      medicationName: prescription.medicationName || '',
      dosage: prescription.dosage || '',
      frequency: prescription.frequency || '',
      duration: prescription.duration || '',
      instructions: prescription.instructions || ''
    });
    setPrescriptionDialog(true);
  };

  // Handle prescription submission (create or update)
  const handleSavePrescription = async () => {
    try {
      if (!prescriptionForm.medicalCaseId) {
        setError('Debe seleccionar un diagnóstico médico');
        return;
      }

      if (editingPrescriptionId) {
        // Update existing prescription
        await axios.put(`${API_URL}/prescriptions/${editingPrescriptionId}`, {
          medicalCaseId: prescriptionForm.medicalCaseId,
          medicationName: prescriptionForm.medicationName,
          dosage: prescriptionForm.dosage,
          frequency: prescriptionForm.frequency,
          duration: prescriptionForm.duration,
          instructions: prescriptionForm.instructions
        }, {
          headers: getAuthHeader()
        });
        setSuccessMessage('Receta actualizada exitosamente');
      } else {
        // Create new prescription
        await axios.post(`${API_URL}/prescriptions`, {
          medicalCaseId: prescriptionForm.medicalCaseId,
          medicationName: prescriptionForm.medicationName,
          dosage: prescriptionForm.dosage,
          frequency: prescriptionForm.frequency,
          duration: prescriptionForm.duration,
          instructions: prescriptionForm.instructions,
          prescribedDate: new Date().toISOString().split('T')[0]
        }, {
          headers: getAuthHeader()
        });
        setSuccessMessage('Receta agregada exitosamente');
      }

      setPrescriptionDialog(false);
      setEditingPrescriptionId(null);
      setPrescriptionForm({
        medicalCaseId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
      loadMedicalHistory();
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Error al guardar la receta');
    }
  };

  // Handle prescription deletion
  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('¿Está seguro de eliminar esta receta?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/prescriptions/${prescriptionId}`, {
        headers: getAuthHeader()
      });
      setSuccessMessage('Receta eliminada exitosamente');
      loadMedicalHistory();
    } catch (err) {
      console.error('Error deleting prescription:', err);
      setError('Error al eliminar la receta');
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

  // Handle note edit
  const handleEditNote = (index, noteText) => {
    setEditingNoteIndex(index);
    // Remove the timestamp prefix if present for editing
    const cleanNote = noteText.replace(/^\[\d{1,2}\/\d{1,2}\/\d{4}\]\s*/, '');
    setEditNoteValue(cleanNote);
  };

  // Handle note save after edit
  const handleSaveEditedNote = async () => {
    try {
      const notes = patient.notes.split('\n\n');
      const timestamp = new Date().toLocaleDateString('es-MX');
      notes[editingNoteIndex] = `[${timestamp}] ${editNoteValue} (editado)`;
      const updatedNotes = notes.join('\n\n');

      await axios.put(`${API_URL}/patients/${patientId}`, {
        notes: updatedNotes
      }, {
        headers: getAuthHeader()
      });

      setSuccessMessage('Nota actualizada exitosamente');
      setEditingNoteIndex(null);
      setEditNoteValue('');
      loadMedicalHistory();
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Error al actualizar la nota');
    }
  };

  // Handle note delete
  const handleDeleteNote = async (index) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota?')) {
      return;
    }

    try {
      const notes = patient.notes.split('\n\n');
      notes.splice(index, 1);
      const updatedNotes = notes.join('\n\n');

      await axios.put(`${API_URL}/patients/${patientId}`, {
        notes: updatedNotes || null
      }, {
        headers: getAuthHeader()
      });

      setSuccessMessage('Nota eliminada exitosamente');
      loadMedicalHistory();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Error al eliminar la nota');
    }
  };

  // Handle personal data edit - open edit mode with existing data
  const handleEditPersonalData = () => {
    setPersonalDataForm({
      fullName: patient.fullName || '',
      phone: patient.phone || '',
      email: patient.email || '',
      birthDate: patient.birthDate || '',
      gender: patient.gender || '',
      bloodType: patient.bloodType || '',
      allergies: patient.allergies || ''
    });
    setEditingPersonalData(true);
  };

  // Handle personal data save
  const handleSavePersonalData = async () => {
    try {
      await axios.put(`${API_URL}/patients/${patientId}`, personalDataForm, {
        headers: getAuthHeader()
      });

      setSuccessMessage('Datos personales actualizados exitosamente');
      setEditingPersonalData(false);
      loadMedicalHistory();
    } catch (err) {
      console.error('Error updating personal data:', err);
      setError('Error al actualizar los datos personales');
    }
  };

  // Handle personal data cancel
  const handleCancelPersonalData = () => {
    setEditingPersonalData(false);
    setPersonalDataForm({
      fullName: '',
      phone: '',
      email: '',
      birthDate: '',
      gender: '',
      bloodType: '',
      allergies: ''
    });
  };

  // Handle medical case edit - open dialog with existing data
  const handleEditMedicalCase = (medCase) => {
    setEditingCaseId(medCase.id);
    setCaseForm({
      conditionName: medCase.conditionName || '',
      specialty: medCase.specialty || 'Dermatología',
      severity: medCase.severity || 'Moderado',
      symptoms: medCase.symptoms || '',
      affectedArea: medCase.affectedArea || '',
      status: medCase.status || 'En Tratamiento'
    });
    setCaseDialog(true);
  };

  // Handle medical case delete
  const handleDeleteMedicalCase = async (caseId) => {
    if (!window.confirm('¿Está seguro de eliminar este diagnóstico? También se eliminarán las recetas y fotos asociadas.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/medical-cases/${caseId}`, {
        headers: getAuthHeader()
      });

      setSuccessMessage('Diagnóstico eliminado exitosamente');
      loadMedicalHistory();
    } catch (err) {
      console.error('Error deleting medical case:', err);
      setError('Error al eliminar el diagnóstico');
    }
  };

  // Handle expediente PDF download
  const handleDownloadExpediente = async () => {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/expediente-pdf`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expediente_${patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Expediente descargado exitosamente');
    } catch (err) {
      console.error('Error downloading expediente PDF:', err);
      setError('Error al descargar el expediente');
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

  // Handle view appointment details
  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsDialog(true);
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

  // Open photo dialog
  const handleOpenPhotoDialog = () => {
    if (medicalCases.length === 0) {
      setError('Primero debe crear un diagnóstico médico para agregar fotos');
      return;
    }

    // Auto-select if only one medical case
    const defaultCaseId = medicalCases.length === 1 ? medicalCases[0].id : '';

    setPhotoForm({
      medicalCaseId: defaultCaseId,
      file: null,
      description: ''
    });
    setPhotoDialog(true);
  };

  // Handle photo upload
  const handleAddPhoto = async () => {
    try {
      if (!photoForm.medicalCaseId) {
        setError('Debe seleccionar un diagnóstico médico');
        return;
      }

      if (!photoForm.file) {
        setError('Por favor seleccione una imagen');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('photo', photoForm.file);
      formData.append('medicalCaseId', photoForm.medicalCaseId);
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
      setPhotoForm({ medicalCaseId: '', file: null, description: '' });
      loadMedicalHistory();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  // Handle medical case creation or update
  const handleSaveMedicalCase = async () => {
    try {
      if (editingCaseId) {
        // Update existing case
        const response = await axios.put(`${API_URL}/medical-cases/${editingCaseId}`, {
          conditionName: caseForm.conditionName,
          specialty: caseForm.specialty,
          severity: caseForm.severity,
          symptoms: caseForm.symptoms,
          affectedArea: caseForm.affectedArea,
          status: caseForm.status
        }, {
          headers: getAuthHeader()
        });

        if (response.data.success) {
          setSuccessMessage('Diagnóstico actualizado exitosamente');
        }
      } else {
        // Create new case
        const response = await axios.post(`${API_URL}/medical-cases`, {
          patientId: parseInt(patientId),
          conditionName: caseForm.conditionName,
          specialty: caseForm.specialty,
          severity: caseForm.severity,
          symptoms: caseForm.symptoms,
          affectedArea: caseForm.affectedArea,
          status: caseForm.status,
          startDate: new Date().toISOString().split('T')[0]
        }, {
          headers: getAuthHeader()
        });

        if (response.data.success) {
          setSuccessMessage('Diagnóstico creado exitosamente');
        }
      }

      setCaseDialog(false);
      setEditingCaseId(null);
      setCaseForm({
        conditionName: '',
        specialty: 'Dermatología',
        severity: 'Moderado',
        symptoms: '',
        affectedArea: '',
        status: 'En Tratamiento'
      });
      loadMedicalHistory();
    } catch (err) {
      console.error('Error saving medical case:', err);
      setError(err.response?.data?.message || 'Error al guardar el diagnóstico');
    }
  };

  // Open dialog for new medical case
  const handleOpenNewCaseDialog = () => {
    setEditingCaseId(null);
    setCaseForm({
      conditionName: '',
      specialty: 'Dermatología',
      severity: 'Moderado',
      symptoms: '',
      affectedArea: '',
      status: 'En Tratamiento'
    });
    setCaseDialog(true);
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

  // Carousel navigation handlers
  const handlePrevTimeline = () => {
    setTimelineIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTimeline = () => {
    setTimelineIndex(prev => Math.min(timeline.length - itemsPerView, prev + 1));
  };

  // Timeline Tab Content - Horizontal Carousel with Notes
  const renderTimelineTab = () => {
    const canGoPrev = timelineIndex > 0;
    const canGoNext = timelineIndex < timeline.length - itemsPerView;

    return (
      <Box>
        {/* Horizontal Timeline Carousel */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            Línea de Tiempo
          </Typography>

          {timeline.length === 0 ? (
            <Alert severity="info">
              No hay registros en el historial médico de este paciente
            </Alert>
          ) : (
            <Box>
              {/* Timeline line with dots */}
              <Box sx={{ position: 'relative', py: 2 }}>
                {/* Horizontal line - behind cards */}
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  left: 40,
                  right: 40,
                  height: 3,
                  bgcolor: 'primary.light',
                  borderRadius: 1,
                  zIndex: 0
                }} />

                {/* Navigation and cards container */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, position: 'relative', zIndex: 1 }}>
                  {/* Left Arrow */}
                  <IconButton
                    onClick={handlePrevTimeline}
                    disabled={!canGoPrev}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'primary.lighter' },
                      '&:disabled': { opacity: 0.3 }
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>

                  {/* Timeline Cards */}
                  <Box sx={{
                    display: 'flex',
                    gap: 2,
                    flex: 1,
                    overflow: 'hidden',
                    px: 1
                  }}>
                    {timeline.slice(timelineIndex, timelineIndex + itemsPerView).map((item, index) => (
                      <Box
                        key={timelineIndex + index}
                        sx={{
                          flex: `0 0 calc(${100/itemsPerView}% - 16px)`,
                          minWidth: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        {/* Dot indicator */}
                        <Box sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: item.type === 'appointment' ? 'primary.main' : 'secondary.main',
                          border: '3px solid white',
                          boxShadow: 2,
                          mb: 1,
                          zIndex: 1
                        }} />

                        {/* Date label */}
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {formatDate(item.date)}
                          {item.time && ` • ${formatTime(item.time)}`}
                        </Typography>

                        {/* Event Card */}
                        <Card
                          variant="outlined"
                          sx={{
                            width: '100%',
                            bgcolor: item.type === 'appointment' ? 'primary.lighter' :
                                     item.type === 'case_started' ? 'success.lighter' : 'grey.100',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4
                            }
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            {item.type === 'appointment' && (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <EventIcon fontSize="small" color="primary" />
                                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {item.data.Service?.name || 'Cita'}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Dr. {item.data.Doctor?.fullName}
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {getStatusChip(item.data.status)}
                                </Box>
                              </>
                            )}
                            {item.type === 'case_started' && (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <CaseIcon fontSize="small" color="success" />
                                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    Caso Iniciado
                                  </Typography>
                                </Box>
                                <Typography variant="body2" noWrap>
                                  {item.data.conditionName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Dr. {item.data.Doctor?.fullName}
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {getSeverityChip(item.data.severity)}
                                </Box>
                              </>
                            )}
                            {item.type === 'case_ended' && (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <CaseIcon fontSize="small" color="action" />
                                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    Caso Finalizado
                                  </Typography>
                                </Box>
                                <Typography variant="body2" noWrap>
                                  {item.data.conditionName}
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {getStatusChip(item.data.status)}
                                </Box>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>

                  {/* Right Arrow */}
                  <IconButton
                    onClick={handleNextTimeline}
                    disabled={!canGoNext}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'primary.lighter' },
                      '&:disabled': { opacity: 0.3 }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>

                {/* Pagination dots */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                  {Array.from({ length: Math.ceil(timeline.length / itemsPerView) }).map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setTimelineIndex(i * itemsPerView)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: Math.floor(timelineIndex / itemsPerView) === i ? 'primary.main' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'bgcolor 0.2s'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Patient Notes Section - Prominently displayed */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NoteIcon color="primary" />
              Notas del Expediente
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setNoteDialog(true)}
            >
              Nueva Nota
            </Button>
          </Box>

          {patient?.notes ? (
            <Box sx={{
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              maxHeight: 300,
              overflowY: 'auto'
            }}>
              {patient.notes.split('\n\n').map((note, index) => (
                <Box key={index} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                  {editingNoteIndex === index ? (
                    // Edit mode
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        value={editNoteValue}
                        onChange={(e) => setEditNoteValue(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" onClick={handleSaveEditedNote}>
                          Guardar
                        </Button>
                        <Button size="small" onClick={() => { setEditingNoteIndex(null); setEditNoteValue(''); }}>
                          Cancelar
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    // View mode
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      p: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      borderLeft: '3px solid',
                      borderLeftColor: 'primary.main'
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                        {note}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditNote(index, note)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error" onClick={() => handleDeleteNote(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info" sx={{ bgcolor: 'grey.50' }}>
              No hay notas registradas para este paciente. Haz clic en "Nueva Nota" para agregar una.
            </Alert>
          )}
        </Paper>
      </Box>
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
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewAppointmentDetails(apt)}
                    >
                      <VisibilityIcon />
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      {medCase.conditionName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {getSeverityChip(medCase.severity)}
                      {getStatusChip(medCase.status)}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar diagnóstico">
                      <IconButton size="small" color="primary" onClick={() => handleEditMedicalCase(medCase)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar diagnóstico">
                      <IconButton size="small" color="error" onClick={() => handleDeleteMedicalCase(medCase.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PhotoIcon />}
                      onClick={() => {
                        setSelectedPhotos(medCase.Photos);
                        setSelectedPhotosCaseName(medCase.conditionName);
                        setPhotoGalleryDialog(true);
                      }}
                    >
                      Ver fotos ({medCase.Photos.length})
                    </Button>
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
              <TableCell>Diagnóstico Médico</TableCell>
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
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditPrescription(rx)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar PDF">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownloadPrescription(rx.id)}
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePrescription(rx.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
          <strong>Alergias:</strong> {patient.allergies}
        </Alert>
      )}

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<CaseIcon />}
          onClick={handleOpenNewCaseDialog}
          size="small"
        >
          Nuevo diagnóstico médico
        </Button>
        <Button
          variant="contained"
          startIcon={<MedicationIcon />}
          onClick={handleOpenPrescriptionDialog}
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
          onClick={handleOpenPhotoDialog}
          size="small"
        >
          Agregar Foto
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PrintIcon />}
          onClick={handleDownloadExpediente}
          size="small"
        >
          Exportar Expediente
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
          <Tab label={`Diagnósticos médicos (${medicalCases.length})`} icon={<CaseIcon />} iconPosition="start" />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Información Personal
                </Typography>
                {!editingPersonalData && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditPersonalData}
                  >
                    Editar
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {editingPersonalData ? (
                // Edit Mode
                <Box>
                  {/* Datos de Contacto Section */}
                  <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
                      Datos de Contacto
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nombre Completo"
                          value={personalDataForm.fullName}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, fullName: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Teléfono"
                          value={personalDataForm.phone}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, phone: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={personalDataForm.email}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, email: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Información Médica Section */}
                  <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
                      Información Médica
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Fecha de Nacimiento"
                          value={personalDataForm.birthDate}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, birthDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Sexo"
                          value={personalDataForm.gender}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, gender: e.target.value })}
                          required
                        >
                          <MenuItem value="male">Masculino</MenuItem>
                          <MenuItem value="female">Femenino</MenuItem>
                          <MenuItem value="other">Otro</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          label="Tipo de Sangre"
                          value={personalDataForm.bloodType || ''}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, bloodType: e.target.value })}
                          SelectProps={{
                            displayEmpty: true
                          }}
                        >
                          <MenuItem value="">No registrado</MenuItem>
                          <MenuItem value="A+">A+</MenuItem>
                          <MenuItem value="A-">A-</MenuItem>
                          <MenuItem value="B+">B+</MenuItem>
                          <MenuItem value="B-">B-</MenuItem>
                          <MenuItem value="AB+">AB+</MenuItem>
                          <MenuItem value="AB-">AB-</MenuItem>
                          <MenuItem value="O+">O+</MenuItem>
                          <MenuItem value="O-">O-</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Alergias"
                          value={personalDataForm.allergies}
                          onChange={(e) => setPersonalDataForm({ ...personalDataForm, allergies: e.target.value })}
                          placeholder="Ej: Penicilina, Polen, etc."
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancelPersonalData}
                      size="large"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSavePersonalData}
                      size="large"
                    >
                      Guardar Cambios
                    </Button>
                  </Box>
                </Box>
              ) : (
                // View Mode
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GenderIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Sexo:</strong> {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'No especificado'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BloodtypeIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Tipo de sangre:</strong> {patient.bloodType || 'No registrado'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Alergias:</strong> {patient.allergies || 'No registrado'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialog} onClose={() => setPrescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPrescriptionId ? 'Editar Receta' : 'Nueva Receta'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Medical Case Selection */}
            <TextField
              select
              label="Diagnóstico Médico"
              value={prescriptionForm.medicalCaseId}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicalCaseId: e.target.value })}
              fullWidth
              required
              helperText={medicalCases.length === 1 ? 'Seleccionado automáticamente (único diagnóstico)' : 'Seleccione el diagnóstico al que pertenece esta receta'}
            >
              {medicalCases.map((mc) => (
                <MenuItem key={mc.id} value={mc.id}>
                  {mc.conditionName} - {mc.status}
                </MenuItem>
              ))}
            </TextField>
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
            onClick={handleSavePrescription}
            variant="contained"
            disabled={!prescriptionForm.medicationName || !prescriptionForm.medicalCaseId}
          >
            {editingPrescriptionId ? 'Actualizar Receta' : 'Guardar Receta'}
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
            {/* Medical Case Selection */}
            <TextField
              select
              label="Diagnóstico Médico"
              value={photoForm.medicalCaseId}
              onChange={(e) => setPhotoForm({ ...photoForm, medicalCaseId: e.target.value })}
              fullWidth
              required
              helperText={medicalCases.length === 1 ? 'Seleccionado automáticamente (único diagnóstico)' : 'Seleccione el diagnóstico al que pertenece esta foto'}
            >
              {medicalCases.map((mc) => (
                <MenuItem key={mc.id} value={mc.id}>
                  {mc.conditionName} - {mc.status}
                </MenuItem>
              ))}
            </TextField>
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
            disabled={!photoForm.file || !photoForm.medicalCaseId || uploading}
          >
            {uploading ? 'Subiendo...' : 'Guardar Foto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Medical Case Dialog */}
      <Dialog open={caseDialog} onClose={() => setCaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCaseId ? 'Editar Diagnóstico Médico' : 'Nuevo Diagnóstico Médico'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre de la Condición"
              value={caseForm.conditionName}
              onChange={(e) => setCaseForm({ ...caseForm, conditionName: e.target.value })}
              fullWidth
              required
              placeholder="Ej: Dermatitis atópica, Acné, Psoriasis..."
            />
            <TextField
              select
              label="Especialidad"
              value={caseForm.specialty}
              onChange={(e) => setCaseForm({ ...caseForm, specialty: e.target.value })}
              fullWidth
            >
              <MenuItem value="Dermatología">Dermatología</MenuItem>
              <MenuItem value="Dermatología Estética">Dermatología Estética</MenuItem>
              <MenuItem value="Dermatología Pediátrica">Dermatología Pediátrica</MenuItem>
            </TextField>
            <TextField
              select
              label="Severidad"
              value={caseForm.severity}
              onChange={(e) => setCaseForm({ ...caseForm, severity: e.target.value })}
              fullWidth
            >
              <MenuItem value="Leve">Leve</MenuItem>
              <MenuItem value="Moderado">Moderado</MenuItem>
              <MenuItem value="Severo">Severo</MenuItem>
            </TextField>
            <TextField
              label="Síntomas"
              value={caseForm.symptoms}
              onChange={(e) => setCaseForm({ ...caseForm, symptoms: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Describa los síntomas del paciente..."
            />
            <TextField
              label="Área Afectada"
              value={caseForm.affectedArea}
              onChange={(e) => setCaseForm({ ...caseForm, affectedArea: e.target.value })}
              fullWidth
              placeholder="Ej: Rostro, Brazos, Espalda..."
            />
            <TextField
              select
              label="Estado"
              value={caseForm.status}
              onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="En Tratamiento">En Tratamiento</MenuItem>
              <MenuItem value="Crónico">Crónico</MenuItem>
              <MenuItem value="Curado">Curado</MenuItem>
              <MenuItem value="Inactivo">Inactivo</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaseDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveMedicalCase}
            variant="contained"
            color="success"
            disabled={!caseForm.conditionName}
          >
            {editingCaseId ? 'Actualizar Diagnóstico' : 'Crear Diagnóstico'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog
        open={photoGalleryDialog}
        onClose={() => setPhotoGalleryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Fotos - {selectedPhotosCaseName}
        </DialogTitle>
        <DialogContent>
          {selectedPhotos.length === 0 ? (
            <Alert severity="info">No hay fotos para mostrar</Alert>
          ) : (
            <Grid container spacing={2}>
              {selectedPhotos.map((photo) => (
                <Grid item xs={12} sm={6} key={photo.id}>
                  <Card>
                    <Box
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 }
                      }}
                      onClick={() => window.open(`${API_URL.replace('/api', '')}${photo.photoUrl}`, '_blank')}
                    >
                      <img
                        src={`${API_URL.replace('/api', '')}${photo.photoUrl}`}
                        alt={photo.description || 'Foto médica'}
                        style={{
                          width: '100%',
                          height: 250,
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {photo.dateTaken ? formatDate(photo.dateTaken) : formatDate(photo.createdAt)}
                          </Typography>
                          {photo.description ? (
                            <Typography variant="body2">
                              {photo.description}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              Sin descripción
                            </Typography>
                          )}
                        </Box>
                        <Tooltip title="Eliminar foto">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Haz clic en una foto para verla en tamaño completo
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoGalleryDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog
        open={appointmentDetailsDialog}
        onClose={() => setAppointmentDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Detalles de la Cita
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedAppointment && (
            <Box>
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    {selectedAppointment.Service?.name || 'Servicio'}
                  </Typography>
                  <Chip
                    label={selectedAppointment.status === 'confirmed' ? 'Confirmada' :
                           selectedAppointment.status === 'pending' ? 'Pendiente' :
                           selectedAppointment.status === 'completed' ? 'Completada' :
                           selectedAppointment.status === 'cancelled' ? 'Cancelada' : selectedAppointment.status}
                    size="small"
                    color={selectedAppointment.status === 'completed' ? 'success' :
                           selectedAppointment.status === 'confirmed' ? 'primary' :
                           selectedAppointment.status === 'cancelled' ? 'error' : 'default'}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(selectedAppointment.appointmentDate)}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Hora
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {selectedAppointment.appointmentTime}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      Dr. {selectedAppointment.Doctor?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAppointment.Doctor?.specialty || ''}
                    </Typography>
                  </Grid>

                  {selectedAppointment.Service?.duration && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duración
                      </Typography>
                      <Typography variant="body2">
                        {selectedAppointment.Service.duration} minutos
                      </Typography>
                    </Grid>
                  )}

                  {selectedAppointment.Service?.price && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Precio
                      </Typography>
                      <Typography variant="body2">
                        ${selectedAppointment.Service.price}
                      </Typography>
                    </Grid>
                  )}

                  {selectedAppointment.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Notas
                      </Typography>
                      <Typography variant="body2">
                        {selectedAppointment.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setAppointmentDetailsDialog(false)} variant="contained">Cerrar</Button>
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
