import React, { useState, useEffect } from 'react';
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
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

function MedicalRecords() {
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
                    {new Date(medicalCase.startDate).toLocaleDateString('es-MX')}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles del Expediente Médico
        </DialogTitle>
        <DialogContent>
          {selectedCase && (
            <Box sx={{ pt: 2 }}>
              {/* Patient Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información del Paciente
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Nombre
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.Patient?.fullName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.Patient?.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Nacimiento
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.Patient?.birthDate
                          ? new Date(selectedCase.Patient.birthDate).toLocaleDateString('es-MX')
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.Patient?.email || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Medical Case Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información del Caso Médico
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Condición
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.conditionName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Especialidad
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.specialty}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Severidad
                      </Typography>
                      <Chip
                        label={selectedCase.severity}
                        color={getSeverityColor(selectedCase.severity)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Chip
                        label={selectedCase.status}
                        color={getStatusColor(selectedCase.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Inicio
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedCase.startDate).toLocaleDateString('es-MX')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Finalización
                      </Typography>
                      <Typography variant="body1">
                        {selectedCase.endDate
                          ? new Date(selectedCase.endDate).toLocaleDateString('es-MX')
                          : 'En curso'}
                      </Typography>
                    </Grid>
                    {selectedCase.symptoms && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Síntomas
                        </Typography>
                        <Typography variant="body1">
                          {selectedCase.symptoms}
                        </Typography>
                      </Grid>
                    )}
                    {selectedCase.affectedArea && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Área Afectada
                        </Typography>
                        <Typography variant="body1">
                          {selectedCase.affectedArea}
                        </Typography>
                      </Grid>
                    )}
                    {selectedCase.treatmentGoal && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Objetivo del Tratamiento
                        </Typography>
                        <Typography variant="body1">
                          {selectedCase.treatmentGoal}
                        </Typography>
                      </Grid>
                    )}
                    {selectedCase.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Notas Adicionales
                        </Typography>
                        <Typography variant="body1">
                          {selectedCase.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Prescripciones ({selectedCase.Prescriptions?.length || 0})
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleOpenPrescriptionDialog}
                    >
                      Agregar
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {selectedCase.Prescriptions && selectedCase.Prescriptions.length > 0 ? (
                    selectedCase.Prescriptions.map((prescription, index) => (
                      <Box key={prescription.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {prescription.medicationName}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleEditPrescription(prescription)}
                              title="Editar prescripción"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeletePrescription(prescription.id)}
                              title="Eliminar prescripción"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          {prescription.dosage && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                Dosis: {prescription.dosage}
                              </Typography>
                            </Grid>
                          )}
                          {prescription.frequency && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                Frecuencia: {prescription.frequency}
                              </Typography>
                            </Grid>
                          )}
                          {prescription.duration && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                Duración: {prescription.duration}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Fecha: {new Date(prescription.prescribedDate).toLocaleDateString('es-MX')}
                            </Typography>
                          </Grid>
                          {prescription.instructions && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Instrucciones: {prescription.instructions}
                              </Typography>
                            </Grid>
                          )}
                          {prescription.Appointment && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Cita: {new Date(prescription.Appointment.appointmentDate).toLocaleDateString('es-MX')} - {prescription.Appointment.appointmentTime}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                        {index < selectedCase.Prescriptions.length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No hay prescripciones registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fotos del Tratamiento ({selectedCase.Photos?.length || 0})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Upload Section */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          label="Tipo de Foto"
                          value={selectedPhotoType}
                          onChange={(e) => setSelectedPhotoType(e.target.value)}
                        >
                          <MenuItem value="before">Antes</MenuItem>
                          <MenuItem value="during">Durante</MenuItem>
                          <MenuItem value="after">Después</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Descripción (Opcional)"
                          value={photoDescription}
                          onChange={(e) => setPhotoDescription(e.target.value)}
                          placeholder="Ej: Primera sesión, mejora visible..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          component="label"
                          fullWidth
                          disabled={uploadingPhoto}
                          startIcon={uploadingPhoto ? <CircularProgress size={20} /> : <AddIcon />}
                        >
                          {uploadingPhoto ? 'Subiendo...' : 'Seleccionar y Subir Foto'}
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handlePhotoUpload}
                          />
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Máximo 5MB. Formatos: JPG, PNG, GIF, WebP
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Photo Gallery */}
                  {selectedCase.Photos && selectedCase.Photos.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedCase.Photos.map((photo) => (
                        <Grid item xs={12} sm={6} md={4} key={photo.id}>
                          <Card variant="outlined">
                            <Box
                              component="img"
                              src={`${API_URL.replace('/api', '')}${photo.photoUrl}`}
                              alt={photo.description || 'Foto del tratamiento'}
                              sx={{
                                width: '100%',
                                height: 200,
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(`${API_URL.replace('/api', '')}${photo.photoUrl}`, '_blank')}
                            />
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Chip
                                  label={
                                    photo.photoType === 'before' ? 'Antes' :
                                    photo.photoType === 'after' ? 'Después' : 'Durante'
                                  }
                                  color={
                                    photo.photoType === 'before' ? 'warning' :
                                    photo.photoType === 'after' ? 'success' : 'primary'
                                  }
                                  size="small"
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeletePhoto(photo.id)}
                                  title="Eliminar foto"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {new Date(photo.uploadDate).toLocaleDateString('es-MX')}
                              </Typography>
                              {photo.description && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {photo.description}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No hay fotos registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Cerrar</Button>
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
