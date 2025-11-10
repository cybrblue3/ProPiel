// ===================================
// VALIDATION MIDDLEWARE
// ===================================

// Regex patterns
const patterns = {
  // Name: Letters, accents, spaces only (min 7 chars)
  name: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{7,}$/,
  // Phone: Exactly 10 digits
  phone: /^\d{10}$/,
  // Email: Standard email format
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Allowed email domains
const allowedEmailDomains = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'yahoo.com',
  'protonmail.com',
  'live.com',
  'me.com'
];

// Allowed educational and government domains
const allowedDomainPatterns = [
  /\.edu$/i,       // Educational institutions
  /\.edu\.[a-z]{2}$/i,  // e.g., .edu.mx
  /\.gob\.[a-z]{2}$/i   // e.g., .gob.mx government
];

/**
 * Validate full name
 */
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es requerido' };
  }

  const trimmed = name.trim();

  if (!patterns.name.test(trimmed)) {
    return {
      valid: false,
      error: 'Nombre inválido. Solo letras, acentos y espacios (mínimo 7 caracteres)'
    };
  }

  return { valid: true, value: trimmed };
};

/**
 * Validate phone number
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'El teléfono es requerido' };
  }

  const cleaned = phone.replace(/\D/g, ''); // Remove non-digits

  if (!patterns.phone.test(cleaned)) {
    return {
      valid: false,
      error: 'Teléfono inválido. Debe ser exactamente 10 dígitos'
    };
  }

  return { valid: true, value: cleaned };
};

/**
 * Validate email (optional but must be valid domain if provided)
 */
const validateEmail = (email) => {
  // Email is optional
  if (!email || email.trim() === '') {
    return { valid: true, value: null };
  }

  const trimmed = email.trim().toLowerCase();

  if (!patterns.email.test(trimmed)) {
    return {
      valid: false,
      error: 'Formato de email inválido'
    };
  }

  // Extract domain
  const domain = trimmed.split('@')[1];

  // Check if domain is in whitelist
  if (allowedEmailDomains.includes(domain)) {
    return { valid: true, value: trimmed };
  }

  // Check if domain matches patterns (edu, gob)
  const matchesPattern = allowedDomainPatterns.some(pattern => pattern.test(domain));
  if (matchesPattern) {
    return { valid: true, value: trimmed };
  }

  return {
    valid: false,
    error: `Email no permitido. Dominios aceptados: ${allowedEmailDomains.join(', ')}, o dominios .edu/.gob`
  };
};

/**
 * Validate birth date
 */
const validateBirthDate = (birthDate) => {
  if (!birthDate) {
    return { valid: false, error: 'La fecha de nacimiento es requerida' };
  }

  const date = new Date(birthDate);
  const today = new Date();

  // Check if valid date
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Fecha de nacimiento inválida' };
  }

  // Calculate age
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  // Age must be between 0 and 120
  if (age < 0 || age > 120) {
    return { valid: false, error: 'Edad fuera de rango válido (0-120 años)' };
  }

  return { valid: true, value: birthDate };
};

/**
 * Validate appointment date
 */
const validateAppointmentDate = (appointmentDate) => {
  if (!appointmentDate) {
    return { valid: false, error: 'La fecha de cita es requerida' };
  }

  // Parse date properly to avoid timezone issues
  // appointmentDate format: "2025-11-10"
  const [year, month, day] = appointmentDate.split('-').map(Number);

  // Create date in local timezone (not UTC)
  const date = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  // Check if valid date
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Fecha de cita inválida' };
  }

  // Cannot be in the past
  if (date < today) {
    return { valid: false, error: 'No se permiten citas en fechas pasadas' };
  }

  // Cannot be Sunday (0 = Sunday)
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) {
    return { valid: false, error: 'No se permiten citas los domingos' };
  }

  return { valid: true, value: appointmentDate };
};

/**
 * Validate gender
 */
const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other'];

  if (!validGenders.includes(gender)) {
    return { valid: false, error: 'Género inválido' };
  }

  return { valid: true, value: gender };
};

/**
 * Validate relationship (for proxy bookings)
 */
