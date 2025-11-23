import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Autocomplete,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  LocalHospital as MedicalIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FolderShared as HistoryIcon,
  Notes as NotesIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Medication as MedicationIcon,
  PhotoCamera as PhotoIcon,
  Circle as CircleIcon,
  AccessTime as TimeIcon
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
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

function MedicalRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  // Create/Edit dialog
  const [formDialog, setFormDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    conditionName: '',
    specialty: '',
    severity: 'Moderado',
    symptoms: '',
    affectedArea: '',
    onsetDate: '',
    previousTreatments: '',
    treatmentGoal: '',
    status: 'En Tratamiento',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    isActive: true
  });

  // Checkboxes for optional fields
  const [noPreviousTreatments, setNoPreviousTreatments] = useState(false);
  const [noTreatmentGoal, setNoTreatmentGoal] = useState(false);
  const [noNotes, setNoNotes] = useState(false);

  // Prescription management
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    prescribedDate: new Date().toISOString().split('T')[0]
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Inline notes editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/medical-cases`, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setCases(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching medical cases:', err);
      setError('Error al cargar expedientes médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (caseId) => {
    try {
      const response = await axios.get(`${API_URL}/medical-cases/${caseId}`, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setSelectedCase(response.data.data);
        setDetailsDialog(true);
      }
    } catch (err) {
      console.error('Error fetching case details:', err);
      setError('Error al cargar detalles del caso');
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedCase(null);
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get(`${API_URL}/patients`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/doctors`, { headers: getAuthHeader() })
      ]);

      if (patientsRes.data.success) {
        // Show all patients for everyone
        // Doctors can create cases for any patient they treat
        setPatients(patientsRes.data.data);
      }

      if (doctorsRes.data.success) {
        setDoctors(doctorsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching patients/doctors:', err);
    }
  };

  const handleOpenCreateDialog = async () => {
    await fetchPatientsAndDoctors();

    // If doctor role, get their doctor info
    let doctorInfo = { id: '', specialty: '' };
    if (user.role === 'doctor') {
      try {
        const response = await axios.get(`${API_URL}/doctors`, { headers: getAuthHeader() });
        if (response.data.success) {
          const myDoctor = response.data.data.find(d => d.userId === user.id);
          if (myDoctor) {
            doctorInfo = { id: myDoctor.id, specialty: myDoctor.specialty };
          }
        }
      } catch (err) {
        console.error('Error fetching doctor info:', err);
      }
    }

    setEditMode(false);
    setNoPreviousTreatments(false);
    setNoTreatmentGoal(false);
    setNoNotes(false);
    setFormData({
      patientId: '',
      doctorId: user.role === 'doctor' ? doctorInfo.id : '',
      conditionName: '',
      specialty: user.role === 'doctor' ? doctorInfo.specialty : '',
      severity: 'Moderado',
      symptoms: '',
      affectedArea: '',
      onsetDate: '',
      previousTreatments: '',
      treatmentGoal: '',
      status: 'En Tratamiento',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      isActive: true
    });
    setFormDialog(true);
  };

  const handleOpenEditDialog = async (medicalCase) => {
    await fetchPatientsAndDoctors();
    setEditMode(true);

    // Set checkbox states based on existing data
    setNoPreviousTreatments(!medicalCase.previousTreatments || medicalCase.previousTreatments.trim() === '');
    setNoTreatmentGoal(!medicalCase.treatmentGoal || medicalCase.treatmentGoal.trim() === '');
    setNoNotes(!medicalCase.notes || medicalCase.notes.trim() === '');

    setFormData({
      id: medicalCase.id,
      patientId: medicalCase.patientId,
      doctorId: medicalCase.doctorId,
      conditionName: medicalCase.conditionName,
      specialty: medicalCase.specialty,
      severity: medicalCase.severity,
      symptoms: medicalCase.symptoms || '',
      affectedArea: medicalCase.affectedArea || '',
      onsetDate: medicalCase.onsetDate || '',
      previousTreatments: medicalCase.previousTreatments || '',
      treatmentGoal: medicalCase.treatmentGoal || '',
      status: medicalCase.status,
      startDate: medicalCase.startDate,
      endDate: medicalCase.endDate || '',
      notes: medicalCase.notes || '',
      isActive: medicalCase.isActive
    });
    setFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialog(false);
    setEditMode(false);
  };

  // Prescription handlers
  const handleOpenPrescriptionDialog = () => {
    setEditingPrescription(null);
    setPrescriptionForm({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      prescribedDate: new Date().toISOString().split('T')[0]
    });
    setPrescriptionDialog(true);
  };

  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setPrescriptionForm({
      medicationName: prescription.medicationName,
      dosage: prescription.dosage || '',
      frequency: prescription.frequency || '',
      duration: prescription.duration || '',
      instructions: prescription.instructions || '',
      prescribedDate: prescription.prescribedDate
    });
    setPrescriptionDialog(true);
  };

  const handleClosePrescriptionDialog = () => {
    setPrescriptionDialog(false);
    setEditingPrescription(null);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingPrescription) {
        // Update prescription
        const response = await axios.put(
          `${API_URL}/prescriptions/${editingPrescription.id}`,
          prescriptionForm,
          { headers: getAuthHeader() }
        );

        if (response.data.success) {
          // Refresh case details
          await handleViewDetails(selectedCase.id);
          setPrescriptionDialog(false);
        }
      } else {
        // Create new prescription
        const response = await axios.post(
          `${API_URL}/prescriptions`,
          {
            ...prescriptionForm,
            medicalCaseId: selectedCase.id
          },
          { headers: getAuthHeader() }
        );

        if (response.data.success) {
          // Refresh case details
          await handleViewDetails(selectedCase.id);
          setPrescriptionDialog(false);
        }
      }
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError(err.response?.data?.message || 'Error al guardar prescripción');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta prescripción?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(
        `${API_URL}/prescriptions/${prescriptionId}`,
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        // Refresh case details
        await handleViewDetails(selectedCase.id);
      }
    } catch (err) {
      console.error('Error deleting prescription:', err);
      setError(err.response?.data?.message || 'Error al eliminar prescripción');
    } finally {
      setLoading(false);
    }
  };

  // Photo handlers
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState('during');
  const [photoDescription, setPhotoDescription] = useState('');

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('medicalCaseId', selectedCase.id);
      formData.append('photoType', selectedPhotoType);
      formData.append('description', photoDescription);

      const response = await axios.post(
        `${API_URL}/photos`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Reset form
        setPhotoDescription('');
        setSelectedPhotoType('during');
        event.target.value = ''; // Clear file input
        // Refresh case details
        await handleViewDetails(selectedCase.id);
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err.response?.data?.message || 'Error al subir foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta foto?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(
        `${API_URL}/photos/${photoId}`,
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        // Refresh case details
        await handleViewDetails(selectedCase.id);
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err.response?.data?.message || 'Error al eliminar foto');
    } finally {
      setLoading(false);
    }
  };

  // Inline notes editing handlers
  const handleStartEditNotes = () => {
    setEditedNotes(selectedCase?.notes || '');
    setIsEditingNotes(true);
  };

  const handleCancelEditNotes = () => {
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setError('');

    try {
      const response = await axios.put(
        `${API_URL}/medical-cases/${selectedCase.id}`,
        { notes: editedNotes },
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        // Update the selected case with new notes
        setSelectedCase({ ...selectedCase, notes: editedNotes });
        setIsEditingNotes(false);
        // Also refresh the cases list
        await fetchCases();
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      setError(err.response?.data?.message || 'Error al guardar notas');
    } finally {
      setSavingNotes(false);
    }
  };

  // Helper function to build timeline events from prescriptions and photos
  const buildTimelineEvents = () => {
    if (!selectedCase) return [];

    const events = [];

    // Add prescriptions to timeline
    if (selectedCase.Prescriptions) {
      selectedCase.Prescriptions.forEach(prescription => {
        events.push({
          id: `prescription-${prescription.id}`,
          type: 'prescription',
          date: prescription.prescribedDate,
          title: prescription.medicationName,
          subtitle: `${prescription.dosage || ''} ${prescription.frequency || ''}`.trim() || 'Sin dosis especificada',
          data: prescription
        });
      });
    }

    // Add photos to timeline
    if (selectedCase.Photos) {
      selectedCase.Photos.forEach(photo => {
        events.push({
          id: `photo-${photo.id}`,
          type: 'photo',
          date: photo.uploadDate,
          title: photo.photoType === 'before' ? 'Foto: Antes' :
                 photo.photoType === 'after' ? 'Foto: Después' : 'Foto: Durante',
          subtitle: photo.description || 'Sin descripción',
          data: photo
        });
      });
    }

    // Sort by date (newest first)
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return events;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sanitize form data - convert empty or invalid dates to null
      const sanitizedData = {
        ...formData,
        onsetDate: formData.onsetDate && formData.onsetDate.trim() !== '' ? formData.onsetDate : null,
        endDate: formData.endDate && formData.endDate.trim() !== '' ? formData.endDate : null
      };

      if (editMode) {
        // Update existing case
        const response = await axios.put(
          `${API_URL}/medical-cases/${formData.id}`,
          sanitizedData,
          { headers: getAuthHeader() }
        );

        if (response.data.success) {
          await fetchCases();
          setFormDialog(false);
        }
      } else {
        // Create new case
        const response = await axios.post(
          `${API_URL}/medical-cases`,
          sanitizedData,
          { headers: getAuthHeader() }
        );

        if (response.data.success) {
          await fetchCases();
          setFormDialog(false);
        }
      }
    } catch (err) {
      console.error('Error saving medical case:', err);
      setError(err.response?.data?.message || 'Error al guardar caso médico');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'En Tratamiento': 'primary',
      'Curado': 'success',
      'Crónico': 'warning',
      'Inactivo': 'default'
    };
    return colors[status] || 'default';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Leve': 'success',
      'Moderado': 'warning',
      'Severo': 'error'
    };
    return colors[severity] || 'default';
  };

  const filteredCases = cases.filter(medicalCase => {
    const matchesStatus = !filters.status || medicalCase.status === filters.status;
    const matchesSearch = !filters.search ||
      medicalCase.conditionName.toLowerCase().includes(filters.search.toLowerCase()) ||
      medicalCase.Patient?.fullName.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MedicalIcon />
            Expedientes Médicos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de casos médicos y prescripciones
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nuevo Caso
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar"
              placeholder="Paciente o condición"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Filtrar por estado"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      minWidth: 200
                    }
                  }
                }
              }}
              sx={{
                '& .MuiSelect-select': {
                  minWidth: '150px'
                }
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="En Tratamiento">En Tratamiento</MenuItem>
              <MenuItem value="Curado">Curado</MenuItem>
              <MenuItem value="Crónico">Crónico</MenuItem>
              <MenuItem value="Inactivo">Inactivo</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Cases Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Condición</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Severidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No se encontraron expedientes médicos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((medicalCase) => (
                <TableRow key={medicalCase.id} hover>
                  <TableCell>{medicalCase.Patient?.fullName || 'N/A'}</TableCell>
                  <TableCell>{medicalCase.conditionName}</TableCell>
                  <TableCell>{medicalCase.specialty}</TableCell>
                  <TableCell>
                    <Chip
                      label={medicalCase.severity}
                      color={getSeverityColor(medicalCase.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={medicalCase.status}
                      color={getStatusColor(medicalCase.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(medicalCase.startDate)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(medicalCase.id)}
                      size="small"
                      title="Ver detalles"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/patients/${medicalCase.patientId}/medical-history`)}
                      size="small"
                      title="Ver historial médico completo"
                    >
                      <HistoryIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenEditDialog(medicalCase)}
                      size="small"
                      title="Editar caso"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              Expediente: {selectedCase?.Patient?.fullName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedCase?.conditionName} - {selectedCase?.specialty}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={selectedCase?.severity}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              size="small"
            />
            <Chip
              label={selectedCase?.status}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedCase && (
            <Box>
              {/* NOTES SECTION - Prominent at the top */}
              <Box sx={{
                bgcolor: 'warning.lighter',
                borderBottom: '3px solid',
                borderColor: 'warning.main',
                p: 3
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="warning" />
                    <Typography variant="h6" color="warning.dark">
                      Notas del Caso
                    </Typography>
                  </Box>
                  {!isEditingNotes ? (
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={handleStartEditNotes}
                      variant="outlined"
                      color="warning"
                    >
                      Editar Notas
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEditNotes}
                        variant="outlined"
                        color="inherit"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="small"
                        startIcon={savingNotes ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleSaveNotes}
                        variant="contained"
                        color="warning"
                        disabled={savingNotes}
                      >
                        Guardar
                      </Button>
                    </Box>
                  )}
                </Box>

                {isEditingNotes ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Escribe las notas del caso aquí..."
                    variant="outlined"
                    sx={{ bgcolor: 'white' }}
                  />
                ) : (
                  <Paper sx={{ p: 2, minHeight: 80, bgcolor: 'white' }}>
                    {selectedCase.notes ? (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedCase.notes}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No hay notas registradas. Haz clic en "Editar Notas" para agregar observaciones importantes sobre este caso.
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>

              {/* Main Content Grid */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Left Column - Patient & Case Info */}
                  <Grid item xs={12} md={4}>
                    {/* Patient Info */}
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Paciente
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Nombre:</strong> {selectedCase.Patient?.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Tel:</strong> {selectedCase.Patient?.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Nacimiento:</strong> {selectedCase.Patient?.birthDate ? formatDate(selectedCase.Patient.birthDate) : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {selectedCase.Patient?.email || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Case Details */}
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Detalles del Caso
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Inicio:</strong> {formatDate(selectedCase.startDate)}
                        </Typography>
                        {selectedCase.endDate && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Fin:</strong> {formatDate(selectedCase.endDate)}
                          </Typography>
                        )}
                        {selectedCase.symptoms && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Síntomas:</strong> {selectedCase.symptoms}
                          </Typography>
                        )}
                        {selectedCase.affectedArea && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Área:</strong> {selectedCase.affectedArea}
                          </Typography>
                        )}
                        {selectedCase.treatmentGoal && (
                          <Typography variant="body2">
                            <strong>Objetivo:</strong> {selectedCase.treatmentGoal}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right Column - Timeline */}
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Historial del Tratamiento
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<MedicationIcon />}
                              onClick={handleOpenPrescriptionDialog}
                            >
                              + Prescripción
                            </Button>
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {/* Horizontal Timeline */}
                        {buildTimelineEvents().length > 0 ? (
                          <Box sx={{
                            overflowX: 'auto',
                            pb: 2,
                            '&::-webkit-scrollbar': { height: 8 },
                            '&::-webkit-scrollbar-track': { bgcolor: 'grey.100', borderRadius: 4 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 4 }
                          }}>
                            <Box sx={{
                              display: 'flex',
                              gap: 2,
                              minWidth: 'max-content',
                              position: 'relative',
                              pt: 2,
                              pb: 1
                            }}>
                              {/* Timeline line */}
                              <Box sx={{
                                position: 'absolute',
                                top: 40,
                                left: 0,
                                right: 0,
                                height: 2,
                                bgcolor: 'grey.300',
                                zIndex: 0
                              }} />

                              {buildTimelineEvents().map((event, index) => (
                                <Box
                                  key={event.id}
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: 160,
                                    position: 'relative',
                                    zIndex: 1
                                  }}
                                >
                                  {/* Timeline dot */}
                                  <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: event.type === 'prescription' ? 'primary.main' : 'success.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: 2
                                  }}>
                                    {event.type === 'prescription' ?
                                      <MedicationIcon fontSize="small" /> :
                                      <PhotoIcon fontSize="small" />
                                    }
                                  </Box>

                                  {/* Event card */}
                                  <Card
                                    variant="outlined"
                                    sx={{
                                      mt: 1,
                                      width: 150,
                                      cursor: event.type === 'photo' ? 'pointer' : 'default',
                                      '&:hover': { boxShadow: 2 }
                                    }}
                                    onClick={() => {
                                      if (event.type === 'photo') {
                                        window.open(`${API_URL.replace('/api', '')}${event.data.photoUrl}`, '_blank');
                                      }
                                    }}
                                  >
                                    {event.type === 'photo' && (
                                      <Box
                                        component="img"
                                        src={`${API_URL.replace('/api', '')}${event.data.photoUrl}`}
                                        alt={event.title}
                                        sx={{ width: '100%', height: 80, objectFit: 'cover' }}
                                      />
                                    )}
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {formatDate(event.date)}
                                      </Typography>
                                      <Typography variant="body2" fontWeight="bold" noWrap>
                                        {event.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {event.subtitle}
                                      </Typography>
                                      {event.type === 'prescription' && (
                                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditPrescription(event.data);
                                            }}
                                          >
                                            <EditIcon sx={{ fontSize: 14 }} />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeletePrescription(event.data.id);
                                            }}
                                          >
                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                          </IconButton>
                                        </Box>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No hay eventos registrados en el historial
                          </Typography>
                        )}
                      </CardContent>
                    </Card>

                    {/* Photo Upload Section */}
                    <Card sx={{ mt: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <PhotoIcon color="success" />
                          <Typography variant="subtitle1" fontWeight="bold">
                            Agregar Foto
                          </Typography>
                        </Box>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              select
                              size="small"
                              label="Tipo"
                              value={selectedPhotoType}
                              onChange={(e) => setSelectedPhotoType(e.target.value)}
                            >
                              <MenuItem value="before">Antes</MenuItem>
                              <MenuItem value="during">Durante</MenuItem>
                              <MenuItem value="after">Después</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Descripción"
                              value={photoDescription}
                              onChange={(e) => setPhotoDescription(e.target.value)}
                              placeholder="Ej: Primera sesión..."
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Button
                              variant="contained"
                              component="label"
                              fullWidth
                              color="success"
                              disabled={uploadingPhoto}
                              startIcon={uploadingPhoto ? <CircularProgress size={20} /> : <PhotoIcon />}
                            >
                              {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
                              <input
                                type="file"
                                hidden
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handlePhotoUpload}
                              />
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.100' }}>
          <Button onClick={handleCloseDetails} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={formDialog}
        onClose={handleCloseFormDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleFormSubmit}>
          <DialogTitle>
            {editMode ? 'Editar Caso Médico' : 'Nuevo Caso Médico'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              {/* Patient Selection with Search */}
              <Grid item xs={12} sm={user.role === 'doctor' ? 12 : 6}>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) => option.fullName || ''}
                  value={patients.find(p => p.id === formData.patientId) || null}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, patientId: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Paciente"
                      placeholder="Buscar paciente..."
                    />
                  )}
                  ListboxProps={{
                    style: { maxHeight: '300px' }
                  }}
                  sx={{
                    '& .MuiAutocomplete-inputRoot': {
                      minWidth: '200px'
                    }
                  }}
                  noOptionsText="No se encontraron pacientes"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>

              {/* Doctor Selection (only for admin/receptionist) */}
              {user.role !== 'doctor' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    select
                    label="Doctor"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    <MenuItem value="">Seleccionar doctor</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.fullName} - {doctor.specialty}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {/* Condition Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Nombre de la Condición"
                  value={formData.conditionName}
                  onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
                />
              </Grid>

              {/* Specialty */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Especialidad"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  disabled={user.role === 'doctor'}
                />
              </Grid>

              {/* Severity */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Severidad"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <MenuItem value="Leve">Leve</MenuItem>
                  <MenuItem value="Moderado">Moderado</MenuItem>
                  <MenuItem value="Severo">Severo</MenuItem>
                </TextField>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Estado"
                  value={formData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    // Auto-set end date when status changes to Curado or Inactivo
                    if ((newStatus === 'Curado' || newStatus === 'Inactivo') && !formData.endDate) {
                      setFormData({
                        ...formData,
                        status: newStatus,
                        endDate: new Date().toISOString().split('T')[0]
                      });
                    }
                    // Clear end date for active/chronic cases
                    else if (newStatus === 'En Tratamiento' || newStatus === 'Crónico') {
                      setFormData({
                        ...formData,
                        status: newStatus,
                        endDate: ''
                      });
                    } else {
                      setFormData({ ...formData, status: newStatus });
                    }
                  }}
                >
                  <MenuItem value="En Tratamiento">En Tratamiento</MenuItem>
                  <MenuItem value="Curado">Curado</MenuItem>
                  <MenuItem value="Crónico">Crónico</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </TextField>
              </Grid>

              {/* Affected Area */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Área Afectada"
                  value={formData.affectedArea}
                  onChange={(e) => setFormData({ ...formData, affectedArea: e.target.value })}
                />
              </Grid>

              {/* Onset Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Inicio de Síntomas (Opcional)"
                  value={formData.onsetDate}
                  onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Dejar vacío si el paciente no recuerda"
                />
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Fecha de Inicio de Tratamiento"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Fecha en que inició tratamiento en esta clínica"
                />
              </Grid>

              {/* End Date - Only show for Curado or Inactivo status */}
              {(formData.status === 'Curado' || formData.status === 'Inactivo') && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="date"
                    label="Fecha de Finalización"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    helperText={formData.status === 'Curado' ? 'Fecha en que se curó' : 'Fecha en que se volvió inactivo'}
                  />
                </Grid>
              )}

              {/* Symptoms */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Síntomas"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                />
              </Grid>

              {/* Previous Treatments */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={noPreviousTreatments}
                      onChange={(e) => {
                        setNoPreviousTreatments(e.target.checked);
                        if (e.target.checked) {
                          setFormData({ ...formData, previousTreatments: '' });
                        }
                      }}
                    />
                  }
                  label="Sin tratamientos previos"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Tratamientos Previos"
                  value={formData.previousTreatments}
                  onChange={(e) => setFormData({ ...formData, previousTreatments: e.target.value })}
                  disabled={noPreviousTreatments}
                  placeholder={noPreviousTreatments ? "Primera vez siendo tratado" : "Describe tratamientos anteriores..."}
                />
              </Grid>

              {/* Treatment Goal */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={noTreatmentGoal}
                      onChange={(e) => {
                        setNoTreatmentGoal(e.target.checked);
                        if (e.target.checked) {
                          setFormData({ ...formData, treatmentGoal: '' });
                        }
                      }}
                    />
                  }
                  label="Sin objetivo definido aún"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Objetivo del Tratamiento"
                  value={formData.treatmentGoal}
                  onChange={(e) => setFormData({ ...formData, treatmentGoal: e.target.value })}
                  disabled={noTreatmentGoal}
                  placeholder={noTreatmentGoal ? "Se definirá más adelante" : "Describe el objetivo del tratamiento..."}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={noNotes}
                      onChange={(e) => {
                        setNoNotes(e.target.checked);
                        if (e.target.checked) {
                          setFormData({ ...formData, notes: '' });
                        }
                      }}
                    />
                  }
                  label="Sin notas adicionales por el momento"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Notas Adicionales"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={noNotes}
                  placeholder={noNotes ? "No hay notas adicionales" : "Agrega observaciones, recomendaciones o detalles importantes..."}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFormDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Prescription Form Dialog */}
      <Dialog
        open={prescriptionDialog}
        onClose={handleClosePrescriptionDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSavePrescription}>
          <DialogTitle>
            {editingPrescription ? 'Editar Prescripción' : 'Nueva Prescripción'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {/* Medication Name */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Nombre del Medicamento"
                  value={prescriptionForm.medicationName}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })}
                  placeholder="Ej: Ibuprofeno, Amoxicilina..."
                />
              </Grid>

              {/* Dosage */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dosis"
                  value={prescriptionForm.dosage}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                  placeholder="Ej: 500mg, 2 tabletas..."
                />
              </Grid>

              {/* Frequency */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frecuencia"
                  value={prescriptionForm.frequency}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                  placeholder="Ej: Cada 8 horas, 3 veces al día..."
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duración"
                  value={prescriptionForm.duration}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                  placeholder="Ej: 7 días, 2 semanas..."
                />
              </Grid>

              {/* Prescribed Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Fecha de Prescripción"
                  value={prescriptionForm.prescribedDate}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescribedDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Instructions */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Instrucciones"
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                  placeholder="Instrucciones especiales para tomar el medicamento..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePrescriptionDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : editingPrescription ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default MedicalRecords;
