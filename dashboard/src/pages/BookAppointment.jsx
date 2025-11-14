import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  Person as PersonIcon,
  MedicalServices as ServiceIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const steps = ['Paciente', 'Doctor', 'Fecha y Hora', 'Pago'];

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

const BookAppointment = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data from API
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  // Form data
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatientDialog, setNewPatientDialog] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: '',
    phone: '',
    phoneCountryCode: '+52',
    email: '',
    birthDate: '',
    gender: 'female',
    address: ''
  });

  // Validation errors for new patient form
  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: ''
  });

  const [bookingForm, setBookingForm] = useState({
    serviceId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    paymentMethod: 'efectivo',
    depositPaid: false,
    notes: ''
  });

  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    loadPatients();
    loadServices();
    loadDoctors();
    loadBlockedDates();
  }, []);

  useEffect(() => {
    if (bookingForm.serviceId && bookingForm.appointmentDate) {
      checkAvailability();
    } else {
      setAvailableSlots([]);
    }
  }, [bookingForm.serviceId, bookingForm.appointmentDate]);

  const loadPatients = async () => {
    try {
      const response = await axios.get(`${API_URL}/patients`, {
        headers: getAuthHeader()
      });
      setPatients(response.data.data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/services`, {
        headers: getAuthHeader()
      });
      const activeServices = response.data.data?.filter(s => s.isActive) || [];
      setServices(activeServices);

      // Auto-select first service if available
      if (activeServices.length > 0 && !bookingForm.serviceId) {
        const firstService = activeServices[0];
        setSelectedService(firstService);
        setBookingForm(prev => ({ ...prev, serviceId: firstService.id }));
      }
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors`, {
        headers: getAuthHeader()
      });
      setDoctors(response.data.data?.filter(d => d.isActive) || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadBlockedDates = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/blocked-dates`, {
        headers: getAuthHeader()
      });
      // Extract just the date strings in YYYY-MM-DD format
      const dates = response.data.data?.map(item => item.date) || [];
      setBlockedDates(dates);
    } catch (err) {
      console.error('Error loading blocked dates:', err);
      // Don't show error to user, just continue
    }
  };

  const checkAvailability = async () => {
    try {
      setLoading(true);
      // Use the same public endpoint as public booking form for consistency
      const response = await axios.get(`${API_URL}/public/available-slots`, {
        params: {
          serviceId: bookingForm.serviceId,
          date: bookingForm.appointmentDate
        }
      });

      // Extract time slots from response
      if (response.data.success && response.data.data) {
        const timeSlots = response.data.data.map(slot => slot.time);
        setAvailableSlots(timeSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
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
    // Check for at least two words (first name and last name)
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
    // Remove spaces and dashes for validation
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
    // Basic email format validation
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
    const age = today.getFullYear() - date.getFullYear();

    if (age > 120) {
      return 'Fecha de nacimiento inválida';
    }
    if (age < 0) {
      return 'La fecha no puede ser futura';
    }
    return '';
  };

  const validateNewPatientForm = () => {
    const errors = {
      fullName: validateFullName(newPatientForm.fullName),
      phone: validatePhone(newPatientForm.phone),
      email: validateEmail(newPatientForm.email),
      birthDate: validateBirthDate(newPatientForm.birthDate)
    };

    setValidationErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error !== '');
  };

  const handleNewPatientFieldChange = (field, value) => {
    // Special handling for phone - only allow digits and limit to 10 characters
    if (field === 'phone') {
      const cleaned = value.replace(/\D/g, ''); // Remove non-digits
      const limited = cleaned.slice(0, 10); // Limit to 10 digits
      setNewPatientForm({ ...newPatientForm, [field]: limited });
    } else {
      setNewPatientForm({ ...newPatientForm, [field]: value });
    }

    // Clear error for this field when user starts typing
    setValidationErrors({ ...validationErrors, [field]: '' });
  };

  const handleCreatePatient = async () => {
    // Validate form before submission
    if (!validateNewPatientForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }
    try {
      setError('');

      // Combine country code with phone number
      const fullPhone = `${newPatientForm.phoneCountryCode} ${newPatientForm.phone}`;

      const response = await axios.post(`${API_URL}/patients`, {
        ...newPatientForm,
        phone: fullPhone
      }, {
        headers: getAuthHeader()
      });

      const newPatient = response.data.data;
      setPatients([...patients, newPatient]);
      setSelectedPatient(newPatient);
      setNewPatientDialog(false);
      setNewPatientForm({
        fullName: '',
        phone: '',
        phoneCountryCode: '+52',
        email: '',
        birthDate: '',
        gender: 'female',
        address: ''
      });
      setValidationErrors({
        fullName: '',
        phone: '',
        email: '',
        birthDate: ''
      });
      setSuccess('Paciente creado exitosamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear paciente');
    }
  };

  const handleDoctorChange = (doctorId) => {
    // Auto-select the first active service when doctor is selected
    const firstService = services.length > 0 ? services[0] : null;
    setSelectedService(firstService);
    setBookingForm({
      ...bookingForm,
      doctorId,
      serviceId: firstService ? firstService.id : ''
    });
  };

  const handleNext = () => {
    setError('');

    // Validate current step
    if (activeStep === 0 && !selectedPatient) {
      setError('Por favor seleccione un paciente');
      return;
    }
    if (activeStep === 1 && (!bookingForm.doctorId || !bookingForm.serviceId)) {
      setError('Por favor seleccione un doctor');
      return;
    }
    if (activeStep === 2 && (!bookingForm.appointmentDate || !bookingForm.appointmentTime)) {
      setError('Por favor seleccione fecha y hora');
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const appointmentData = {
        patientId: selectedPatient.id,
        serviceId: bookingForm.serviceId,
        doctorId: bookingForm.doctorId,
        appointmentDate: bookingForm.appointmentDate,
        appointmentTime: bookingForm.appointmentTime,
        paymentMethod: bookingForm.paymentMethod,
        depositPaid: bookingForm.depositPaid,
        notes: bookingForm.notes,
        status: bookingForm.depositPaid ? 'confirmed' : 'pending'
      };

      await axios.post(`${API_URL}/admin/appointments/create`, appointmentData, {
        headers: getAuthHeader()
      });

      setSuccess('Cita creada exitosamente');
      setTimeout(() => {
        navigate('/appointments');
      }, 1500);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        // Patient Selection
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Seleccionar Paciente
            </Typography>

            <Autocomplete
              options={patients}
              getOptionLabel={(option) => `${option.fullName} - ${option.phone}`}
              value={selectedPatient}
              onChange={(e, newValue) => setSelectedPatient(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar paciente"
                  placeholder="Nombre o teléfono..."
                  fullWidth
                />
              )}
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              onClick={() => setNewPatientDialog(true)}
              fullWidth
            >
              + Crear Nuevo Paciente
            </Button>

            {selectedPatient && (
              <Card variant="outlined" sx={{ mt: 3, bgcolor: 'primary.lighter' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Paciente Seleccionado
                  </Typography>
                  <Typography><strong>Nombre:</strong> {selectedPatient.fullName}</Typography>
                  <Typography><strong>Teléfono:</strong> {selectedPatient.phone}</Typography>
                  <Typography><strong>Email:</strong> {selectedPatient.email || 'N/A'}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        // Doctor Selection
        return (
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ServiceIcon color="primary" />
              Seleccionar Doctor
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={bookingForm.doctorId}
                label="Doctor"
                onChange={(e) => handleDoctorChange(e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    py: 2
                  }
                }}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id} sx={{ py: 1.5 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {doctor.fullName}
                      </Typography>
                      {doctor.specialty && (
                        <Typography variant="body2" color="text.secondary">
                          {doctor.specialty}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {bookingForm.doctorId && selectedService && (
              <Card variant="outlined" sx={{ bgcolor: 'primary.lighter', p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Detalles del Servicio
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>Servicio:</strong> {selectedService.name}</Typography>
                  <Typography><strong>Precio:</strong> ${selectedService.price}</Typography>
                  <Typography><strong>Anticipo requerido:</strong> ${selectedService.depositAmount} ({selectedService.depositPercentage}%)</Typography>
                  <Typography><strong>Duración:</strong> {selectedService.duration} min</Typography>
                </Box>
              </Card>
            )}
          </Box>
        );

      case 2:
        // Date and Time Selection
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon color="primary" />
              Fecha y Hora
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                  label="Fecha de la cita *"
                  value={bookingForm.appointmentDate ? dayjs(bookingForm.appointmentDate) : null}
                  onChange={(newValue) => {
                    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
                    setBookingForm({ ...bookingForm, appointmentDate: formattedDate, appointmentTime: '' });
                    setError('');
                  }}
                  minDate={dayjs()}
                  shouldDisableDate={(date) => {
                    // Disable Sundays (0 = Sunday)
                    const dayOfWeek = date.day();
                    if (dayOfWeek === 0) return true;

                    // Disable blocked dates
                    const dateStr = date.format('YYYY-MM-DD');
                    return blockedDates.includes(dateStr);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>

              <Box>
                <Typography variant="body2" gutterBottom fontWeight="medium">
                  Horarios Disponibles: *
                </Typography>
                {!bookingForm.appointmentDate ? (
                  <Typography variant="body2" color="text.secondary">
                    Selecciona una fecha para ver los horarios disponibles
                  </Typography>
                ) : loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando horarios...
                    </Typography>
                  </Box>
                ) : availableSlots.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={bookingForm.appointmentTime === slot ? 'contained' : 'outlined'}
                        onClick={() => setBookingForm({ ...bookingForm, appointmentTime: slot })}
                        size="medium"
                      >
                        {slot}
                      </Button>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha.
                  </Alert>
                )}
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas adicionales"
                  multiline
                  rows={3}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Motivo de la consulta, observaciones, etc."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        // Payment Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon color="primary" />
              Información de Pago
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'warning.lighter', mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">
                      Anticipo requerido: ${selectedService?.depositAmount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total del servicio: ${selectedService?.price || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Método de Pago</FormLabel>
                  <RadioGroup
                    value={bookingForm.paymentMethod}
                    onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })}
                  >
                    <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
                    <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia" />
                    <FormControlLabel value="tarjeta" control={<Radio />} label="Tarjeta" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Estado del Anticipo</FormLabel>
                  <RadioGroup
                    value={bookingForm.depositPaid ? 'paid' : 'pending'}
                    onChange={(e) => setBookingForm({ ...bookingForm, depositPaid: e.target.value === 'paid' })}
                  >
                    <FormControlLabel value="paid" control={<Radio />} label="Anticipo pagado (confirmar cita inmediatamente)" />
                    <FormControlLabel value="pending" control={<Radio />} label="Anticipo pendiente (cita en estado pendiente)" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Agendar Nueva Cita
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Anterior
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                  {loading ? 'Creando...' : 'Crear Cita'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Create New Patient Dialog */}
      <Dialog
        open={newPatientDialog}
        onClose={() => {
          setNewPatientDialog(false);
          setValidationErrors({ fullName: '', phone: '', email: '', birthDate: '' });
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
                value={newPatientForm.fullName}
                onChange={(e) => handleNewPatientFieldChange('fullName', e.target.value)}
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
                    value={newPatientForm.phoneCountryCode}
                    label="Código"
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phoneCountryCode: e.target.value })}
                  >
                    {COUNTRY_CODES.map((country, index) => (
                      <MenuItem key={index} value={country.code}>
                        {country.flag} {country.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Teléfono *"
                  value={newPatientForm.phone}
                  onChange={(e) => handleNewPatientFieldChange('phone', e.target.value)}
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
                value={newPatientForm.email}
                onChange={(e) => handleNewPatientFieldChange('email', e.target.value)}
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
                value={newPatientForm.birthDate}
                onChange={(e) => handleNewPatientFieldChange('birthDate', e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={newPatientForm.gender}
                  label="Sexo"
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                >
                  <MenuItem value="female">Femenino</MenuItem>
                  <MenuItem value="male">Masculino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={newPatientForm.address}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                placeholder="Calle, número, colonia, ciudad"
                helperText="Opcional"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNewPatientDialog(false);
              setValidationErrors({ fullName: '', phone: '', email: '', birthDate: '' });
              setError('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreatePatient}
            variant="contained"
            disabled={!newPatientForm.fullName || !newPatientForm.phone || !newPatientForm.birthDate}
          >
            Crear Paciente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookAppointment;
