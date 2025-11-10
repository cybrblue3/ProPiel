import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Checkbox,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getServices, getBlockedDates, getAvailableSlots, submitStep1, submitStep3, submitStep4, getPaymentConfig, releaseHold } from './api';
import Logo from './Logo';

const steps = ['Datos', 'Confirmar', 'Pago', 'Consentimiento', 'Listo'];

// Email domain whitelist - only allow these trusted email providers
// Must match backend validation.js
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'yahoo.com',
  'protonmail.com',
  'live.com',
  'me.com'
];

// Also allow educational and government domains
const ALLOWED_DOMAIN_PATTERNS = [
  /\.edu$/i,       // Educational institutions (e.g., student.edu)
  /\.edu\.[a-z]{2}$/i,  // International edu (e.g., student.edu.mx)
  /\.gob\.[a-z]{2}$/i   // Government (e.g., doctor.gob.mx)
];

// Country codes for phone numbers (Mexico first, then alphabetical)
const COUNTRY_CODES = [
  // Mexico - Default
  { code: '+52', country: 'México', flag: '🇲🇽' },

  // All other countries (alphabetical)
  { code: '+93', country: 'Afganistán', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+966', country: 'Arabia Saudita', flag: '🇸🇦' },
  { code: '+213', country: 'Argelia', flag: '🇩🇿' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaiyán', flag: '🇦🇿' },
  { code: '+1-242', country: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', country: 'Baréin', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladés', flag: '🇧🇩' },
  { code: '+1-246', country: 'Barbados', flag: '🇧🇧' },
  { code: '+375', country: 'Bielorrusia', flag: '🇧🇾' },
  { code: '+32', country: 'Bélgica', flag: '🇧🇪' },
  { code: '+501', country: 'Belice', flag: '🇧🇿' },
  { code: '+229', country: 'Benín', flag: '🇧🇯' },
  { code: '+975', country: 'Bután', flag: '🇧🇹' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'Bosnia y Herzegovina', flag: '🇧🇦' },
  { code: '+267', country: 'Botsuana', flag: '🇧🇼' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+673', country: 'Brunéi', flag: '🇧🇳' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'Camboya', flag: '🇰🇭' },
  { code: '+237', country: 'Camerún', flag: '🇨🇲' },
  { code: '+1', country: 'Canadá', flag: '🇨🇦' },
  { code: '+238', country: 'Cabo Verde', flag: '🇨🇻' },
  { code: '+236', country: 'República Centroafricana', flag: '🇨🇫' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+357', country: 'Chipre', flag: '🇨🇾' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'Comoras', flag: '🇰🇲' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'Congo (RDC)', flag: '🇨🇩' },
  { code: '+850', country: 'Corea del Norte', flag: '🇰🇵' },
  { code: '+82', country: 'Corea del Sur', flag: '🇰🇷' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+225', country: 'Costa de Marfil', flag: '🇨🇮' },
  { code: '+385', country: 'Croacia', flag: '🇭🇷' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+45', country: 'Dinamarca', flag: '🇩🇰' },
  { code: '+1-767', country: 'Dominica', flag: '🇩🇲' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', country: 'Egipto', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+971', country: 'Emiratos Árabes Unidos', flag: '🇦🇪' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+421', country: 'Eslovaquia', flag: '🇸🇰' },
  { code: '+386', country: 'Eslovenia', flag: '🇸🇮' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+268', country: 'Esuatini', flag: '🇸🇿' },
  { code: '+251', country: 'Etiopía', flag: '🇪🇹' },
  { code: '+63', country: 'Filipinas', flag: '🇵🇭' },
  { code: '+358', country: 'Finlandia', flag: '🇫🇮' },
  { code: '+679', country: 'Fiyi', flag: '🇫🇯' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+241', country: 'Gabón', flag: '🇬🇦' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+30', country: 'Grecia', flag: '🇬🇷' },
  { code: '+1-473', country: 'Granada', flag: '🇬🇩' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+245', country: 'Guinea-Bisáu', flag: '🇬🇼' },
  { code: '+240', country: 'Guinea Ecuatorial', flag: '🇬🇶' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+509', country: 'Haití', flag: '🇭🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+36', country: 'Hungría', flag: '🇭🇺' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Irán', flag: '🇮🇷' },
  { code: '+964', country: 'Irak', flag: '🇮🇶' },
  { code: '+353', country: 'Irlanda', flag: '🇮🇪' },
  { code: '+354', country: 'Islandia', flag: '🇮🇸' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+1-876', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', country: 'Japón', flag: '🇯🇵' },
  { code: '+962', country: 'Jordania', flag: '🇯🇴' },
  { code: '+7', country: 'Kazajistán', flag: '🇰🇿' },
  { code: '+254', country: 'Kenia', flag: '🇰🇪' },
  { code: '+996', country: 'Kirguistán', flag: '🇰🇬' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+266', country: 'Lesoto', flag: '🇱🇸' },
  { code: '+371', country: 'Letonia', flag: '🇱🇻' },
  { code: '+961', country: 'Líbano', flag: '🇱🇧' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+218', country: 'Libia', flag: '🇱🇾' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'Lituania', flag: '🇱🇹' },
  { code: '+352', country: 'Luxemburgo', flag: '🇱🇺' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+60', country: 'Malasia', flag: '🇲🇾' },
  { code: '+265', country: 'Malaui', flag: '🇲🇼' },
  { code: '+960', country: 'Maldivas', flag: '🇲🇻' },
  { code: '+223', country: 'Malí', flag: '🇲🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+212', country: 'Marruecos', flag: '🇲🇦' },
  { code: '+692', country: 'Islas Marshall', flag: '🇲🇭' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', country: 'Mauricio', flag: '🇲🇺' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', country: 'Moldavia', flag: '🇲🇩' },
  { code: '+377', country: 'Mónaco', flag: '🇲🇨' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', country: 'Níger', flag: '🇳🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+47', country: 'Noruega', flag: '🇳🇴' },
  { code: '+64', country: 'Nueva Zelanda', flag: '🇳🇿' },
  { code: '+968', country: 'Omán', flag: '🇴🇲' },
  { code: '+31', country: 'Países Bajos', flag: '🇳🇱' },
  { code: '+92', country: 'Pakistán', flag: '🇵🇰' },
  { code: '+680', country: 'Palaos', flag: '🇵🇼' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦' },
  { code: '+675', country: 'Papúa Nueva Guinea', flag: '🇵🇬' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+48', country: 'Polonia', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'Catar', flag: '🇶🇦' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+1-809', country: 'República Dominicana', flag: '🇩🇴' },
  { code: '+420', country: 'República Checa', flag: '🇨🇿' },
  { code: '+40', country: 'Rumania', flag: '🇷🇴' },
  { code: '+7', country: 'Rusia', flag: '🇷🇺' },
  { code: '+250', country: 'Ruanda', flag: '🇷🇼' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸' },
  { code: '+1-869', country: 'San Cristóbal y Nieves', flag: '🇰🇳' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+1-784', country: 'San Vicente y las Granadinas', flag: '🇻🇨' },
  { code: '+1-758', country: 'Santa Lucía', flag: '🇱🇨' },
  { code: '+239', country: 'Santo Tomé y Príncipe', flag: '🇸🇹' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'Sierra Leona', flag: '🇸🇱' },
  { code: '+65', country: 'Singapur', flag: '🇸🇬' },
  { code: '+963', country: 'Siria', flag: '🇸🇾' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+27', country: 'Sudáfrica', flag: '🇿🇦' },
  { code: '+249', country: 'Sudán', flag: '🇸🇩' },
  { code: '+211', country: 'Sudán del Sur', flag: '🇸🇸' },
  { code: '+46', country: 'Suecia', flag: '🇸🇪' },
  { code: '+41', country: 'Suiza', flag: '🇨🇭' },
  { code: '+597', country: 'Surinam', flag: '🇸🇷' },
  { code: '+66', country: 'Tailandia', flag: '🇹🇭' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+992', country: 'Tayikistán', flag: '🇹🇯' },
  { code: '+670', country: 'Timor Oriental', flag: '🇹🇱' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴' },
  { code: '+1-868', country: 'Trinidad y Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'Túnez', flag: '🇹🇳' },
  { code: '+993', country: 'Turkmenistán', flag: '🇹🇲' },
  { code: '+90', country: 'Turquía', flag: '🇹🇷' },
  { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
  { code: '+380', country: 'Ucrania', flag: '🇺🇦' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'Uzbekistán', flag: '🇺🇿' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', country: 'Ciudad del Vaticano', flag: '🇻🇦' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+253', country: 'Yibuti', flag: '🇩🇯' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabue', flag: '🇿🇼' }
];

export default function BookingForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [holdToken, setHoldToken] = useState('');
  const [paymentFile, setPaymentFile] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [calculatedAge, setCalculatedAge] = useState(null);
  const [ageError, setAgeError] = useState('');
  const [blockedDates, setBlockedDates] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    bookingForSelf: true,
    patientName: '',
    patientBirthDate: '',
    patientGender: '',
    patientPhone: '',
    patientPhoneCountryCode: '+52',
    patientEmail: '',
    bookerName: '',
    bookerPhone: '',
    bookerPhoneCountryCode: '+52',
    bookerEmail: '',
    bookerRelationship: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    isFirstVisit: false // Will be set to true automatically for Dermatology
  });

  // Load services and blocked dates on mount
  useEffect(() => {
    loadServices();
    loadBlockedDates();
  }, []);

  const loadServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data.data);
    } catch (err) {
      setError('Error al cargar servicios');
    }
  };

  const loadBlockedDates = async () => {
    try {
      const res = await getBlockedDates();
      setBlockedDates(res.data.data);
    } catch (err) {
      console.error('Error loading blocked dates:', err);
      // Don't show error to user, just continue
    }
  };

  // Load slots when service/date changes
  useEffect(() => {
    if (formData.serviceId && formData.appointmentDate) {
      loadSlots();
    }
  }, [formData.serviceId, formData.appointmentDate]);

  // Cleanup hold on component unmount (user closes tab/browser)
  useEffect(() => {
    return () => {
      // Note: If user closes browser/tab, hold will auto-expire after 10 minutes
      // We can't reliably clean up on page unload for DELETE requests
      // This is acceptable UX - slot becomes available after timeout
    };
  }, [holdToken, activeStep]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const res = await getAvailableSlots(formData.serviceId, formData.appointmentDate);
      if (res.data.success) {
        setSlots(res.data.data);
      } else {
        setSlots([]);
        setError(res.data.message);
      }
    } catch (err) {
      setError('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const newValue = e.target.value;

    // If changing service, update isFirstVisit based on service type
    if (field === 'serviceId') {
      const selectedService = services.find(s => s.id == newValue);
      const isDermatology = selectedService?.name === 'Dermatología';
      setFormData({
        ...formData,
        [field]: newValue,
        isFirstVisit: isDermatology ? true : false // Default to true for Dermatology
      });
    } else {
      setFormData({ ...formData, [field]: newValue });
    }

    setError('');
  };

  // Specialized handler for NAME fields - only allow letters, accents, and spaces
  const handleNameChange = (field) => (e) => {
    const value = e.target.value;
    // Regex: Only allow letters (A-Z, a-z), accents (Á,É,Í,Ó,Ú,Ñ,Ü), and spaces
    const nameRegex = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g;
    const filtered = value.replace(nameRegex, '');

    setFormData({ ...formData, [field]: filtered });
    setError('');
  };

  // Specialized handler for PHONE fields - only allow digits, max 10 characters
  const handlePhoneChange = (field) => (e) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits maximum
    const limited = digitsOnly.slice(0, 10);

    setFormData({ ...formData, [field]: limited });
    setError('');
  };

  const handleBack = async () => {
    // Release the hold if going back from step 1 (confirmation)
    if (activeStep === 1 && holdToken) {
      try {
        await releaseHold(holdToken);
        console.log('Hold released successfully');
        setHoldToken(''); // Clear the token
      } catch (err) {
        console.error('Error releasing hold:', err);
        // Don't block navigation even if release fails
      }
    }

    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) {
      setCalculatedAge(null);
      setAgeError('');
      return;
    }

    const today = new Date();
    const birth = new Date(birthDate);

    // Check if valid date
    if (isNaN(birth.getTime())) {
      setCalculatedAge(null);
      setAgeError('Fecha inválida');
      return;
    }

    // Calculate age
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    setCalculatedAge(age);

    // Validate age
    if (age < 0) {
      setAgeError('La fecha de nacimiento no puede ser en el futuro');
    } else if (age > 120) {
      setAgeError('Edad fuera de rango válido (máximo 120 años)');
    } else {
      setAgeError('');
    }
  };

  // Email validation helper function
  const validateEmail = (email) => {
    if (!email) return { valid: true }; // Email is optional, so empty is valid

    // Check if email has @ symbol and split into parts
    const parts = email.split('@');
    if (parts.length !== 2) {
      return { valid: false, message: 'Formato de email inválido' };
    }

    const domain = parts[1].toLowerCase();

    // Check if domain is in whitelist
    if (ALLOWED_EMAIL_DOMAINS.includes(domain)) {
      return { valid: true };
    }

    // Check if domain matches allowed patterns (.edu, .gob, etc.)
    const matchesPattern = ALLOWED_DOMAIN_PATTERNS.some(pattern => pattern.test(domain));
    if (matchesPattern) {
      return { valid: true };
    }

    // Domain not allowed
    return {
      valid: false,
      message: `Email no permitido. Dominios aceptados: ${ALLOWED_EMAIL_DOMAINS.join(', ')}, o dominios .edu/.gob`
    };
  };

  const handleStep1Submit = async () => {
    // Client-side validation: Check Terms & Conditions
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    // Client-side validation: Check Patient Email (if booking for self)
    if (formData.bookingForSelf && formData.patientEmail) {
      const emailValidation = validateEmail(formData.patientEmail);
      if (!emailValidation.valid) {
        setError(emailValidation.message);
        return;
      }
    }

    // Client-side validation: Check Booker Email (if booking for someone else)
    if (!formData.bookingForSelf && formData.bookerEmail) {
      const emailValidation = validateEmail(formData.bookerEmail);
      if (!emailValidation.valid) {
        setError(emailValidation.message);
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      const res = await submitStep1(formData);
      setHoldToken(res.data.data.holdToken);
      setPaymentReference(res.data.data.paymentReference);
      setActiveStep(1);
    } catch (err) {
      console.error('Step 1 validation error:', err.response?.data);

      // Show specific field errors if available
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        setError(`Errores de validación:\n${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Error en validación');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (file) => {
    try {
      setLoading(true);
      setError('');

      const formDataPayload = new FormData();
      formDataPayload.append('comprobante', file);
      formDataPayload.append('holdToken', holdToken);
      formDataPayload.append('bookingData', JSON.stringify(formData));

      const res = await submitStep3(formDataPayload);

      // Capture appointment ID for consent form
      if (res.data.data && res.data.data.appointmentId) {
        setAppointmentId(res.data.data.appointmentId);
      }

      // Move to Step 4: Consent (index 3)
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir comprobante');
    } finally {
      setLoading(false);
    }
  };

  // Initialize canvas for signature when it's mounted
  useEffect(() => {
    if (!canvasRef) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startDrawing = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

      ctx.beginPath();
      ctx.moveTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
    };

    const stopDrawing = () => {
      isDrawing = false;
      ctx.beginPath();
    };

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [canvasRef]);

  // Clear signature canvas
  const clearSignature = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    setSignatureData(null);
  };

  // Check if signature canvas is blank
  const isCanvasBlank = (canvas) => {
    const blankCanvas = document.createElement('canvas');
    blankCanvas.width = canvas.width;
    blankCanvas.height = canvas.height;
    const blankCtx = blankCanvas.getContext('2d');
    blankCtx.fillStyle = 'white';
    blankCtx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);

    return canvas.toDataURL() === blankCanvas.toDataURL();
  };

  // Handle consent form submission
  const handleConsentSubmit = async () => {
    if (!canvasRef) {
      setError('Error: Canvas no inicializado');
      return;
    }

    if (isCanvasBlank(canvasRef)) {
      setError('Por favor firma antes de continuar');
      return;
    }

    if (!appointmentId) {
      setError('Error: No se encontró el ID de la cita');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get signature as base64 data URL
      const signatureDataURL = canvasRef.toDataURL('image/png');

      // Send signature and appointment ID to backend
      const res = await submitStep4({
        appointmentId,
        signatureDataURL
      });

      console.log('Consent saved successfully:', res.data);

      // Move to Step 5: Success
      setActiveStep(4);
    } catch (err) {
      console.error('Error saving consent:', err);
      setError(err.response?.data?.message || 'Error al guardar el consentimiento');
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Patient Data Form
  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>¿Para quién es esta cita?</Typography>
      <RadioGroup
        value={formData.bookingForSelf}
        onChange={(e) => setFormData({ ...formData, bookingForSelf: e.target.value === 'true' })}
        row
      >
        <FormControlLabel value={true} control={<Radio />} label="Para mí" />
        <FormControlLabel value={false} control={<Radio />} label="Para otra persona" />
      </RadioGroup>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Datos del Paciente</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Nombre Completo *"
          value={formData.patientName}
          onChange={handleNameChange('patientName')}
          placeholder="Ej: Juan Pérez García"
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              label="Fecha de Nacimiento *"
              value={formData.patientBirthDate ? dayjs(formData.patientBirthDate) : null}
              onChange={(newValue) => {
                const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
                setFormData({ ...formData, patientBirthDate: formattedDate });
                calculateAge(formattedDate);
                setError('');
              }}
              maxDate={dayjs()}
              minDate={dayjs().subtract(120, 'year')}
              defaultCalendarMonth={dayjs().subtract(25, 'year')}
              openTo="year"
              views={['year', 'month', 'day']}
              slotProps={{
                textField: {
                  sx: { flex: '1 1 calc(50% - 8px)', minWidth: '250px' },
                  placeholder: 'Ej: 12/12/2002'
                }
              }}
            />
          </LocalizationProvider>

          {/* Display calculated age or error */}
          {calculatedAge !== null && !ageError && (
            <Typography
              variant="body2"
              sx={{
                mt: -1.5,
                mb: 0.5,
                ml: 1,
                color: 'success.main',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              ✓ Edad: {calculatedAge} años
            </Typography>
          )}
          {ageError && (
            <Typography
              variant="body2"
              sx={{
                mt: -1.5,
                mb: 0.5,
                ml: 1,
                color: 'error.main',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              ⚠ {ageError}
            </Typography>
          )}

          <TextField
            sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}
            select
            label="Sexo *"
            value={formData.patientGender}
            onChange={handleChange('patientGender')}
          >
            <MenuItem value="male">Masculino</MenuItem>
            <MenuItem value="female">Femenino</MenuItem>
          </TextField>
        </Box>
        {formData.bookingForSelf && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Phone with country code selector */}
            <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px', display: 'flex', gap: 1 }}>
              <TextField
                select
                label="Código"
                value={formData.patientPhoneCountryCode}
                onChange={handleChange('patientPhoneCountryCode')}
                sx={{ width: '120px' }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: { maxHeight: 400 }
                    }
                  },
                  renderValue: (value) => {
                    const country = COUNTRY_CODES.find(c => c.code === value);
                    return country ? `${country.flag} ${country.code}` : value;
                  }
                }}
              >
                {COUNTRY_CODES.map((country) => (
                  <MenuItem key={`${country.code}-${country.country}`} value={country.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>{country.flag}</span>
                      <span style={{ fontWeight: 500 }}>{country.code}</span>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>{country.country}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                sx={{ flex: 1 }}
                label="Teléfono *"
                value={formData.patientPhone}
                onChange={handlePhoneChange('patientPhone')}
                placeholder="Ej: 7551234567"
                inputProps={{ maxLength: 10, inputMode: 'numeric' }}
              />
            </Box>
            <TextField
              sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}
              label="Email (opcional)"
              value={formData.patientEmail}
              onChange={handleChange('patientEmail')}
            />
          </Box>
        )}
      </Box>

      {!formData.bookingForSelf && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Tus Datos de Contacto</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}
                label="Tu Nombre *"
                value={formData.bookerName}
                onChange={handleNameChange('bookerName')}
                placeholder="Ej: María López Rodríguez"
              />
              <TextField
                sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}
                select
                label="Relación con el paciente *"
                value={formData.bookerRelationship}
                onChange={handleChange('bookerRelationship')}
              >
                <MenuItem value="hijo">Hijo</MenuItem>
                <MenuItem value="hija">Hija</MenuItem>
                <MenuItem value="madre">Madre</MenuItem>
                <MenuItem value="padre">Padre</MenuItem>
                <MenuItem value="esposo">Esposo</MenuItem>
                <MenuItem value="esposa">Esposa</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Booker phone with country code selector */}
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px', display: 'flex', gap: 1 }}>
                <TextField
                  select
                  label="Código"
                  value={formData.bookerPhoneCountryCode}
                  onChange={handleChange('bookerPhoneCountryCode')}
                  sx={{ width: '120px' }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { maxHeight: 400 }
                      }
                    },
                    renderValue: (value) => {
                      const country = COUNTRY_CODES.find(c => c.code === value);
                      return country ? `${country.flag} ${country.code}` : value;
                    }
                  }}
                >
                  {COUNTRY_CODES.map((country) => (
                    <MenuItem key={`${country.code}-${country.country}-booker`} value={country.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.2rem' }}>{country.flag}</span>
                        <span style={{ fontWeight: 500 }}>{country.code}</span>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>{country.country}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  sx={{ flex: 1 }}
                  label="Tu Teléfono *"
                  value={formData.bookerPhone}
                  onChange={handlePhoneChange('bookerPhone')}
                  placeholder="Ej: 7551234567"
                  inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                />
              </Box>
              <TextField
                sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}
                label="Tu Email (opcional)"
                value={formData.bookerEmail}
                onChange={handleChange('bookerEmail')}
              />
            </Box>
          </Box>
        </>
      )}

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Detalles de la Cita</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}
            select
            label="Servicio *"
            value={formData.serviceId}
            onChange={handleChange('serviceId')}
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} - ${s.price} MXN
              </MenuItem>
            ))}
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              label="Fecha *"
              value={formData.appointmentDate ? dayjs(formData.appointmentDate) : null}
              onChange={(newValue) => {
                const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
                setFormData({ ...formData, appointmentDate: formattedDate });
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
                  sx: { flex: '1 1 calc(50% - 8px)', minWidth: '250px' }
                }
              }}
            />
          </LocalizationProvider>
        </Box>
        <Box>
          <Typography variant="body2" gutterBottom>Horarios Disponibles:</Typography>
          {loading ? <CircularProgress size={20} /> : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {slots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={formData.appointmentTime === slot.time ? 'contained' : 'outlined'}
                  onClick={() => setFormData({ ...formData, appointmentTime: slot.time })}
                >
                  {slot.displayTime}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* First Visit Checkbox (Only for Dermatology) */}
      {formData.serviceId && services.find(s => s.id == formData.serviceId)?.name === 'Dermatología' && (
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isFirstVisit}
                onChange={(e) => setFormData({ ...formData, isFirstVisit: e.target.checked })}
                color="primary"
              />
            }
            label="¿Es su primera visita a la clínica?"
          />
        </Box>
      )}

      {/* Terms & Conditions Checkbox */}
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              color="primary"
            />
          }
          label={
            <span>
              Acepto los{' '}
              <Typography
                component="span"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.dark' }
                }}
                onClick={(e) => {
                  e.preventDefault(); // Prevent checkbox from toggling
                  setTermsDialogOpen(true);
                }}
              >
                términos y condiciones
              </Typography>
              {' *'}
            </span>
          }
        />
        {!termsAccepted && error.includes('términos') && (
          <FormHelperText error>
            Debes aceptar los términos y condiciones
          </FormHelperText>
        )}
      </Box>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleStep1Submit}
        disabled={loading}
      >
        Continuar
      </Button>
    </Box>
  );

  // Render Step 2: Confirmation
  const renderStep2 = () => {
    const loadPaymentConfig = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Loading payment config...');
        const res = await getPaymentConfig();
        console.log('Payment config received:', res.data);
        setPaymentConfig(res.data.data);
        setActiveStep(2);
      } catch (err) {
        console.error('Error loading payment config:', err);
        setError(err.response?.data?.message || 'Error al cargar configuración de pago');
      } finally {
        setLoading(false);
      }
    };

    const selectedService = services.find(s => s.id == formData.serviceId);

    return (
      <Box>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
          Confirma tus Datos
        </Typography>

        {/* Patient Information Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            bgcolor: 'rgba(33, 150, 243, 0.08)',
            borderLeft: '4px solid',
            borderColor: 'primary.main'
          }}
        >
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}>
            Datos del Paciente
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Nombre:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.patientName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Nacimiento:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.patientBirthDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Sexo:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.patientGender === 'male' ? 'Masculino' : 'Femenino'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Appointment Details Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            bgcolor: 'rgba(76, 175, 80, 0.08)',
            borderLeft: '4px solid',
            borderColor: 'success.main'
          }}
        >
          <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 600, letterSpacing: 1 }}>
            Detalles de la Cita
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Servicio:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedService?.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Fecha:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.appointmentDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Hora:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.appointmentTime}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                Precio:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.dark' }}>
                ${selectedService?.price} MXN
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Booker Information Card (only if booking for someone else) */}
        {!formData.bookingForSelf && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: 'rgba(255, 152, 0, 0.08)',
              borderLeft: '4px solid',
              borderColor: 'warning.main'
            }}
          >
            <Typography variant="overline" sx={{ color: 'warning.dark', fontWeight: 600, letterSpacing: 1 }}>
              Agendado Por
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.bookerName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ({formData.bookerRelationship})
              </Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            size="large"
          >
            Volver
          </Button>
          <Button
            variant="contained"
            onClick={loadPaymentConfig}
            disabled={loading}
            size="large"
          >
            {loading ? 'Cargando...' : 'Continuar a Pago'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Render Step 3: Payment Upload
  const renderStep3 = () => {
    const selectedService = services.find(s => s.id == formData.serviceId);
    const depositAmount = selectedService ? (selectedService.price * 0.5).toFixed(2) : 0;

    return (
      <Box>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
          Información de Pago
        </Typography>

        {/* Payment Amount Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'rgba(46, 125, 50, 0.1)',
            borderLeft: '4px solid',
            borderColor: 'success.main',
            textAlign: 'center'
          }}
        >
          <Typography variant="overline" sx={{ color: 'success.dark', fontWeight: 600, letterSpacing: 1 }}>
            Monto a Pagar (50% de depósito)
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color: 'success.dark' }}>
            ${depositAmount} MXN
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
            Restante: ${depositAmount} MXN en la clínica
          </Typography>
        </Paper>

        {/* Bank Account Information Card */}
        {paymentConfig && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1, mb: 2, display: 'block' }}>
              Datos Bancarios
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '100px' }}>
                  Banco:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {paymentConfig.bankName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '100px' }}>
                  Titular:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {paymentConfig.accountHolder}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '100px' }}>
                  Cuenta:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                  {paymentConfig.accountNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '100px' }}>
                  CLABE:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                  {paymentConfig.clabe}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '100px' }}>
                  Referencia:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {paymentReference}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* File Upload Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'rgba(237, 108, 2, 0.08)',
            borderLeft: '4px solid',
            borderColor: 'warning.main'
          }}
        >
          <Typography variant="overline" sx={{ color: 'warning.dark', fontWeight: 600, letterSpacing: 1, mb: 2, display: 'block' }}>
            Comprobante de Pago
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Sube una captura de pantalla o foto de tu transferencia bancaria (JPG, PNG o PDF)
          </Typography>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: paymentFile ? 'success.main' : 'grey.300',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              bgcolor: paymentFile ? 'rgba(76, 175, 80, 0.05)' : 'grey.50',
              transition: 'all 0.3s ease'
            }}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setPaymentFile(e.target.files[0])}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
              id="payment-file-upload"
            />
            {paymentFile && (
              <Typography variant="body2" sx={{ mt: 2, color: 'success.main', fontWeight: 500 }}>
                ✓ Archivo seleccionado: {paymentFile.name}
              </Typography>
            )}
          </Box>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={loading}
            size="large"
          >
            Volver
          </Button>
          <Button
            variant="contained"
            onClick={() => paymentFile && handleStep3Submit(paymentFile)}
            disabled={!paymentFile || loading}
            size="large"
          >
            {loading ? 'Enviando...' : 'Enviar Comprobante'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Function to reset the entire form and start over
  const handleNewBooking = () => {
    // Reset all state to initial values
    setActiveStep(0);
    setFormData({
      bookingForSelf: true,
      patientName: '',
      patientBirthDate: '',
      patientGender: '',
      patientPhone: '',
      patientPhoneCountryCode: '+52',
      patientEmail: '',
      bookerName: '',
      bookerPhone: '',
      bookerPhoneCountryCode: '+52',
      bookerEmail: '',
      bookerRelationship: '',
      serviceId: '',
      appointmentDate: '',
      appointmentTime: '',
      isFirstVisit: false
    });
    setHoldToken('');
    setPaymentFile(null);
    setTermsAccepted(false);
    setError('');
    setSlots([]);
    setPaymentConfig(null);
    setPaymentReference('');
    setAppointmentId(null);
  };

  // Render Step 4: Informed Consent
  const renderStep4 = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Consentimiento Informado
        </Typography>

        <Typography paragraph sx={{ mb: 2 }}>
          Yo, <strong>{formData.patientName}</strong>, acepto voluntariamente el procedimiento médico
          y firmo este consentimiento informado.
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
          He sido informado sobre los beneficios, riesgos y alternativas del procedimiento,
          y todas mis dudas fueron respondidas satisfactoriamente.
        </Typography>

        {/* Signature Canvas */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Firma del paciente:
          </Typography>
          <Box
            sx={{
              border: '2px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              bgcolor: 'grey.50',
              cursor: 'crosshair',
              touchAction: 'none'
            }}
          >
            <canvas
              ref={(ref) => setCanvasRef(ref)}
              width={600}
              height={200}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Box>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={clearSignature}
          >
            Borrar Firma
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={loading}
          >
            Volver
          </Button>
          <Button
            variant="contained"
            onClick={handleConsentSubmit}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Consentimiento'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Render Step 5: Success
  const renderStep5 = () => (
    <Box textAlign="center" sx={{ py: 4 }}>
      <Box sx={{ fontSize: '64px', mb: 2 }}>✅</Box>
      <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
        ¡Cita Reservada Exitosamente!
      </Typography>
      <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
        Tu cita está pendiente de confirmación.
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Recibirás un mensaje de WhatsApp cuando el administrador confirme tu reserva.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNewBooking}
          sx={{ minWidth: '200px' }}
        >
          Agendar Otra Cita
        </Button>
      </Box>

      <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.disabled' }}>
        Si tienes dudas, contacta a la clínica
      </Typography>
    </Box>
  );

  return (
    <>
      {/* Terms & Conditions Dialog */}
      <Dialog
        open={termsDialogOpen}
        onClose={() => setTermsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Términos y Condiciones - Clínica ProPiel
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            1. Política de Reservas
          </Typography>
          <Typography paragraph>
            Al realizar una reserva en Clínica ProPiel, usted acepta proporcionar información veraz y completa.
            La cita quedará en estado "pendiente" hasta que el administrador de la clínica la confirme.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            2. Política de Pagos
          </Typography>
          <Typography paragraph>
            • Se requiere el pago de un depósito del 50% del costo total del servicio para reservar su cita.
          </Typography>
          <Typography paragraph>
            • El comprobante de pago debe ser enviado en formato JPG, PNG o PDF.
          </Typography>
          <Typography paragraph>
            • El pago restante se realizará en la clínica el día de su cita.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            3. Política de Cancelaciones y Reembolsos
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: 'error.main' }}>
            ⚠️ NO SE REALIZAN REEMBOLSOS por cancelaciones.
          </Typography>
          <Typography paragraph>
            • Si necesita cancelar o reprogramar su cita, debe notificarlo con al menos 24 horas de anticipación.
          </Typography>
          <Typography paragraph>
            • En caso de cancelación con aviso previo, el depósito puede aplicarse a una cita futura dentro de los 30 días siguientes.
          </Typography>
          <Typography paragraph>
            • Las cancelaciones sin previo aviso o inasistencias resultarán en la pérdida total del depósito.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            4. Confirmación de Citas
          </Typography>
          <Typography paragraph>
            • Recibirá una notificación por WhatsApp cuando su cita sea confirmada por el administrador.
          </Typography>
          <Typography paragraph>
            • La clínica se reserva el derecho de rechazar o modificar reservas según disponibilidad.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            5. Responsabilidades del Paciente
          </Typography>
          <Typography paragraph>
            • Llegar puntualmente a su cita. Retrasos mayores a 15 minutos pueden resultar en la cancelación de la cita.
          </Typography>
          <Typography paragraph>
            • Informar sobre cualquier condición médica relevante antes del procedimiento.
          </Typography>
          <Typography paragraph>
            • Seguir las indicaciones post-tratamiento proporcionadas por el médico.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            6. Privacidad y Protección de Datos
          </Typography>
          <Typography paragraph>
            • Sus datos personales serán utilizados únicamente para fines de gestión de citas y atención médica.
          </Typography>
          <Typography paragraph>
            • La información proporcionada será tratada de manera confidencial conforme a la ley.
          </Typography>

          <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', color: 'text.secondary' }}>
            Al aceptar estos términos y condiciones, usted confirma haber leído y comprendido todas las políticas de Clínica ProPiel.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTermsDialogOpen(false)} variant="outlined">
            Cerrar
          </Button>
          <Button
            onClick={() => {
              setTermsAccepted(true);
              setTermsDialogOpen(false);
            }}
            variant="contained"
            color="primary"
          >
            Acepto los Términos
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 50%, #42a5f5 100%)',
          py: 4,
          width: '100%',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(66, 165, 245, 0.2) 0%, transparent 50%)',
            backdropFilter: 'blur(40px)',
            pointerEvents: 'none'
          }
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '95%',
            maxWidth: '1200px',
            mx: 2,
            position: 'relative',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Logo Header */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Logo width={200} variant="full" />
          </Box>

          <Typography variant="h5" gutterBottom align="center" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Sistema de Reservas en Línea
          </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}
        {activeStep === 3 && renderStep4()}
        {activeStep === 4 && renderStep5()}
      </Paper>
    </Box>
    </>
  );
}
