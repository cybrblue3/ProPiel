import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

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

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Form state
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    schedule: '',
    isActive: true
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/doctors`, {
        headers: getAuthHeader()
      });
      setDoctors(response.data.data || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Error al cargar doctores');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = doctors.filter(doctor =>
      doctor.fullName?.toLowerCase().includes(search) ||
      doctor.email?.toLowerCase().includes(search) ||
      doctor.phone?.includes(search) ||
      doctor.specialty?.toLowerCase().includes(search)
    );
    setFilteredDoctors(filtered);
  };

  const handleCreateDoctor = async () => {
    try {
      setError('');
      setSuccess('');

      await axios.post(`${API_URL}/doctors`, doctorForm, {
        headers: getAuthHeader()
      });

      setSuccess('Doctor creado exitosamente');
      setCreateDialog(false);
      resetForm();
      loadDoctors();
    } catch (err) {
      console.error('Error creating doctor:', err);
      setError(err.response?.data?.message || 'Error al crear doctor');
    }
  };

  const handleEditDoctor = async () => {
    try {
      setError('');
      setSuccess('');

      await axios.put(`${API_URL}/doctors/${selectedDoctor.id}`, doctorForm, {
        headers: getAuthHeader()
      });

      setSuccess('Doctor actualizado exitosamente');
      setEditDialog(false);
      resetForm();
      loadDoctors();
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err.response?.data?.message || 'Error al actualizar doctor');
    }
  };

  const handleToggleActive = async (doctor) => {
    try {
      setError('');
      await axios.patch(`${API_URL}/doctors/${doctor.id}/toggle-active`, {}, {
        headers: getAuthHeader()
      });
      setSuccess(`Doctor ${doctor.isActive ? 'desactivado' : 'activado'} exitosamente`);
      loadDoctors();
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      setError('Error al cambiar estado del doctor');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialog(true);
  };

  const openEditDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      fullName: doctor.fullName || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialty: doctor.specialty || '',
      licenseNumber: doctor.licenseNumber || '',
      schedule: doctor.schedule || '',
      isActive: doctor.isActive
    });
    setEditDialog(true);
  };

  const openViewDialog = async (doctor) => {
    setSelectedDoctor(doctor);
    setTabValue(0);
    setViewDialog(true);

    // Load doctor's appointments in the background
    try {
      const response = await axios.get(`${API_URL}/doctors/${doctor.id}/appointments`, {
        headers: getAuthHeader()
      });
      setSelectedDoctor(prev => ({ ...prev, appointments: response.data.data || [] }));
    } catch (err) {
      console.error('Error loading doctor appointments:', err);
    }
  };

  const resetForm = () => {
    setDoctorForm({
      fullName: '',
      email: '',
      phone: '',
      specialty: '',
      licenseNumber: '',
      schedule: '',
      isActive: true
    });
    setSelectedDoctor(null);
  };

  const handleFormChange = (field, value) => {
    setDoctorForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Doctores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Nuevo Doctor
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, email, teléfono o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre Completo</strong></TableCell>
                <TableCell><strong>Especialidad</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell><strong>Licencia</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Cargando...</TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No se encontraron doctores</TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id} hover>
                    <TableCell>{doctor.fullName}</TableCell>
                    <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                    <TableCell>{doctor.email || 'N/A'}</TableCell>
                    <TableCell>{doctor.phone || 'N/A'}</TableCell>
                    <TableCell>{doctor.licenseNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.isActive ? 'Activo' : 'Inactivo'}
                        color={doctor.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openViewDialog(doctor)}
                        title="Ver detalles"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openEditDialog(doctor)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <Switch
                        checked={doctor.isActive}
                        onChange={() => handleToggleActive(doctor)}
                        size="small"
                        title={doctor.isActive ? 'Desactivar' : 'Activar'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Doctor Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Doctor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={doctorForm.fullName}
                onChange={(e) => handleFormChange('fullName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={doctorForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={doctorForm.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especialidad"
                value={doctorForm.specialty}
                onChange={(e) => handleFormChange('specialty', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Licencia"
                value={doctorForm.licenseNumber}
                onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Horario"
                multiline
                rows={2}
                value={doctorForm.schedule}
                onChange={(e) => handleFormChange('schedule', e.target.value)}
                placeholder="Ej: Lun-Vie 9:00-17:00"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={doctorForm.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateDoctor}
            variant="contained"
            disabled={!doctorForm.fullName}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Doctor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={doctorForm.fullName}
                onChange={(e) => handleFormChange('fullName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={doctorForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={doctorForm.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especialidad"
                value={doctorForm.specialty}
                onChange={(e) => handleFormChange('specialty', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Licencia"
                value={doctorForm.licenseNumber}
                onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Horario"
                multiline
                rows={2}
                value={doctorForm.schedule}
                onChange={(e) => handleFormChange('schedule', e.target.value)}
                placeholder="Ej: Lun-Vie 9:00-17:00"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={doctorForm.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleEditDoctor}
            variant="contained"
            disabled={!doctorForm.fullName}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Doctor Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Doctor</DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Información Personal" />
                <Tab label="Historial de Citas" />
              </Tabs>

              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Datos Personales</Typography>
                        <Typography><strong>Nombre:</strong> {selectedDoctor.fullName}</Typography>
                        <Typography><strong>Email:</strong> {selectedDoctor.email || 'N/A'}</Typography>
                        <Typography><strong>Teléfono:</strong> {selectedDoctor.phone || 'N/A'}</Typography>
                        <Typography><strong>Especialidad:</strong> {selectedDoctor.specialty || 'N/A'}</Typography>
                        <Typography><strong>Licencia:</strong> {selectedDoctor.licenseNumber || 'N/A'}</Typography>
                        <Typography><strong>Horario:</strong> {selectedDoctor.schedule || 'N/A'}</Typography>
                        <Typography>
                          <strong>Estado:</strong>{' '}
                          <Chip
                            label={selectedDoctor.isActive ? 'Activo' : 'Inactivo'}
                            color={selectedDoctor.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  {selectedDoctor.appointments && selectedDoctor.appointments.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Fecha</strong></TableCell>
                            <TableCell><strong>Paciente</strong></TableCell>
                            <TableCell><strong>Servicio</strong></TableCell>
                            <TableCell><strong>Estado</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedDoctor.appointments.map((apt) => (
                            <TableRow key={apt.id}>
                              <TableCell>
                                {formatDate(apt.appointmentDate)} {apt.appointmentTime}
                              </TableCell>
                              <TableCell>{apt.Patient?.fullName || 'N/A'}</TableCell>
                              <TableCell>{apt.Service?.name || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip label={apt.status} size="small" color={
                                  apt.status === 'confirmed' ? 'success' :
                                  apt.status === 'pending' ? 'warning' : 'default'
                                } />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No hay citas registradas
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;