const validateRelationship = (relationship) => {
  if (!relationship) {
    return { valid: true, value: null }; // Optional field
  }

  const validRelationships = [
    'hijo', 'hija', 'madre', 'padre',
    'esposo', 'esposa', 'hermano', 'hermana', 'otro'
  ];

  if (!validRelationships.includes(relationship)) {
    return { valid: false, error: 'Relación inválida' };
  }

  return { valid: true, value: relationship };
};

/**
 * Validate booking for self (boolean)
 */
const validateBookingForSelf = (bookingForSelf) => {
  if (typeof bookingForSelf !== 'boolean') {
    return { valid: false, error: 'Tipo de reserva inválido' };
  }

  return { valid: true, value: bookingForSelf };
};

/**
 * Middleware: Validate Step 1 Data (Patient Form)
 */
const validateStep1 = (req, res, next) => {
  const {
    bookingForSelf,
    patientName,
    patientBirthDate,
    patientGender,
    patientPhone,
    patientEmail,
    bookerName,
    bookerPhone,
    bookerEmail,
    bookerRelationship,
    serviceId,
    appointmentDate,
    appointmentTime,
    isFirstVisit
  } = req.body;

  const errors = {};

  // Validate bookingForSelf
  const bookingForSelfValidation = validateBookingForSelf(bookingForSelf);
  if (!bookingForSelfValidation.valid) {
    errors.bookingForSelf = bookingForSelfValidation.error;
  }

  // Validate patient data
  const nameValidation = validateName(patientName);
  if (!nameValidation.valid) errors.patientName = nameValidation.error;

  const birthDateValidation = validateBirthDate(patientBirthDate);
  if (!birthDateValidation.valid) errors.patientBirthDate = birthDateValidation.error;

  const genderValidation = validateGender(patientGender);
  if (!genderValidation.valid) errors.patientGender = genderValidation.error;

  // Phone is only required if booking for self
  if (bookingForSelf) {
    const phoneValidation = validatePhone(patientPhone);
    if (!phoneValidation.valid) errors.patientPhone = phoneValidation.error;
  } else {
    // Patient phone is optional when someone else books
    if (patientPhone) {
      const phoneValidation = validatePhone(patientPhone);
      if (!phoneValidation.valid) errors.patientPhone = phoneValidation.error;
    }
  }

  // Patient email is always optional
  if (patientEmail) {
    const emailValidation = validateEmail(patientEmail);
    if (!emailValidation.valid) errors.patientEmail = emailValidation.error;
  }

  // If booking for someone else, validate booker data
  if (!bookingForSelf) {
    const bookerNameValidation = validateName(bookerName);
    if (!bookerNameValidation.valid) errors.bookerName = bookerNameValidation.error;

    const bookerPhoneValidation = validatePhone(bookerPhone);
    if (!bookerPhoneValidation.valid) errors.bookerPhone = bookerPhoneValidation.error;

    const bookerEmailValidation = validateEmail(bookerEmail);
    if (!bookerEmailValidation.valid) errors.bookerEmail = bookerEmailValidation.error;

    const relationshipValidation = validateRelationship(bookerRelationship);
    if (!relationshipValidation.valid) errors.bookerRelationship = relationshipValidation.error;
  }

  // Validate appointment data
  if (!serviceId || isNaN(parseInt(serviceId))) {
    errors.serviceId = 'Servicio inválido';
  }

  const appointmentDateValidation = validateAppointmentDate(appointmentDate);
  if (!appointmentDateValidation.valid) {
    errors.appointmentDate = appointmentDateValidation.error;
  }

  if (!appointmentTime) {
    errors.appointmentTime = 'La hora de cita es requerida';
  }

  // isFirstVisit validation (only for dermatology, will be checked in route)
  if (isFirstVisit !== undefined && typeof isFirstVisit !== 'boolean') {
    errors.isFirstVisit = 'Valor de primera visita inválido';
  }

  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

// ===================================
// EXPORT
// ===================================

module.exports = {
  validateName,
  validatePhone,
  validateEmail,
  validateBirthDate,
  validateAppointmentDate,
  validateGender,
  validateRelationship,
  validateBookingForSelf,
  validateStep1
};
