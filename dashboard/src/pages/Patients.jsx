import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Event as EventIcon,
  Add as AddIcon,
  FolderShared as HistoryIcon
} from '@mui/icons-material';
import { patientsAPI, adminAPI } from '../services/api';

// Country codes for phone numbers (Mexico first, then alphabetical)
const COUNTRY_CODES = [
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+1', country: 'Canadá', flag: '🇨🇦' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+1-787', country: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+1-809', country: 'República Dominicana', flag: '🇩🇴' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' }
];

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    phoneCountryCode: '+52',
    email: '',
    birthDate: '',
    gender: '',
    address: '',
    allergies: '',
    notes: ''
  });

  // Create form
  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    phoneCountryCode: '+52',
    email: '',
    birthDate: '',
    gender: '',
    address: ''
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: ''
  });

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientsAPI.getAll();
      setPatients(response.data.data || response.data);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatientAppointments = async (patientId) => {
    try {
      setAppointmentsLoading(true);
      // Get all appointments and filter by patient
      const response = await adminAPI.getAllAppointments({ limit: 100 });
      const allAppointments = response.data.data.appointments;
      const filtered = allAppointments.filter(apt => apt.patientId === patientId);
      setPatientAppointments(filtered);
    } catch (err) {
      console.error('Error loading patient appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
    setTabValue(0);
    await loadPatientAppointments(patient.id);
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);

    // Parse phone number to extract country code and number
    let phoneCountryCode = '+52';
    let phoneNumber = patient.phone || '';

    if (patient.phone) {
      // Try to match country code at the start
      const match = patient.phone.match(/^(\+[\d-]+)\s+(.+)$/);
      if (match) {
        phoneCountryCode = match[1];
        phoneNumber = match[2].replace(/\D/g, ''); // Remove non-digits
      }
    }

    setEditForm({
      fullName: patient.fullName || '',
      phone: phoneNumber,
      phoneCountryCode: phoneCountryCode,
      email: patient.email || '',
      birthDate: patient.birthDate || '',
      gender: patient.gender || '',
      address: patient.address || '',
      allergies: patient.allergies || '',
      notes: patient.notes || ''
    });
    setEditOpen(true);
  };

  const validateEditForm = () => {
    const errors = {
      fullName: validateFullName(editForm.fullName),
      phone: validatePhone(editForm.phone),
      email: validateEmail(editForm.email),
      birthDate: validateBirthDate(editForm.birthDate),
      gender: validateGender(editForm.gender)
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleEditFieldChange = (field, value) => {
    if (field === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 10);
      setEditForm({ ...editForm, [field]: limited });
    } else {
      setEditForm({ ...editForm, [field]: value });
    }
    setValidationErrors({ ...validationErrors, [field]: '' });
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const fullPhone = `${editForm.phoneCountryCode} ${editForm.phone}`;
      await patientsAPI.update(selectedPatient.id, {
        ...editForm,
        phone: fullPhone
      });
      await loadPatients();
      setEditOpen(false);
      setSelectedPatient(null);
      setValidationErrors({
        fullName: '',
        phone: '',
        email: '',
        birthDate: '',
        gender: ''
      });
      setSuccess('Paciente actualizado exitosamente');
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Error al actualizar el paciente');
    }
  };

  // Validation functions
  const validateFullName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'El nombre completo es requerido';
    }
    if (name.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    // Only allow letters, Spanish characters (ñ, Ñ), accents (á, é, í, ó, ú), spaces, hyphens, and apostrophes
    const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    if (!validNameRegex.test(name)) {
      return 'El nombre solo puede contener letras y caracteres válidos';
    }
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return 'Ingresa nombre y apellido';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) {
      return 'El teléfono es requerido';
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return 'El teléfono debe tener 10 dígitos';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
      return ''; // Email is optional
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Formato de email inválido';
    }
    return '';
  };

  const validateBirthDate = (birthDate) => {
    if (!birthDate || birthDate.trim().length === 0) {
      return 'La fecha de nacimiento es requerida';
    }
    const date = new Date(birthDate);
    const today = new Date();

    // Set today to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);

    // Check if birth date is in the future
    if (date > today) {
      return 'La fecha de nacimiento no puede ser futura';
    }

    const age = today.getFullYear() - date.getFullYear();
    if (age > 120) {
      return 'Fecha de nacimiento inválida (más de 120 años)';
    }

    return '';
  };

  const validateGender = (gender) => {
    if (!gender || gender.trim().length === 0) {
      return 'El sexo es requerido';
    }
    return '';
  };

  const validateCreateForm = () => {
    const errors = {
      fullName: validateFullName(createForm.fullName),
      phone: validatePhone(createForm.phone),
      email: validateEmail(createForm.email),
      birthDate: validateBirthDate(createForm.birthDate),
      gender: validateGender(createForm.gender)
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleCreateFieldChange = (field, value) => {
    if (field === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 10);
      setCreateForm({ ...createForm, [field]: limited });
    } else {
      setCreateForm({ ...createForm, [field]: value });
    }
    setValidationErrors({ ...validationErrors, [field]: '' });
  };

  const handleCreateSubmit = async () => {
    if (!validateCreateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const fullPhone = `${createForm.phoneCountryCode} ${createForm.phone}`;
      await patientsAPI.create({
        ...createForm,
        phone: fullPhone
      });

      await loadPatients();
      setCreateOpen(false);
      setCreateForm({
        fullName: '',
        phone: '',
        phoneCountryCode: '+52',
        email: '',
        birthDate: '',
        gender: '',
        address: ''
      });
      setValidationErrors({
        fullName: '',
        phone: '',
        email: '',
        birthDate: '',
        gender: ''
      });
      setSuccess('Paciente creado exitosamente');
    } catch (err) {
      console.error('Error creating patient:', err);
      setError(err.response?.data?.message || 'Error al crear paciente');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Format phone for consistent display (always show with country code)
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '-';

    // If phone already has country code, return as is
    if (phone.startsWith('+')) {
      return phone;
    }

    // If it's just 10 digits, assume Mexico and add +52
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `+52 ${cleanPhone}`;
    }

    // Otherwise return as is
    return phone;
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'warning' },
      confirmed: { label: 'Confirmada', color: 'success' },
      cancelled: { label: 'Cancelada', color: 'error' },
      completed: { label: 'Completada', color: 'info' },
      'no-show': { label: 'No asistió', color: 'default' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Filter patients by search term
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      patient.fullName?.toLowerCase().includes(search) ||
      patient.phone?.includes(search) ||
      patient.email?.toLowerCase().includes(search)
    );
  });

  // Paginate filtered results
  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Pacientes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Agregar Paciente
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPatients}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Patients Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Sexo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No se encontraron pacientes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>#{patient.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.fullName}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatPhoneDisplay(patient.phone)}</TableCell>
                      <TableCell>{patient.email || '-'}</TableCell>
                      <TableCell>{calculateAge(patient.birthDate)} años</TableCell>
                      <TableCell>
                        {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(patient)}
                          title="Ver detalles"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => navigate(`/patients/${patient.id}/medical-history`)}
                          title="Ver historial médico"
                        >
                          <HistoryIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(patient)}
                          title="Editar"
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

          <TablePagination
            component="div"
            count={filteredPatients.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
          />
        </Card>
      )}

      {/* Details Dialog with Tabs */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Detalles del Paciente #{selectedPatient?.id}
        </DialogTitle>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Información Personal" />
          <Tab label="Historial de Citas" />
        </Tabs>

        <DialogContent sx={{ mt: 2 }}>
          {selectedPatient && (
            <Box>
              {/* Tab 0: Personal Information */}
              {tabValue === 0 && (
                <Box>
                  <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                      Datos Personales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Nombre:</strong> {selectedPatient.fullName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Teléfono:</strong> {formatPhoneDisplay(selectedPatient.phone)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Email:</strong> {selectedPatient.email || 'No proporcionado'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CakeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Fecha de nacimiento:</strong> {formatDate(selectedPatient.birthDate)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Edad:</strong> {calculateAge(selectedPatient.birthDate)} años
                        </Typography>
                        <Typography variant="body2">
                          <strong>Sexo:</strong> {selectedPatient.gender === 'male' ? 'Masculino' : 'Femenino'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {selectedPatient.address && (
                    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                        Dirección
                      </Typography>
                      <Typography variant="body2">{selectedPatient.address}</Typography>
                    </Paper>
                  )}

                  {selectedPatient.allergies && (
                    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                        Alergias
                      </Typography>
                      <Typography variant="body2">{selectedPatient.allergies}</Typography>
                    </Paper>
                  )}

                  {selectedPatient.notes && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                        Notas
                      </Typography>
                      <Typography variant="body2">{selectedPatient.notes}</Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {/* Tab 1: Appointment History */}
              {tabValue === 1 && (
                <Box>
                  {appointmentsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : patientAppointments.length === 0 ? (
                    <Alert severity="info">
                      Este paciente no tiene citas registradas.
                    </Alert>
                  ) : (
                    <List>
                      {patientAppointments.map((apt, index) => (
                        <Box key={apt.id}>
                          <ListItem alignItems="flex-start">
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {apt.Service?.name}
                                  </Typography>
                                  {getStatusChip(apt.status)}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    📅 {formatDate(apt.appointmentDate)} - {formatTime(apt.appointmentTime)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    👨‍⚕️ Dr. {apt.Doctor?.fullName}
                                  </Typography>
                                  {apt.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      📝 {apt.notes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < patientAppointments.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button
            onClick={() => {
              setDetailsOpen(false);
              navigate(`/patients/${selectedPatient.id}/medical-history`);
            }}
            variant="contained"
            startIcon={<HistoryIcon />}
          >
            Ver Historial Médico
          </Button>
          <Button onClick={() => setDetailsOpen(false)} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setValidationErrors({ fullName: '', phone: '', email: '', birthDate: '', gender: '' });
          setError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Paciente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo *"
                value={editForm.fullName}
                onChange={(e) => handleEditFieldChange('fullName', e.target.value)}
                error={Boolean(validationErrors.fullName)}
                helperText={validationErrors.fullName || 'Ingresa nombre y apellido completos'}
                placeholder="Ej: Juan Pérez García"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Código</InputLabel>
                  <Select
                    value={editForm.phoneCountryCode}
                    label="Código"
                    onChange={(e) => setEditForm({ ...editForm, phoneCountryCode: e.target.value })}
                    sx={{
                      fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Arial, sans-serif',
                      '& .MuiSelect-select': {
                        fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Arial, sans-serif'
                      }
                    }}
                  >
                    {COUNTRY_CODES.map((country, index) => (
                      <MenuItem
                        key={index}
                        value={country.code}
                        sx={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}
                      >
                        {country.flag} {country.country} ({country.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Teléfono *"
                  value={editForm.phone}
                  onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                  error={Boolean(validationErrors.phone)}
                  helperText={validationErrors.phone || '10 dígitos'}
                  placeholder="5512345678"
                  required
                  type="tel"
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditFieldChange('email', e.target.value)}
                error={Boolean(validationErrors.email)}
                helperText={validationErrors.email || 'Opcional'}
                placeholder="ejemplo@correo.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Nacimiento *"
                value={editForm.birthDate}
                onChange={(e) => handleEditFieldChange('birthDate', e.target.value)}
                error={Boolean(validationErrors.birthDate)}
                helperText={validationErrors.birthDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Sexo *"
                value={editForm.gender}
                onChange={(e) => handleEditFieldChange('gender', e.target.value)}
                error={Boolean(validationErrors.gender)}
                helperText={validationErrors.gender}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                required
              >
                <option value="">-- Seleccionar --</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                multiline
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alergias"
                multiline
                rows={2}
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditOpen(false);
              setValidationErrors({ fullName: '', phone: '', email: '', birthDate: '', gender: '' });
              setError('');
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={!editForm.fullName || !editForm.phone || !editForm.birthDate || !editForm.gender}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Patient Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setValidationErrors({ fullName: '', phone: '', email: '', birthDate: '', gender: '' });
          setError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Paciente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo *"
                value={createForm.fullName}
                onChange={(e) => handleCreateFieldChange('fullName', e.target.value)}
                error={Boolean(validationErrors.fullName)}
                helperText={validationErrors.fullName || 'Ingresa nombre y apellido completos'}
                placeholder="Ej: Juan Pérez García"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Código</InputLabel>
                  <Select
                    value={createForm.phoneCountryCode}
                    label="Código"
                    onChange={(e) => setCreateForm({ ...createForm, phoneCountryCode: e.target.value })}
                    sx={{
                      fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Arial, sans-serif',
                      '& .MuiSelect-select': {
                        fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", Arial, sans-serif'
                      }
                    }}
                  >
                    {COUNTRY_CODES.map((country, index) => (
                      <MenuItem
                        key={index}
                        value={country.code}
                        sx={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}
                      >
                        {country.flag} {country.country} ({country.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Teléfono *"
                  value={createForm.phone}
                  onChange={(e) => handleCreateFieldChange('phone', e.target.value)}
                  error={Boolean(validationErrors.phone)}
                  helperText={validationErrors.phone || '10 dígitos'}
                  placeholder="5512345678"
                  required
                  type="tel"
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(e) => handleCreateFieldChange('email', e.target.value)}
                error={Boolean(validationErrors.email)}
                helperText={validationErrors.email || 'Opcional'}
                placeholder="ejemplo@correo.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Nacimiento *"
                value={createForm.birthDate}
                onChange={(e) => handleCreateFieldChange('birthDate', e.target.value)}
                error={Boolean(validationErrors.birthDate)}
                helperText={validationErrors.birthDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Sexo *"
                value={createForm.gender}
                onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                error={Boolean(validationErrors.gender)}
                helperText={validationErrors.gender}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                required
              >
                <option value="">-- Seleccionar --</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                placeholder="Calle, número, colonia, ciudad"
                helperText="Opcional"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setValidationErrors({ fullName: '', phone: '', email: '', birthDate: '', gender: '' });
              setError('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!createForm.fullName || !createForm.phone || !createForm.birthDate || !createForm.gender}
          >
            Crear Paciente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients;
